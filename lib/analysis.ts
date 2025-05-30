import { createClient } from '@/lib/supabase/client';
import { format, parse, isBefore, isAfter, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para as estatísticas diárias
export interface DailyStats {
  date: string;
  total_messages: number;
  active_members: number;
  hourly_activity: Record<string, number>;
}

// Interface para estatísticas de membros
export interface MemberStats {
  id: string;
  name: string;
  message_count: number;
  word_count: number;
  media_count: number;
  emoji_count?: number;
  links_count?: number;
  replies_count?: number;
  mentions_count?: number;
  avg_words_per_message: number;
  first_message_at?: Date;
  last_message_at?: Date;
  dailyStats: {
    date: string;
    message_count: number;
  }[];
}

// Interface para estatísticas detalhadas
export interface DetailedStats {
  daily_stats: DailyStats[];
  member_stats: MemberStats[];
  total_messages: number;
  total_words: number;
  total_media: number;
  active_members: number;
  hourly_activity: Record<string, number>;
  avg_words_per_message: number;
  days_analyzed: number;
}

// Interface para as estatísticas de membro do dia
interface MemberDayStat {
  name: string;
  normalized_name: string;
  message_count: number;
  word_count: number;
  media_count: number;
  avg_message_length?: number;
  avg_words_per_message?: number;
  first_message_time?: string | null;
  last_message_time?: string | null;
  hourly_activity?: Record<string, number>;
}

// Interface para o resultado da função get_period_stats
interface PeriodStats {
  start_date: string;
  end_date: string;
  total_messages: number;
  total_words: number;
  total_media: number;
  days_analyzed: number;
  avg_words_per_message: number;
  active_members: number;
  hourly_activity: Record<string, number>;
  daily_stats: DailyStats[];
  members_stats: {
    name: string;
    message_count: number;
    word_count: number;
    media_count: number;
    avg_words_per_message: number;
  }[];
}

// Função para analisar um arquivo de chat do WhatsApp
const analyzeWhatsAppChatFile = (content: string): {
  messagesByUser: Record<string, number>;
  messagesByDate: Record<string, number>;
  wordsByUser: Record<string, number>;
  mediaByUser: Record<string, number>;
  hourlyActivity: Record<string, number>;
  emojisByUser: Record<string, number>;
  linksByUser: Record<string, number>;
  repliesByUser: Record<string, number>;
  mentionsByUser: Record<string, number>;
  messageLengthByUser: Record<string, number[]>;
  membersActive: Set<string>;
  totalMessages: number;
  firstTimeByUser: Record<string, Date>;
  lastTimeByUser: Record<string, Date>;
  hourlyActivityByUser: Record<string, Record<string, number>>;
} => {
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

  // Padrões para mensagens do sistema
  const systemPatterns = [
    "entrou usando o link",
    "criou este grupo",
    "saiu",
    "adicionou",
    "removeu",
    "foi adicionado"
  ];

  // Padrão para detectar emojis
  const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  
  // Padrão para detectar links
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  
  // Padrão para detectar respostas
  const replyRegex = /^\s*Respondendo a\s|\s*Em resposta a\s/i;
  
  // Padrão para detectar menções
  const mentionRegex = /@[a-zA-Z0-9_]+/g;

  // Inicializar contadores
  const messagesByUser: Record<string, number> = {};
  const messagesByDate: Record<string, number> = {};
  const wordsByUser: Record<string, number> = {};
  const mediaByUser: Record<string, number> = {};
  const hourlyActivity: Record<string, number> = {};
  const emojisByUser: Record<string, number> = {};
  const linksByUser: Record<string, number> = {};
  const repliesByUser: Record<string, number> = {};
  const mentionsByUser: Record<string, number> = {};
  const messageLengthByUser: Record<string, number[]> = {};
  const hourlyActivityByUser: Record<string, Record<string, number>> = {};
  const membersActive = new Set<string>();
  const firstTimeByUser: Record<string, Date> = {};
  const lastTimeByUser: Record<string, Date> = {};
  let totalMessages = 0;

  // Regex para extrair mensagens do chat
  const messageRegex = /\[(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+)(?:: (.*))?/gm;
  let match;

  while ((match = messageRegex.exec(content)) !== null) {
    const [fullMessage, date, time, user, messageContent = ""] = match;
    
    // Ignorar mensagens do sistema
    if (systemPatterns.some(pattern => messageContent.includes(pattern) || fullMessage.includes(pattern))) {
      continue;
    }

    // Incrementar contador de mensagens
    totalMessages++;
    
    // Registrar mensagem por usuário
    messagesByUser[user] = (messagesByUser[user] || 0) + 1;
    
    // Registrar mensagem por data
    messagesByDate[date] = (messagesByDate[date] || 0) + 1;
    
    // Registrar hora da mensagem
    const hour = time.split(':')[0];
    hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    
    // Registrar atividade horária por usuário
    if (!hourlyActivityByUser[user]) {
      hourlyActivityByUser[user] = {};
    }
    hourlyActivityByUser[user][hour] = (hourlyActivityByUser[user][hour] || 0) + 1;
    
    // Adicionar usuário ativo
    membersActive.add(user);

    // Registrar horário da primeira e última mensagem
    const messageDateTime = parse(`${date} ${time}`, 'dd/MM/yyyy HH:mm:ss', new Date());
    
    if (!firstTimeByUser[user] || isBefore(messageDateTime, firstTimeByUser[user])) {
      firstTimeByUser[user] = messageDateTime;
    }
    
    if (!lastTimeByUser[user] || isAfter(messageDateTime, lastTimeByUser[user])) {
      lastTimeByUser[user] = messageDateTime;
    }

    // Verificar se é mídia
    const isMedia = mediaPatterns.some(pattern => messageContent.includes(pattern));
    
    if (isMedia) {
      mediaByUser[user] = (mediaByUser[user] || 0) + 1;
    } else if (messageContent) {
      // Contar palavras para mensagens não-mídia
      const words = messageContent.trim().split(/\s+/).length;
      wordsByUser[user] = (wordsByUser[user] || 0) + words;
      
      // Contar comprimento da mensagem
      if (!messageLengthByUser[user]) {
        messageLengthByUser[user] = [];
      }
      messageLengthByUser[user].push(messageContent.length);
      
      // Contar emojis
      const emojis = messageContent.match(emojiRegex);
      if (emojis) {
        emojisByUser[user] = (emojisByUser[user] || 0) + emojis.length;
      }
      
      // Contar links
      const links = messageContent.match(linkRegex);
      if (links) {
        linksByUser[user] = (linksByUser[user] || 0) + links.length;
      }
      
      // Contar respostas
      if (replyRegex.test(messageContent)) {
        repliesByUser[user] = (repliesByUser[user] || 0) + 1;
      }
      
      // Contar menções (@username)
      const mentions = messageContent.match(mentionRegex);
      if (mentions) {
        mentionsByUser[user] = (mentionsByUser[user] || 0) + mentions.length;
      }
    }
  }

  return {
    messagesByUser,
    messagesByDate,
    wordsByUser,
    mediaByUser,
    hourlyActivity,
    emojisByUser,
    linksByUser,
    repliesByUser,
    mentionsByUser,
    messageLengthByUser,
    hourlyActivityByUser,
    membersActive,
    totalMessages,
    firstTimeByUser,
    lastTimeByUser
  };
};

// Função para recuperar e analisar os arquivos de chat do WhatsApp
export const analyzeWhatsAppChat = async (
  groupId: string,
  startDate: Date,
  endDate: Date
): Promise<DetailedStats> => {
  try {
    console.log(`Iniciando análise para período: ${format(startDate, 'dd/MM/yyyy')} até ${format(endDate, 'dd/MM/yyyy')}`);
    const supabase = createClient();
    
    // Formato das datas para SQL
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    // Não usaremos mais resumos de período existentes
    // Buscar quais dias já foram processados para o período
    const { data: existingDays } = await supabase
      .from('daily_analytics')
      .select('date')
      .eq('group_id', groupId)
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .is('period_summary', false);
      
    const processedDates = new Set(existingDays?.map(day => day.date) || []);
    console.log(`Dias já processados: ${Array.from(processedDates).join(', ')}`);
    
    // Buscar arquivos de mensagens no Storage para o período
    const { data: messageFiles, error: fileError } = await supabase
      .from('group_message_files')
      .select('*')
      .eq('group_id', groupId)
      .gte('file_date', formattedStartDate)
      .lte('file_date', formattedEndDate)
      .order('file_date', { ascending: true });
    
    if (fileError) {
      console.error('Erro ao buscar arquivos:', fileError);
      throw new Error(`Erro ao buscar arquivos: ${fileError.message}`);
    }
    
    if (!messageFiles || messageFiles.length === 0) {
      console.log('Nenhum arquivo encontrado para o período.');
      // Retornar objeto vazio
      return {
        daily_stats: [],
        member_stats: [],
        total_messages: 0,
        total_words: 0,
        total_media: 0,
        active_members: 0,
        hourly_activity: {},
        avg_words_per_message: 0,
        days_analyzed: 0
      };
    }
    
    console.log(`Encontrados ${messageFiles.length} arquivos para análise.`);
    
    // Inicializar dados para o resumo final
    let totalMessages = 0;
    let totalWords = 0;
    let totalMedia = 0;
    const dailyStats: DailyStats[] = [];
    const memberStatsByName: Map<string, MemberStats> = new Map();
    const globalMembersActiveSet = new Set<string>();
    let hourlyActivity: Record<string, number> = {};
    
    // Processar somente arquivos para dias que ainda não foram analisados
    const filesToProcess = messageFiles.filter(file => !processedDates.has(file.file_date));
    
    console.log(`Processando ${filesToProcess.length} arquivos que ainda não foram analisados.`);
    
    // Recuperar os registros já analisados para incluir nos resultados
    if (processedDates.size > 0) {
      const { data: existingAnalytics } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('group_id', groupId)
        .in('date', Array.from(processedDates))
        .is('period_summary', false);
      
      if (existingAnalytics && existingAnalytics.length > 0) {
        // Incluir os dados já analisados nos totais
        for (const day of existingAnalytics) {
          totalMessages += day.total_messages || 0;
          totalWords += day.total_words || 0;
          totalMedia += day.total_media || 0;
          
          // Adicionar às estatísticas diárias
          const dateParts = day.date.split('-');
          const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // Formato DD/MM/YYYY
          
          dailyStats.push({
            date: formattedDate,
            total_messages: day.total_messages || 0,
            active_members: day.active_members || 0,
            hourly_activity: day.hourly_activity || {}
          });
          
          // Combinar atividade por hora
          if (day.hourly_activity) {
            Object.entries(day.hourly_activity).forEach(([hour, count]) => {
              hourlyActivity[hour] = (hourlyActivity[hour] || 0) + (count as number);
            });
          }
          
          // Processar dados de membros
          if (day.members_stats && Array.isArray(day.members_stats)) {
            day.members_stats.forEach((memberDay: any) => {
              if (!memberDay.name) return;
              
              // Adicionar ao conjunto global de membros
              globalMembersActiveSet.add(memberDay.name);
              
              // Atualizar ou criar estatísticas para este membro
              if (!memberStatsByName.has(memberDay.name)) {
                memberStatsByName.set(memberDay.name, {
                  id: memberDay.name,
                  name: memberDay.name,
                  message_count: 0,
                  word_count: 0,
                  media_count: 0,
                  avg_words_per_message: 0,
                  dailyStats: []
                });
              }
              
              const member = memberStatsByName.get(memberDay.name)!;
              member.message_count += memberDay.message_count || 0;
              member.word_count += memberDay.word_count || 0;
              member.media_count += memberDay.media_count || 0;
    
              // Adicionar estatística diária
              member.dailyStats.push({
                date: formattedDate,
                message_count: memberDay.message_count || 0
              });
            });
          }
        }
      }
    }
    
    // Processar cada arquivo que ainda não foi analisado
    for (const file of filesToProcess) {
      console.log(`Processando arquivo: ${file.storage_path} para data ${file.file_date}`);
      
      // Baixar o arquivo do Storage
      const { data, error: downloadError } = await supabase
        .storage
        .from(file.bucket_id)
        .download(file.storage_path);
      
      if (downloadError) {
        console.error(`Erro ao baixar arquivo ${file.storage_path}:`, downloadError);
        continue; // Pular este arquivo
      }
      
      // Converter o blob para texto
      const content = await data.text();
      
      // Analisar o conteúdo do chat
      const fileStats = analyzeWhatsAppChatFile(content);
      
      // Calcular data do arquivo no formato DD/MM/YYYY
      const fileDateParts = file.file_date.split('-'); // YYYY-MM-DD
      const fileDate = `${fileDateParts[2]}/${fileDateParts[1]}/${fileDateParts[0]}`; // DD/MM/YYYY
      
      // Verificar se já existe análise para este dia
      const { data: existingAnalysis } = await supabase
        .from('daily_analytics')
        .select('id')
        .eq('group_id', groupId)
        .eq('date', file.file_date)
        .is('period_summary', false)
        .maybeSingle();
      
      if (existingAnalysis) {
        console.log(`Dia ${file.file_date} já analisado anteriormente, pulando.`);
        continue;
      }
      
      // Atualizar o banco de dados com as estatísticas deste dia
      const dailyResult = await processAndSaveDayStats(
        groupId,
        fileDate,
        file.file_date, // SQL formato (YYYY-MM-DD)
        fileStats
      );
        
      // Adicionar às estatísticas diárias
      dailyStats.push({
        date: fileDate,
        total_messages: dailyResult.dailyMessageCount,
        active_members: dailyResult.activeMembers,
        hourly_activity: fileStats.hourlyActivity
      });
      
      // Atualizar totais
      totalMessages += dailyResult.dailyMessageCount;
      totalWords += dailyResult.totalWordsForDay;
      totalMedia += dailyResult.totalMediaForDay;
      
      // Combinar atividade por hora
      Object.entries(fileStats.hourlyActivity).forEach(([hour, count]) => {
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + count;
      });
      
      // Adicionar membros ao conjunto global
      fileStats.membersActive.forEach(member => globalMembersActiveSet.add(member));
      
      // Atualizar estatísticas por membro
      for (const [name, messageCount] of Object.entries(fileStats.messagesByUser)) {
        if (!memberStatsByName.has(name)) {
          memberStatsByName.set(name, {
            id: name,
            name,
            message_count: 0,
            word_count: 0,
            media_count: 0,
            avg_words_per_message: 0,
            dailyStats: []
          });
        }
        
        const member = memberStatsByName.get(name)!;
        member.message_count += messageCount;
        member.word_count += fileStats.wordsByUser[name] || 0;
        member.media_count += fileStats.mediaByUser[name] || 0;
        
        // Adicionar estatística diária
        member.dailyStats.push({
          date: fileDate,
          message_count: messageCount
        });
      }
    }
    
    // Finalizar estatísticas por membro
    const memberStats: MemberStats[] = Array.from(memberStatsByName.values()).map(member => {
      // Calcular média de palavras por mensagem
      const nonMediaMessages = member.message_count - member.media_count;
      member.avg_words_per_message = nonMediaMessages > 0 ? member.word_count / nonMediaMessages : 0;
      return member;
    });
      
    // Ordenar por quantidade de mensagens
    memberStats.sort((a, b) => b.message_count - a.message_count);
    
    // Calcular média de palavras por mensagem
    const totalNonMediaMessages = totalMessages - totalMedia;
    const avgWordsPerMessage = totalNonMediaMessages > 0 ? totalWords / totalNonMediaMessages : 0;
    
    // Atualizar o resumo geral do grupo
    try {
      const groupStatsUpdate = {
        group_id: groupId,
        total_messages: totalMessages,
        total_words: totalWords,
        total_media: totalMedia,
        active_members: globalMembersActiveSet.size,
        avg_words_per_message: avgWordsPerMessage,
        updated_at: new Date().toISOString()
      };
      
      // Verificar se já existe um registro para este grupo
      const { data: existingGroupAnalytics } = await supabase
        .from('group_analytics')
        .select('id')
        .eq('group_id', groupId)
        .maybeSingle();
      
      if (existingGroupAnalytics) {
        // Atualizar o registro existente
        await supabase
          .from('group_analytics')
          .update(groupStatsUpdate)
          .eq('id', existingGroupAnalytics.id);
      } else {
        // Upsert para evitar duplicidade
        await supabase
          .from('group_analytics')
          .upsert(groupStatsUpdate, { onConflict: 'group_id' });
      }
    } catch (error) {
      console.error('Erro ao atualizar group_analytics:', error);
    }
    
    // Removemos toda a lógica de criação de resumos de período aqui
    
    return {
      daily_stats: dailyStats,
      member_stats: memberStats,
      total_messages: totalMessages,
      total_words: totalWords,
      total_media: totalMedia,
      active_members: globalMembersActiveSet.size,
      hourly_activity: hourlyActivity,
      avg_words_per_message: avgWordsPerMessage,
      days_analyzed: dailyStats.length
    };
  } catch (error) {
    console.error('Erro na análise do chat:', error);
    throw new Error(`Erro ao analisar chat: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Função para processar e salvar estatísticas de um único dia
const processAndSaveDayStats = async (
  groupId: string,
  fileDate: string, // DD/MM/YYYY
  sqlDate: string,  // YYYY-MM-DD
  fileStats: ReturnType<typeof analyzeWhatsAppChatFile>
) => {
  try {
    const supabase = createClient();
    
    // Calcular estatísticas totais para este dia
    const dailyMessageCount = Object.values(fileStats.messagesByUser).reduce((sum, count) => sum + count, 0);
    const totalWordsForDay = Object.values(fileStats.wordsByUser).reduce((sum, count) => sum + count, 0);
    const totalMediaForDay = Object.values(fileStats.mediaByUser).reduce((sum, count) => sum + count, 0);
    
    // Encontrar a hora com mais atividade
    let mostActiveHour = '00';
    let peakActivityCount = 0;
      
      Object.entries(fileStats.hourlyActivity).forEach(([hour, count]) => {
      if (count > peakActivityCount) {
        mostActiveHour = hour;
        peakActivityCount = count;
      }
    });
    
    // Calcular o comprimento médio de mensagem (excluindo mídia)
    let totalMessageLength = 0;
    let totalNonMediaMessages = 0;
    
    Object.entries(fileStats.messageLengthByUser).forEach(([user, lengths]) => {
      totalMessageLength += lengths.reduce((sum, length) => sum + length, 0);
      totalNonMediaMessages += lengths.length;
    });
    
    const avgMessageLength = totalNonMediaMessages > 0 ? totalMessageLength / totalNonMediaMessages : 0;
    
    // Criar conjunto de membros ativos para este dia
    const membersActiveSet = new Set<string>(Object.keys(fileStats.messagesByUser));
    
    // Preparar dados de membros como JSON para armazenar na coluna members_stats
    const membersStats = Array.from(membersActiveSet).map(memberName => {
      // Dados específicos do membro para este dia
      const memberMessageCount = fileStats.messagesByUser[memberName] || 0;
      const memberWordCount = fileStats.wordsByUser[memberName] || 0;
      const memberMediaCount = fileStats.mediaByUser[memberName] || 0;
      
      // Dados de horário de mensagens
      const firstMessageTime = fileStats.firstTimeByUser[memberName] 
        ? format(fileStats.firstTimeByUser[memberName], 'HH:mm:ss') 
        : null;
      
      const lastMessageTime = fileStats.lastTimeByUser[memberName] 
        ? format(fileStats.lastTimeByUser[memberName], 'HH:mm:ss') 
        : null;
      
      // Calcular média de palavras por mensagem
      const nonMediaMessages = memberMessageCount - memberMediaCount;
      const avgWordsPerMessage = nonMediaMessages > 0 ? memberWordCount / nonMediaMessages : 0;
          
      // Calcular comprimento médio de mensagem
      const messageLengths = fileStats.messageLengthByUser[memberName] || [];
      const avgMemberMessageLength = messageLengths.length > 0 
        ? messageLengths.reduce((sum, length) => sum + length, 0) / messageLengths.length 
        : 0;
      
      // Normalizar o nome do membro
      const normalizedName = memberName
        .replace(/[^\w\s]/g, '') // Remove caracteres especiais
        .trim()
        .substring(0, 100); // Limita o tamanho do nome
      
      return {
        name: memberName,
        normalized_name: normalizedName || 'Usuário Anônimo',
        message_count: memberMessageCount,
        word_count: memberWordCount,
        media_count: memberMediaCount,
        avg_message_length: avgMemberMessageLength,
        avg_words_per_message: avgWordsPerMessage,
        first_message_time: firstMessageTime,
        last_message_time: lastMessageTime,
        hourly_activity: fileStats.hourlyActivityByUser[memberName] || {}
      };
    });
    
    // Verificar novamente se já existe um registro para este dia para evitar duplicatas
    const { data: existingAnalysis } = await supabase
      .from('daily_analytics')
      .select('id')
      .eq('group_id', groupId)
      .eq('date', sqlDate)
      .is('period_summary', false)
      .maybeSingle();
    
    if (existingAnalysis) {
      console.log(`Dia ${sqlDate} já tem registro, pulando inserção.`);
    } else {
      // Inserir ou atualizar registro (upsert)
      console.log(`Salvando análise para ${sqlDate}`);
      const { error } = await supabase
        .from('daily_analytics')
              .upsert({
                group_id: groupId,
          date: sqlDate,
          total_messages: dailyMessageCount,
          active_members: membersActiveSet.size,
          total_words: totalWordsForDay,
          total_media: totalMediaForDay,
          media_count: totalMediaForDay,
          avg_message_length: avgMessageLength,
          most_active_hour: mostActiveHour,
          peak_activity_count: peakActivityCount,
          hourly_activity: fileStats.hourlyActivity || {},
          members_stats: membersStats,
          period_summary: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'group_id,date' });
      if (error && error.code !== '23505') {
        // Só logar erro se não for duplicidade
        console.error(`Erro ao inserir análise para ${sqlDate}:`, error);
      }
    }
    
    return {
      dailyMessageCount,
      totalWordsForDay,
      totalMediaForDay,
      activeMembers: membersActiveSet.size
    };
  } catch (error) {
    console.error(`Erro ao processar o dia ${fileDate}:`, error);
    // Em caso de erro, retornar valores vazios para não quebrar o fluxo
    return {
      dailyMessageCount: 0,
      totalWordsForDay: 0,
      totalMediaForDay: 0,
      activeMembers: 0
    };
  }
};

// Função para buscar estatísticas pré-processadas
export const fetchPreProcessedStats = async (
  groupId: string,
  startDate: Date,
  endDate: Date
): Promise<DetailedStats> => {
  try {
    console.log(`Buscando dados para período: ${format(startDate, 'dd/MM/yyyy')} até ${format(endDate, 'dd/MM/yyyy')}`);
    
    // Formato das datas para SQL
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    // Buscar diretamente das tabelas sem tentar usar a função RPC que não existe mais
    return await fetchStatsDirectlyFromTables(groupId, formattedStartDate, formattedEndDate);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      daily_stats: [],
      member_stats: [],
      total_messages: 0,
      total_words: 0,
      total_media: 0,
      active_members: 0,
      hourly_activity: {},
      avg_words_per_message: 0,
      days_analyzed: 0
    };
  }
};

// Função alternativa para buscar dados diretamente das tabelas
const fetchStatsDirectlyFromTables = async (
  groupId: string,
  startDate: string,
  endDate: string  
): Promise<DetailedStats> => {
  try {
    const supabase = createClient();
    
    // Buscar dados diários
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('group_id', groupId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('period_summary', false)
      .order('date', { ascending: true });
    
    if (dailyError) {
      console.error('Erro ao buscar dados diários:', dailyError);
      throw dailyError;
    }
    
    // Preparar estatísticas agregadas
    let totalMessages = 0;
    let totalWords = 0;
    let totalMedia = 0;
    const activeMembers = new Set<string>();
    const hourlyActivity: Record<string, number> = {};
    const memberDataMap: Record<string, {
      name: string;
      message_count: number;
      word_count: number;
      media_count: number;
      dailyStats: { date: string; message_count: number }[];
    }> = {};
    
    // Transformar dados diários em formato esperado
    const dailyStats: DailyStats[] = dailyData.map(day => {
      totalMessages += day.total_messages || 0;
      totalWords += day.total_words || 0;
      totalMedia += day.total_media || 0;
      
      // Agregar atividade por hora
      const dayHourlyActivity = day.hourly_activity || {};
      Object.entries(dayHourlyActivity).forEach(([hour, count]) => {
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + (count as number);
      });
      
      // Agregar dados de membros
      (day.members_stats || []).forEach((member: any) => {
        const memberName = member.name;
        if (!memberDataMap[memberName]) {
          memberDataMap[memberName] = {
            name: memberName,
            message_count: 0,
            word_count: 0,
            media_count: 0,
            dailyStats: []
          };
        }
        
        // Adicionar dados deste dia para o membro
        memberDataMap[memberName].message_count += member.message_count || 0;
        memberDataMap[memberName].word_count += member.word_count || 0;
        memberDataMap[memberName].media_count += member.media_count || 0;
        
        // Adicionar à lista de membros ativos
        activeMembers.add(memberName);
        
        // Adicionar estatística diária para este membro
        // Criar data local para evitar problemas de timezone
        const [year, month, dayNum] = day.date.split('-').map(Number);
        const localDate = new Date(year, month - 1, dayNum);
        
        memberDataMap[memberName].dailyStats.push({
          date: format(localDate, 'dd/MM/yyyy'),
          message_count: member.message_count || 0
      });
    });
    
      // Retornar objeto formatado para dados diários
      // Criar data local para evitar problemas de timezone
      const [year, month, dayNum] = day.date.split('-').map(Number);
      const localDate = new Date(year, month - 1, dayNum);
      
      return {
        date: format(localDate, 'dd/MM/yyyy'),
        total_messages: day.total_messages || 0,
        active_members: day.active_members || 0,
        hourly_activity: day.hourly_activity || {}
      };
    });
    
    // Calcular média de palavras por mensagem
    const nonMediaMessages = totalMessages - totalMedia;
    const avgWordsPerMessage = nonMediaMessages > 0 ? totalWords / nonMediaMessages : 0;
    
    // Formatar estatísticas de membros
    const memberStats: MemberStats[] = Object.values(memberDataMap).map((member, index) => ({
      id: `member-${index}`,
      name: member.name,
      message_count: member.message_count,
      word_count: member.word_count,
      media_count: member.media_count,
      avg_words_per_message: (member.message_count - member.media_count) > 0 
        ? member.word_count / (member.message_count - member.media_count) 
        : 0,
      dailyStats: member.dailyStats
    }));
      
    // Ordenar por número de mensagens decrescente
    memberStats.sort((a, b) => b.message_count - a.message_count);
    
    return {
      daily_stats: dailyStats,
      member_stats: memberStats,
      total_messages: totalMessages,
      total_words: totalWords,
      total_media: totalMedia,
      active_members: activeMembers.size,
      hourly_activity: hourlyActivity,
      avg_words_per_message: avgWordsPerMessage,
      days_analyzed: dailyData.length
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas diretamente das tabelas:', error);
    return {
      daily_stats: [],
      member_stats: [],
      total_messages: 0,
      total_words: 0,
      total_media: 0,
      active_members: 0,
      hourly_activity: {},
      avg_words_per_message: 0,
      days_analyzed: 0
    };
  }
};

// Função para buscar as datas disponíveis para um grupo
export const fetchAvailableDates = async (groupId: string): Promise<{
  minDate: Date | null;
  maxDate: Date | null;
  availableDates: Date[];
}> => {
  try {
    const supabase = createClient();
    
    // Buscar datas de ambas as tabelas para garantir que temos todos os dados disponíveis
    const [filesResult, analyticsResult] = await Promise.all([
      // Buscar arquivos de mensagens
      supabase
        .from('group_message_files')
        .select('file_date')
        .eq('group_id', groupId)
        .order('file_date', { ascending: true }),
      
      // Buscar análises processadas
      supabase
        .from('daily_analytics')
        .select('date')
        .eq('group_id', groupId)
        .eq('period_summary', false)
        .order('date', { ascending: true })
    ]);
    
    const allDates = new Set<string>();
    
    // Adicionar datas dos arquivos
    if (filesResult.data && !filesResult.error) {
      filesResult.data.forEach(item => allDates.add(item.file_date));
    }
    
    // Adicionar datas das análises
    if (analyticsResult.data && !analyticsResult.error) {
      analyticsResult.data.forEach(item => allDates.add(item.date));
    }
    
    if (allDates.size === 0) {
      console.log(`Nenhuma data encontrada para grupo ${groupId}`);
      return { minDate: null, maxDate: null, availableDates: [] };
    }
    
    // Converter para array ordenado de datas
    const sortedDates = Array.from(allDates).sort();
    
    // Criar datas locais para evitar problemas de timezone
    const availableDates = sortedDates.map(dateStr => {
      // Parse manual para criar data local (evita UTC)
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day); // month é 0-indexed
    });
    
    const minDate = availableDates[0];
    const maxDate = availableDates[availableDates.length - 1];
    
    console.log(`Datas disponíveis para grupo ${groupId}:`, {
      minDate: minDate?.toISOString(),
      maxDate: maxDate?.toISOString(),
      totalDates: availableDates.length,
      dates: sortedDates,
      availableDatesLocal: availableDates.map(d => format(d, 'dd/MM/yyyy')),
      fromFiles: filesResult.data?.length || 0,
      fromAnalytics: analyticsResult.data?.length || 0
    });
    
    return {
      minDate,
      maxDate,
      availableDates
    };
  } catch (error) {
    console.error('Erro ao buscar datas disponíveis:', error);
    return { minDate: null, maxDate: null, availableDates: [] };
  }
};

// Função para buscar informações sobre a última atualização do grupo
export const getLastUpdateInfo = async (groupId: string): Promise<{
  lastDate: Date | null;
  lastDateFormatted: string | null;
  totalDays: number;
  hasData: boolean;
}> => {
  try {
    const supabase = createClient();
    
    // Buscar a última data processada
    const { data, error } = await supabase
      .from('daily_analytics')
      .select('date')
      .eq('group_id', groupId)
      .eq('period_summary', false)
      .order('date', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Erro ao buscar última atualização:', error);
      return { lastDate: null, lastDateFormatted: null, totalDays: 0, hasData: false };
    }
    
    if (!data || data.length === 0) {
      return { lastDate: null, lastDateFormatted: null, totalDays: 0, hasData: false };
    }
    
    // Buscar total de dias
    const { count } = await supabase
      .from('daily_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('period_summary', false);
    
    const lastDate = new Date(data[0].date);
    const lastDateFormatted = format(lastDate, 'dd/MM/yyyy', { locale: ptBR });
    
    return {
      lastDate,
      lastDateFormatted,
      totalDays: count || 0,
      hasData: true
    };
  } catch (error) {
    console.error('Erro ao buscar informações da última atualização:', error);
    return { lastDate: null, lastDateFormatted: null, totalDays: 0, hasData: false };
  }
};

// Função para análise incremental de chat (apenas novos dados)
export const analyzeWhatsAppChatIncremental = async (
  groupId: string,
  fromDate: Date,
  progressCallback?: (progress: number, stage: string) => void
): Promise<{
  success: boolean;
  daysProcessed: number;
  newMessagesCount: number;
  error?: string;
}> => {
  try {
    console.log(`Iniciando análise incremental a partir de: ${format(fromDate, 'dd/MM/yyyy')}`);
    
    const supabase = createClient();
    
    // Callback de progresso padrão
    const updateProgress = progressCallback || (() => {});
    
    updateProgress(5, 'Buscando arquivos para processar...');
    
    // Formato das datas para SQL
    const formattedFromDate = format(fromDate, 'yyyy-MM-dd');
    
    // Buscar arquivos de mensagens a partir da data especificada
    const { data: messageFiles, error: fileError } = await supabase
      .from('group_message_files')
      .select('*')
      .eq('group_id', groupId)
      .gte('file_date', formattedFromDate)
      .order('file_date', { ascending: true });
    
    if (fileError) {
      console.error('Erro ao buscar arquivos:', fileError);
      return { success: false, daysProcessed: 0, newMessagesCount: 0, error: fileError.message };
    }
    
    if (!messageFiles || messageFiles.length === 0) {
      console.log('Nenhum arquivo encontrado para processar.');
      return { success: true, daysProcessed: 0, newMessagesCount: 0 };
    }
    
    updateProgress(10, `Encontrados ${messageFiles.length} arquivos para processar...`);
    
    // Remover análises existentes para reprocessar
    const datesToReprocess = messageFiles.map(file => file.file_date);
    
    updateProgress(15, 'Limpando análises anteriores...');
    
    const { error: deleteError } = await supabase
      .from('daily_analytics')
      .delete()
      .eq('group_id', groupId)
      .in('date', datesToReprocess)
      .eq('period_summary', false);
    
    if (deleteError) {
      console.error('Erro ao limpar análises anteriores:', deleteError);
    }
    
    // Inicializar dados para o resumo final
    let totalMessages = 0;
    let totalWords = 0;
    let totalMedia = 0;
    const dailyStats: DailyStats[] = [];
    const memberStatsByName: Map<string, MemberStats> = new Map();
    const globalMembersActiveSet = new Set<string>();
    let hourlyActivity: Record<string, number> = {};
    let processedFiles = 0;
    
    updateProgress(20, 'Iniciando processamento dos arquivos...');
    
    // Processar cada arquivo
    for (const file of messageFiles) {
      console.log(`Processando arquivo: ${file.storage_path} para data ${file.file_date}`);
      
      const fileProgress = 20 + (processedFiles / messageFiles.length) * 60;
      updateProgress(fileProgress, `Processando ${format(new Date(file.file_date), 'dd/MM/yyyy')}...`);
      
      // Baixar o arquivo do Storage
      const { data, error: downloadError } = await supabase
        .storage
        .from(file.bucket_id)
        .download(file.storage_path);
      
      if (downloadError) {
        console.error(`Erro ao baixar arquivo ${file.storage_path}:`, downloadError);
        continue; // Pular este arquivo
      }
      
      // Converter o blob para texto
      const content = await data.text();
      
      // Analisar o conteúdo do chat
      const fileStats = analyzeWhatsAppChatFile(content);
      
      // Calcular data do arquivo no formato DD/MM/YYYY
      const fileDateParts = file.file_date.split('-'); // YYYY-MM-DD
      const fileDate = `${fileDateParts[2]}/${fileDateParts[1]}/${fileDateParts[0]}`; // DD/MM/YYYY
      
      // Processar e salvar estatísticas deste dia
      const dailyResult = await processAndSaveDayStats(
        groupId,
        fileDate,
        file.file_date, // SQL formato (YYYY-MM-DD)
        fileStats
      );
        
      // Adicionar às estatísticas diárias
      dailyStats.push({
        date: fileDate,
        total_messages: dailyResult.dailyMessageCount,
        active_members: dailyResult.activeMembers,
        hourly_activity: fileStats.hourlyActivity
      });
      
      // Atualizar totais
      totalMessages += dailyResult.dailyMessageCount;
      totalWords += dailyResult.totalWordsForDay;
      totalMedia += dailyResult.totalMediaForDay;
      
      // Combinar atividade por hora
      Object.entries(fileStats.hourlyActivity).forEach(([hour, count]) => {
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + count;
      });
      
      // Adicionar membros ao conjunto global
      fileStats.membersActive.forEach(member => globalMembersActiveSet.add(member));
      
      // Atualizar estatísticas por membro
      for (const [name, messageCount] of Object.entries(fileStats.messagesByUser)) {
        if (!memberStatsByName.has(name)) {
          memberStatsByName.set(name, {
            id: name,
            name,
            message_count: 0,
            word_count: 0,
            media_count: 0,
            avg_words_per_message: 0,
            dailyStats: []
          });
        }
        
        const member = memberStatsByName.get(name)!;
        member.message_count += messageCount;
        member.word_count += fileStats.wordsByUser[name] || 0;
        member.media_count += fileStats.mediaByUser[name] || 0;
        
        // Adicionar estatística diária
        member.dailyStats.push({
          date: fileDate,
          message_count: messageCount
        });
      }
      
      processedFiles++;
    }
    
    updateProgress(85, 'Finalizando estatísticas...');
    
    // Finalizar estatísticas por membro
    const memberStats: MemberStats[] = Array.from(memberStatsByName.values()).map(member => {
      // Calcular média de palavras por mensagem
      const nonMediaMessages = member.message_count - member.media_count;
      member.avg_words_per_message = nonMediaMessages > 0 ? member.word_count / nonMediaMessages : 0;
      return member;
    });
      
    // Ordenar por quantidade de mensagens
    memberStats.sort((a, b) => b.message_count - a.message_count);
    
    updateProgress(95, 'Atualizando resumo do grupo...');
    
    // Atualizar o resumo geral do grupo
    try {
      // Buscar totais existentes para somar
      const { data: existingGroupStats } = await supabase
        .from('group_analytics')
        .select('*')
        .eq('group_id', groupId)
        .single();
      
      const existingMessages = existingGroupStats?.total_messages || 0;
      const existingWords = existingGroupStats?.total_words || 0;
      const existingMedia = existingGroupStats?.total_media || 0;
      
      // Calcular média de palavras por mensagem
      const totalNonMediaMessages = (existingMessages + totalMessages) - (existingMedia + totalMedia);
      const avgWordsPerMessage = totalNonMediaMessages > 0 ? (existingWords + totalWords) / totalNonMediaMessages : 0;
      
      const groupStatsUpdate = {
        group_id: groupId,
        total_messages: existingMessages + totalMessages,
        total_words: existingWords + totalWords,
        total_media: existingMedia + totalMedia,
        active_members: globalMembersActiveSet.size,
        avg_words_per_message: avgWordsPerMessage,
        updated_at: new Date().toISOString()
      };
      
      // Upsert para evitar duplicidade
    await supabase
        .from('group_analytics')
        .upsert(groupStatsUpdate, { onConflict: 'group_id' });
    } catch (error) {
      console.error('Erro ao atualizar group_analytics:', error);
    }
    
    updateProgress(100, 'Análise concluída!');
    
    return {
      success: true,
      daysProcessed: dailyStats.length,
      newMessagesCount: totalMessages,
    };
  } catch (error) {
    console.error('Erro na análise incremental do chat:', error);
    return {
      success: false,
      daysProcessed: 0,
      newMessagesCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Função wrapper para compatibilidade com o sistema de relatórios
export const getStats = async (
  groupId: string,
  startDate: string,
  endDate: string
): Promise<DetailedStats> => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Tentar buscar dados pré-processados primeiro
    const stats = await fetchPreProcessedStats(groupId, start, end);
    
    // Se não houver dados, tentar analisar do zero
    if (stats.total_messages === 0) {
      console.log('Nenhum dado pré-processado encontrado, iniciando análise...');
      return await analyzeWhatsAppChat(groupId, start, end);
    }
    
    return stats;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    // Retornar objeto vazio em caso de erro
    return {
      daily_stats: [],
      member_stats: [],
      total_messages: 0,
      total_words: 0,
      total_media: 0,
      active_members: 0,
      hourly_activity: {},
      avg_words_per_message: 0,
      days_analyzed: 0
    };
  }
}; 