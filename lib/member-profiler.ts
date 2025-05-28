import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

/**
 * Interface para representar o perfil de um membro
 */
export interface MemberProfile {
  id: string;
  group_id: string;
  member_name: string;
  phone_number: string | null;
  profile_created_at: string;
  last_profiling_date: string;
  total_messages: number;
  total_words: number;
  total_media: number;
  profile_data: any;
  messages_file_path: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

/**
 * Verifica se um membro já foi fichado
 */
export const isMemberProfiled = async (groupId: string, memberName: string): Promise<boolean> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('member_profiles')
      .select('id')
      .eq('group_id', groupId)
      .eq('member_name', memberName)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar perfil de membro:', error);
    return false;
  }
};

/**
 * Busca o perfil de um membro
 */
export const getMemberProfile = async (groupId: string, memberName: string): Promise<MemberProfile | null> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('group_id', groupId)
      .eq('member_name', memberName)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil de membro:', error);
    return null;
  }
};

/**
 * Inicia o processo de fichamento de um membro
 */
export const profileMember = async (groupId: string, memberName: string): Promise<{
  success: boolean;
  profileId?: string;
  message?: string;
}> => {
  try {
    console.log(`Iniciando fichamento para membro: ${memberName} no grupo: ${groupId}`);
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Erro de sessão:', sessionError);
      throw new Error('Usuário não autenticado');
    }
    
    if (!sessionData.session) {
      console.error('Sessão não encontrada');
      throw new Error('Sessão de usuário não encontrada');
    }
    
    console.log('Usuário autenticado, chamando função RPC fichar_membro');
    
    // Chamar a função RPC criada no Supabase
    const { data, error } = await supabase
      .rpc('fichar_membro', {
        p_group_id: groupId,
        p_member_name: memberName
      });
    
    if (error) {
      console.error('Erro ao chamar RPC fichar_membro:', error);
      throw error;
    }
    
    console.log('Resposta da função fichar_membro:', data);
    
    if (!data || !data.success) {
      console.error('Falha na resposta da função:', data);
      throw new Error(data?.message || 'Falha ao fichar membro');
    }
    
    // Iniciamos o processamento em background
    setTimeout(() => {
      processMessageFiles(groupId, memberName, data.profile_id, data.file_path);
    }, 1000);
    
    return {
      success: true,
      profileId: data.profile_id,
      message: 'Processo de fichamento iniciado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao fichar membro:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

/**
 * Processa os arquivos de mensagens para extrair as mensagens específicas de um membro
 */
const processMessageFiles = async (
  groupId: string, 
  memberName: string, 
  profileId: string,
  targetFilePath: string
) => {
  console.log(`Iniciando processamento de arquivos para membro: ${memberName}, profileId: ${profileId}`);
  try {
    const supabase = createClient();
    
    // Atualizar status para 'processing'
    const { error: updateError } = await supabase
      .from('member_profiles')
      .update({ status: 'processing' })
      .eq('id', profileId);
      
    if (updateError) {
      console.error('Erro ao atualizar status para processing:', updateError);
      throw updateError;
    }
    
    // Buscar todos os arquivos de mensagens para o grupo
    const { data: messageFiles, error: filesError } = await supabase
      .from('group_message_files')
      .select('*')
      .eq('group_id', groupId)
      .order('file_date', { ascending: true });
    
    if (filesError) {
      console.error('Erro ao buscar arquivos de mensagens:', filesError);
      throw filesError;
    }
    
    if (!messageFiles || messageFiles.length === 0) {
      console.error('Nenhum arquivo encontrado para o grupo');
      throw new Error('Nenhum arquivo de mensagem encontrado para este grupo');
    }
    
    console.log(`Encontrados ${messageFiles.length} arquivos para processamento`);
    
    // Normalizar o nome do membro para comparação
    const normalizedMemberName = memberName.trim();
    
    // String para armazenar todas as mensagens do membro
    let allMemberMessages = `Todas as mensagens de "${memberName}" no grupo:\n\n`;
    let totalMessages = 0;
    let totalWords = 0;
    let totalMedia = 0;
    
    // Processar cada arquivo para extrair as mensagens do membro
    for (const file of messageFiles) {
      console.log(`Processando arquivo: ${file.storage_path}`);
      
      // Baixar o arquivo do storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from(file.bucket_id)
        .download(file.storage_path);
      
      if (downloadError) {
        console.error(`Erro ao baixar arquivo ${file.storage_path}:`, downloadError);
        continue; // Pular este arquivo
      }
      
      // Converter o blob para texto
      const content = await fileData.text();
      
      // Extrair mensagens do membro específico
      const memberMessages = extractMemberMessages(content, normalizedMemberName);
      
      if (memberMessages.messages.length > 0) {
        allMemberMessages += `--- Mensagens de ${format(new Date(file.file_date), 'dd/MM/yyyy')} ---\n\n`;
        allMemberMessages += memberMessages.messages.join('\n\n');
        allMemberMessages += '\n\n';
        
        totalMessages += memberMessages.messages.length;
        totalWords += memberMessages.wordCount;
        totalMedia += memberMessages.mediaCount;
      }
    }
    
    // Finalizar o conteúdo do arquivo
    allMemberMessages += `\n--- Fim das mensagens ---\n`;
    allMemberMessages += `Total de mensagens: ${totalMessages}\n`;
    allMemberMessages += `Total de palavras: ${totalWords}\n`;
    allMemberMessages += `Total de mídias: ${totalMedia}\n`;
    
    console.log(`Salvando arquivo de mensagens em: ${targetFilePath}`);
    
    // Salvar o arquivo com todas as mensagens do membro - diretamente para o bucket existente
    try {
      const { error: uploadError } = await supabase
        .storage
        .from('member_messages')
        .upload(targetFilePath, new Blob([allMemberMessages], { type: 'text/plain' }), {
          contentType: 'text/plain',
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload do arquivo de mensagens:', uploadError);
        // Se não conseguir com o caminho original, tentar com um caminho simplificado
        const simplePath = `${groupId}_${memberName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`;
        console.log(`Tentando upload com caminho simplificado: ${simplePath}`);
        
        const { error: retryError } = await supabase
          .storage
          .from('member_messages')
          .upload(simplePath, new Blob([allMemberMessages], { type: 'text/plain' }), {
            contentType: 'text/plain',
            upsert: true
          });
        
        if (retryError) {
          throw new Error(`Falha no upload de arquivo: ${retryError.message}`);
        }
        
        // Atualizar o caminho no banco de dados
        await supabase
          .from('member_profiles')
          .update({ messages_file_path: simplePath })
          .eq('id', profileId);
          
        console.log(`Upload realizado com sucesso usando caminho simplificado: ${simplePath}`);
      } else {
        console.log(`Upload concluído com sucesso: ${targetFilePath}`);
      }
    } catch (uploadError) {
      console.error('Erro fatal no upload:', uploadError);
      throw uploadError;
    }
    
    console.log(`Atualizando perfil do membro com estatísticas.`);
    
    // Atualizar o perfil com as estatísticas e status
    const { error: finalUpdateError } = await supabase
      .from('member_profiles')
      .update({
        total_messages: totalMessages,
        total_words: totalWords,
        total_media: totalMedia,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);
      
    if (finalUpdateError) {
      console.error('Erro ao atualizar perfil com estatísticas:', finalUpdateError);
      throw finalUpdateError;
    }
    
    console.log(`Processamento concluído com sucesso para ${memberName}. Mensagens: ${totalMessages}`);
    
  } catch (error) {
    console.error('Erro ao processar arquivos de mensagens:', error);
    
    try {
      // Atualizar status para 'error' em caso de falha
      const supabase = createClient();
      await supabase
        .from('member_profiles')
        .update({ 
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);
    } catch (updateError) {
      console.error('Erro adicional ao tentar atualizar status para error:', updateError);
    }
  }
};

/**
 * Extrai mensagens de um membro específico de um conteúdo de chat
 */
const extractMemberMessages = (
  content: string, 
  memberName: string
): { 
  messages: string[], 
  wordCount: number, 
  mediaCount: number 
} => {
  const result = {
    messages: [] as string[],
    wordCount: 0,
    mediaCount: 0
  };
  
  // Padrões para detectar mídia
  const mediaPatterns = [
    "figurinha omitida", 
    "imagem ocultada", 
    "GIF omitido", 
    "áudio omitido", 
    "vídeo omitido",
    "‎figurinha omitida",
    "‎imagem ocultada",
    "‎GIF omitido",
    "‎áudio omitido",
    "‎vídeo omitido",
    "<Mídia ocultada>"
  ];
  
  // Regex para extrair mensagens do chat
  const messageRegex = /\[(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+)(?:: (.*))?/gm;
  let match;
  
  while ((match = messageRegex.exec(content)) !== null) {
    const [fullMessage, date, time, user, messageContent = ""] = match;
    
    // Verificar se a mensagem é do membro que estamos procurando
    if (user.trim() === memberName) {
      // Adicionar a mensagem completa ao resultado
      result.messages.push(`[${date}, ${time}] ${messageContent}`);
      
      // Verificar se é uma mídia
      const isMedia = mediaPatterns.some(pattern => messageContent.includes(pattern));
      
      if (isMedia) {
        result.mediaCount++;
      } else {
        // Contar palavras
        const words = messageContent.trim().split(/\s+/).length;
        result.wordCount += words;
      }
    }
  }
  
  return result;
}; 