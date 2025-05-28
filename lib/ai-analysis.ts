import { createClient } from '@/lib/supabase/client';

// Definição da estrutura de dados para a análise da IA
export interface AIAnalysis {
  identificacao: {
    nome: string;
    total_mensagens_analisadas: number;
    resumo_geral: string;
  };
  comportamento_e_personalidade: {
    topicos_frequentes: string[];
    estilo_de_escrita: string;
    tom_de_comunicacao: string;
    horarios_atividade: string[];
    padroes_de_humor: string;
    nivel_prolixidade: string;
    uso_emojis: string;
    participacao_polemicas: string;
    frases_caracteristicas: string[];
  };
  preferencias_e_opinioes: {
    gosta_de: string[];
    nao_gosta_de: string[];
    preferencias_explicitas: string[];
    posicionamentos: string[];
  };
  outros: {
    informacoes_adicionais: string[];
    dados_aleatorios: string[];
  };
}

/**
 * Analisa as mensagens de um membro usando a OpenAI GPT-4.1 Mini
 */
export const analyzeMemberMessages = async (
  profileId: string,
  memberName: string
): Promise<{
  success: boolean;
  analysis?: AIAnalysis;
  message?: string;
}> => {
  try {
    console.log(`Iniciando análise de IA para o membro ${memberName} (profileId: ${profileId})`);
    const supabase = createClient();
    
    // 1. Buscar o perfil do membro para obter o caminho do arquivo de mensagens
    const { data: profile, error: profileError } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    
    if (profileError) {
      console.error('Erro ao buscar perfil do membro:', profileError);
      throw new Error('Perfil do membro não encontrado');
    }
    
    if (!profile.messages_file_path) {
      throw new Error('Este membro não possui arquivo de mensagens');
    }
    
    // 2. Baixar o arquivo de mensagens do storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('member_messages')
      .download(profile.messages_file_path);
    
    if (downloadError) {
      console.error('Erro ao baixar arquivo de mensagens:', downloadError);
      throw new Error('Não foi possível acessar as mensagens do membro');
    }
    
    // 3. Processar o conteúdo do arquivo para remover timestamps
    const content = await fileData.text();
    const processedMessages = processMessagesForAnalysis(content);
    
    // 4. Chamar a API da OpenAI
    const analysis = await callOpenAIAPI(processedMessages, memberName);
    
    // 5. Salvar a análise no banco de dados
    const { error: updateError } = await supabase
      .from('member_profiles')
      .update({
        ai_analysis: analysis,
        ai_analysis_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);
    
    if (updateError) {
      console.error('Erro ao salvar análise no banco de dados:', updateError);
      throw new Error('Não foi possível salvar a análise');
    }
    
    return {
      success: true,
      analysis
    };
  } catch (error) {
    console.error('Erro ao analisar mensagens do membro:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

/**
 * Processa as mensagens para remover timestamps e outras informações desnecessárias
 */
const processMessagesForAnalysis = (content: string): string => {
  try {
    // Extrair apenas o conteúdo das mensagens, sem timestamps
    const lines = content.split('\n');
    const processedLines: string[] = [];
    
    // Identificar padrão de data e hora para remover
    const timestampPattern = /\[\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}\]/;
    
    let inMessageBlock = false;
    for (const line of lines) {
      // Pular linhas de cabeçalho e separadores
      if (line.startsWith('---') || line.startsWith('Todas as mensagens de') || 
          line.startsWith('Total de mensagens:') || line.startsWith('Total de palavras:') ||
          line.startsWith('Total de mídias:') || line.startsWith('Fim das mensagens')) {
        continue;
      }
      
      // Remover timestamps das mensagens
      const cleanedLine = line.replace(timestampPattern, '').trim();
      
      if (cleanedLine.length > 0) {
        processedLines.push(cleanedLine);
      }
    }
    
    return processedLines.join('\n');
  } catch (error) {
    console.error('Erro ao processar mensagens:', error);
    return content; // Retornar o conteúdo original em caso de erro
  }
};

/**
 * Chama a API da OpenAI para análise das mensagens
 */
const callOpenAIAPI = async (messages: string, memberName: string): Promise<AIAnalysis> => {
  try {
    // Verificar se a API key está definida
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    
    if (!apiKey) {
      console.error('API key da OpenAI não definida');
      throw new Error('API key da OpenAI não encontrada');
    }
    
    console.log('Enviando requisição para a API da OpenAI...');
    
    // Construir o input com as mensagens do usuário
    const input = `Você é um analista comportamental que cria perfis detalhados de membros de grupos com base em suas mensagens.
Analise cuidadosamente todas as mensagens fornecidas e preencha um JSON organizado nas seguintes categorias:

1. Identificação
2. Comportamento e Personalidade
3. Preferências e Opiniões
4. Outros (informações adicionais e dados aleatórios)

Mensagens analisadas:
${messages}`;

    // Definir as instruções detalhadas para o formato de resposta
    const instructions = `Você é um analista comportamental avançado que cria perfis detalhados de membros de grupos com base em suas mensagens.
Sua tarefa: Ler todas as mensagens fornecidas e gerar um perfil comportamental organizado em 4 seções (abas), no formato JSON especificado abaixo.

IMPORTANTE:
- Responda APENAS no formato JSON especificado.
- NÃO invente informações. Se algum dado não puder ser identificado, escreva "Não identificado" ou deixe um array vazio.
- As listas devem conter apenas os itens realmente detectáveis nas mensagens analisadas.

Formato JSON de resposta:
{
  "identificacao": {
    "nome": "Nome do usuário ou 'Não identificado'",
    "total_mensagens_analisadas": 0,
    "resumo_geral": "Resumo geral do comportamento e estilo comunicacional"
  },
  "comportamento_e_personalidade": {
    "topicos_frequentes": ["tópico 1", "tópico 2"],
    "estilo_de_escrita": "Formal / Informal / Usa gírias / Usa emojis",
    "tom_de_comunicacao": "Amigável / Sarcástico / Educado / etc.",
    "horarios_atividade": ["manhã", "noite"],
    "padroes_de_humor": "Positivo / Negativo / Neutro",
    "nivel_prolixidade": "Curto / Médio / Longo",
    "uso_emojis": "Alto / Moderado / Baixo",
    "participacao_polemicas": "Alto / Médio / Baixo",
    "frases_caracteristicas": ["'frase 1'", "'frase 2'"]
  },
  "preferencias_e_opinioes": {
    "gosta_de": ["assunto 1", "assunto 2"],
    "nao_gosta_de": ["assunto 1", "assunto 2"],
    "preferencias_explicitas": ["preferência 1", "preferência 2"],
    "posicionamentos": ["direita", "progressista", "neutro", "não identificado"]
  },
  "outros": {
    "informacoes_adicionais": [
      "Informação adicional 1",
      "Informação adicional 2"
    ],
    "dados_aleatorios": [
      "Dado aleatório 1",
      "Dado aleatório 2"
    ]
  }
}`;

    // Chamar a API da OpenAI
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        input: input,
        instructions: instructions
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na resposta da API da OpenAI:', errorData);
      throw new Error(`Erro na API da OpenAI: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Resposta da OpenAI:', data);
    
    // Estrutura correta da resposta com base no exemplo fornecido
    // O JSON da análise está em: data.output[0].content[0].text
    if (data && data.output && 
        Array.isArray(data.output) && 
        data.output.length > 0 && 
        data.output[0].content && 
        Array.isArray(data.output[0].content) && 
        data.output[0].content.length > 0 && 
        data.output[0].content[0].text) {
      
      try {
        // Pegar o texto JSON diretamente do caminho correto
        const jsonText = data.output[0].content[0].text;
        console.log('JSON extraído:', jsonText);
        
        const parsedJson = JSON.parse(jsonText);
        
        // Verificar se o JSON tem a estrutura esperada
        if (!parsedJson.identificacao || !parsedJson.comportamento_e_personalidade ||
            !parsedJson.preferencias_e_opinioes || !parsedJson.outros) {
          console.error('Resposta da API não contém a estrutura JSON esperada:', parsedJson);
          throw new Error('Formato de resposta inválido');
        }
        
        return parsedJson as AIAnalysis;
      } catch (parseError) {
        console.error('Erro ao analisar JSON da resposta:', parseError);
        throw new Error('Não foi possível processar a resposta da IA');
      }
    } else {
      console.error('Formato de resposta inesperado da API OpenAI:', data);
      throw new Error('Resposta da API em formato inválido');
    }
  } catch (error) {
    console.error('Erro ao chamar API da OpenAI:', error);
    
    // Retornar um objeto de análise vazio em caso de erro
    return {
      identificacao: {
        nome: memberName,
        total_mensagens_analisadas: 0,
        resumo_geral: 'Não foi possível realizar a análise'
      },
      comportamento_e_personalidade: {
        topicos_frequentes: [],
        estilo_de_escrita: 'Não identificado',
        tom_de_comunicacao: 'Não identificado',
        horarios_atividade: [],
        padroes_de_humor: 'Não identificado',
        nivel_prolixidade: 'Não identificado',
        uso_emojis: 'Não identificado',
        participacao_polemicas: 'Não identificado',
        frases_caracteristicas: []
      },
      preferencias_e_opinioes: {
        gosta_de: [],
        nao_gosta_de: [],
        preferencias_explicitas: [],
        posicionamentos: ['não identificado']
      },
      outros: {
        informacoes_adicionais: ['Erro ao analisar mensagens'],
        dados_aleatorios: []
      }
    };
  }
}; 