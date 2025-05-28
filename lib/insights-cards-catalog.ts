// Catálogo Completo de Cards de Insights
// Sistema profissional para análise de grupos WhatsApp

export interface InsightCardTemplate {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  description: string;
  weight: number; // 1-100
  priority: 'critical' | 'high' | 'medium' | 'low';
  triggers: {
    condition: string;
    threshold: number | string;
    comparison: 'greater' | 'less' | 'equal' | 'between';
  }[];
  variations: {
    level: string;
    title: string;
    description: string;
    recommendation: string;
    weight: number;
    trend: 'up' | 'down' | 'stable' | 'warning' | 'critical';
  }[];
  businessValue: string;
  actionability: 'high' | 'medium' | 'low';
  frequency: 'always' | 'daily' | 'weekly' | 'monthly';
}

// CATÁLOGO COMPLETO DE CARDS DE INSIGHTS
export const INSIGHTS_CATALOG: InsightCardTemplate[] = [
  
  // ===== CATEGORIA: PARTICIPAÇÃO E ENGAJAMENTO =====
  {
    id: 'participation_rate',
    category: 'Engajamento',
    subcategory: 'Participação',
    name: 'Taxa de Participação',
    description: 'Analisa o percentual de membros ativos em relação ao total',
    weight: 90,
    priority: 'critical',
    triggers: [
      { condition: 'participation_rate', threshold: 0, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'excellent',
        title: 'Participação Excelente',
        description: 'Mais de 15% dos membros participam ativamente',
        recommendation: 'Mantenha as estratégias atuais e considere expandir o grupo',
        weight: 85,
        trend: 'up'
      },
      {
        level: 'good',
        title: 'Boa Participação',
        description: '10-15% dos membros participam ativamente',
        recommendation: 'Implemente estratégias para aumentar o engajamento',
        weight: 70,
        trend: 'stable'
      },
      {
        level: 'regular',
        title: 'Participação Regular',
        description: '5-10% dos membros participam ativamente',
        recommendation: 'Crie conteúdo mais envolvente e incentive a participação',
        weight: 60,
        trend: 'warning'
      },
      {
        level: 'low',
        title: 'Baixa Participação',
        description: 'Menos de 5% dos membros participam ativamente',
        recommendation: 'Ação urgente: revisar estratégia de engajamento e conteúdo',
        weight: 95,
        trend: 'critical'
      }
    ],
    businessValue: 'Indica a saúde e vitalidade do grupo',
    actionability: 'high',
    frequency: 'always'
  },

  {
    id: 'engagement_intensity',
    category: 'Engajamento',
    subcategory: 'Intensidade',
    name: 'Intensidade de Engajamento',
    description: 'Média de mensagens por membro ativo',
    weight: 75,
    priority: 'high',
    triggers: [
      { condition: 'messages_per_active_member', threshold: 1, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'very_high',
        title: 'Engajamento Muito Alto',
        description: 'Membros enviam mais de 15 mensagens por dia',
        recommendation: 'Excelente! Monitore para evitar spam ou conflitos',
        weight: 80,
        trend: 'up'
      },
      {
        level: 'high',
        title: 'Alto Engajamento Individual',
        description: 'Membros enviam 8-15 mensagens por dia',
        recommendation: 'Ótimo! Mantenha a qualidade das discussões',
        weight: 75,
        trend: 'up'
      },
      {
        level: 'moderate',
        title: 'Engajamento Moderado',
        description: 'Membros enviam 3-8 mensagens por dia',
        recommendation: 'Bom nível. Considere incentivar mais interações',
        weight: 60,
        trend: 'stable'
      },
      {
        level: 'low',
        title: 'Baixo Engajamento Individual',
        description: 'Membros enviam menos de 3 mensagens por dia',
        recommendation: 'Crie tópicos mais envolventes para estimular participação',
        weight: 50,
        trend: 'warning'
      }
    ],
    businessValue: 'Mede a profundidade do envolvimento dos membros',
    actionability: 'high',
    frequency: 'daily'
  },

  // ===== CATEGORIA: ATIVIDADE E CRESCIMENTO =====
  {
    id: 'activity_peak',
    category: 'Atividade',
    subcategory: 'Picos',
    name: 'Picos de Atividade',
    description: 'Detecta dias com atividade significativamente acima da média',
    weight: 80,
    priority: 'high',
    triggers: [
      { condition: 'peak_ratio', threshold: 2, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'extreme',
        title: 'Pico Extremo de Atividade',
        description: 'Atividade 500%+ acima da média',
        recommendation: 'Investigue urgentemente - pode indicar evento viral ou problema',
        weight: 95,
        trend: 'up'
      },
      {
        level: 'major',
        title: 'Grande Pico de Atividade',
        description: 'Atividade 200-500% acima da média',
        recommendation: 'Analise o que causou este pico para replicar o sucesso',
        weight: 80,
        trend: 'up'
      },
      {
        level: 'moderate',
        title: 'Pico Moderado de Atividade',
        description: 'Atividade 100-200% acima da média',
        recommendation: 'Identifique os fatores que contribuíram para o aumento',
        weight: 65,
        trend: 'up'
      }
    ],
    businessValue: 'Identifica eventos ou conteúdos que geram alto engajamento',
    actionability: 'high',
    frequency: 'daily'
  },

  {
    id: 'growth_trend',
    category: 'Crescimento',
    subcategory: 'Tendências',
    name: 'Tendência de Crescimento',
    description: 'Compara atividade entre períodos para identificar tendências',
    weight: 85,
    priority: 'high',
    triggers: [
      { condition: 'period_change', threshold: 10, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'explosive',
        title: 'Crescimento Explosivo',
        description: 'Atividade cresceu mais de 100%',
        recommendation: 'Capitalize este momento - expanda estratégias de sucesso',
        weight: 95,
        trend: 'up'
      },
      {
        level: 'accelerated',
        title: 'Crescimento Acelerado',
        description: 'Atividade cresceu 50-100%',
        recommendation: 'Identifique os fatores de sucesso para manter o crescimento',
        weight: 85,
        trend: 'up'
      },
      {
        level: 'steady',
        title: 'Crescimento Constante',
        description: 'Atividade cresceu 20-50%',
        recommendation: 'Bom progresso - mantenha as estratégias atuais',
        weight: 70,
        trend: 'up'
      },
      {
        level: 'decline_moderate',
        title: 'Declínio Moderado',
        description: 'Atividade reduziu 20-50%',
        recommendation: 'Atenção - revise estratégias de engajamento',
        weight: 75,
        trend: 'down'
      },
      {
        level: 'decline_severe',
        title: 'Declínio Severo',
        description: 'Atividade reduziu mais de 50%',
        recommendation: 'Ação urgente: investigar causas e implementar correções',
        weight: 90,
        trend: 'critical'
      }
    ],
    businessValue: 'Indica direção e velocidade do desenvolvimento do grupo',
    actionability: 'high',
    frequency: 'weekly'
  },

  // ===== CATEGORIA: DISTRIBUIÇÃO E CONCENTRAÇÃO =====
  {
    id: 'member_concentration',
    category: 'Distribuição',
    subcategory: 'Concentração',
    name: 'Concentração de Atividade',
    description: 'Analisa se a atividade está concentrada em poucos membros',
    weight: 65,
    priority: 'medium',
    triggers: [
      { condition: 'top3_concentration', threshold: 50, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'extreme',
        title: 'Concentração Extrema',
        description: 'Top 3 membros representam mais de 80% das mensagens',
        recommendation: 'Crítico - diversifique a participação urgentemente',
        weight: 85,
        trend: 'critical'
      },
      {
        level: 'high',
        title: 'Alta Concentração de Atividade',
        description: 'Top 3 membros representam 60-80% das mensagens',
        recommendation: 'Incentive a participação de outros membros',
        weight: 65,
        trend: 'warning'
      },
      {
        level: 'moderate',
        title: 'Concentração Moderada',
        description: 'Top 3 membros representam 40-60% das mensagens',
        recommendation: 'Nível aceitável - monitore para manter equilíbrio',
        weight: 45,
        trend: 'stable'
      },
      {
        level: 'balanced',
        title: 'Distribuição Equilibrada',
        description: 'Top 3 membros representam menos de 40% das mensagens',
        recommendation: 'Excelente distribuição - mantenha este equilíbrio',
        weight: 70,
        trend: 'up'
      }
    ],
    businessValue: 'Indica saúde da dinâmica de grupo e risco de dependência',
    actionability: 'medium',
    frequency: 'weekly'
  },

  {
    id: 'leadership_emergence',
    category: 'Liderança',
    subcategory: 'Emergência',
    name: 'Emergência de Liderança',
    description: 'Identifica membros que se destacam como líderes naturais',
    weight: 65,
    priority: 'medium',
    triggers: [
      { condition: 'leadership_gap', threshold: 30, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'dominant',
        title: 'Liderança Dominante',
        description: 'Líder tem mais de 100% de mensagens que o 2º colocado',
        recommendation: 'Considere distribuir responsabilidades de moderação',
        weight: 70,
        trend: 'warning'
      },
      {
        level: 'clear',
        title: 'Liderança Clara',
        description: 'Líder tem 50-100% mais mensagens que o 2º colocado',
        recommendation: 'Considere dar responsabilidades de moderação',
        weight: 65,
        trend: 'up'
      },
      {
        level: 'emerging',
        title: 'Liderança Emergente',
        description: 'Líder tem 30-50% mais mensagens que o 2º colocado',
        recommendation: 'Monitore este membro para futuras responsabilidades',
        weight: 50,
        trend: 'stable'
      }
    ],
    businessValue: 'Identifica potenciais moderadores e influenciadores',
    actionability: 'medium',
    frequency: 'weekly'
  },

  // ===== CATEGORIA: PADRÕES TEMPORAIS =====
  {
    id: 'time_pattern',
    category: 'Temporal',
    subcategory: 'Padrões',
    name: 'Padrões de Horário',
    description: 'Identifica horários de pico de atividade',
    weight: 60,
    priority: 'medium',
    triggers: [
      { condition: 'peak_hour_concentration', threshold: 20, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'highly_concentrated',
        title: 'Atividade Altamente Concentrada',
        description: 'Mais de 40% da atividade em uma única hora',
        recommendation: 'Considere estratégias para distribuir a atividade',
        weight: 65,
        trend: 'warning'
      },
      {
        level: 'concentrated',
        title: 'Padrão Temporal Identificado',
        description: '25-40% da atividade concentrada em horário específico',
        recommendation: 'Programe conteúdo importante para este horário',
        weight: 60,
        trend: 'stable'
      },
      {
        level: 'moderate',
        title: 'Padrão Temporal Moderado',
        description: '20-25% da atividade em horário de pico',
        recommendation: 'Bom equilíbrio temporal de atividade',
        weight: 45,
        trend: 'stable'
      }
    ],
    businessValue: 'Otimiza timing de comunicações importantes',
    actionability: 'medium',
    frequency: 'weekly'
  },

  {
    id: 'weekend_pattern',
    category: 'Temporal',
    subcategory: 'Sazonalidade',
    name: 'Padrão de Fim de Semana',
    description: 'Compara atividade entre dias úteis e fins de semana',
    weight: 45,
    priority: 'low',
    triggers: [
      { condition: 'weekend_ratio', threshold: 0.5, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'weekend_dominant',
        title: 'Grupo de Fim de Semana',
        description: 'Mais de 60% da atividade acontece nos fins de semana',
        recommendation: 'Foque estratégias de engajamento para fins de semana',
        weight: 55,
        trend: 'stable'
      },
      {
        level: 'weekday_dominant',
        title: 'Grupo de Dias Úteis',
        description: 'Mais de 70% da atividade acontece em dias úteis',
        recommendation: 'Grupo profissional - mantenha foco em horário comercial',
        weight: 50,
        trend: 'stable'
      },
      {
        level: 'balanced',
        title: 'Atividade Equilibrada',
        description: 'Distribuição equilibrada entre dias úteis e fins de semana',
        recommendation: 'Ótimo equilíbrio - grupo ativo durante toda semana',
        weight: 60,
        trend: 'up'
      }
    ],
    businessValue: 'Informa estratégias de timing de conteúdo',
    actionability: 'low',
    frequency: 'weekly'
  },

  // ===== CATEGORIA: QUALIDADE DE CONTEÚDO =====
  {
    id: 'content_depth',
    category: 'Qualidade',
    subcategory: 'Profundidade',
    name: 'Profundidade das Conversas',
    description: 'Analisa a qualidade baseada no tamanho das mensagens',
    weight: 55,
    priority: 'medium',
    triggers: [
      { condition: 'avg_words_per_message', threshold: 5, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'very_deep',
        title: 'Conversas Muito Aprofundadas',
        description: 'Média de mais de 25 palavras por mensagem',
        recommendation: 'Excelente! Grupo mantém discussões de alta qualidade',
        weight: 70,
        trend: 'up'
      },
      {
        level: 'deep',
        title: 'Conversas Aprofundadas',
        description: 'Média de 15-25 palavras por mensagem',
        recommendation: 'Ótimo! Grupo mantém discussões detalhadas',
        weight: 55,
        trend: 'up'
      },
      {
        level: 'moderate',
        title: 'Conversas Moderadas',
        description: 'Média de 8-15 palavras por mensagem',
        recommendation: 'Bom nível - considere incentivar discussões mais profundas',
        weight: 40,
        trend: 'stable'
      },
      {
        level: 'shallow',
        title: 'Conversas Superficiais',
        description: 'Média de menos de 8 palavras por mensagem',
        recommendation: 'Crie tópicos que incentivem respostas mais elaboradas',
        weight: 45,
        trend: 'warning'
      }
    ],
    businessValue: 'Indica qualidade e valor das discussões',
    actionability: 'medium',
    frequency: 'weekly'
  },

  {
    id: 'media_ratio',
    category: 'Qualidade',
    subcategory: 'Formato',
    name: 'Proporção de Mídia',
    description: 'Analisa o equilíbrio entre texto e mídia',
    weight: 40,
    priority: 'low',
    triggers: [
      { condition: 'media_percentage', threshold: 10, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'media_heavy',
        title: 'Grupo Rico em Mídia',
        description: 'Mais de 50% das mensagens são mídia',
        recommendation: 'Considere equilibrar com mais discussões textuais',
        weight: 45,
        trend: 'warning'
      },
      {
        level: 'media_balanced',
        title: 'Mídia Equilibrada',
        description: '20-50% das mensagens são mídia',
        recommendation: 'Ótimo equilíbrio entre texto e mídia',
        weight: 55,
        trend: 'up'
      },
      {
        level: 'text_focused',
        title: 'Foco em Texto',
        description: 'Menos de 20% das mensagens são mídia',
        recommendation: 'Grupo focado em discussões - considere adicionar mídia',
        weight: 40,
        trend: 'stable'
      }
    ],
    businessValue: 'Indica estilo de comunicação do grupo',
    actionability: 'low',
    frequency: 'monthly'
  },

  // ===== CATEGORIA: SAÚDE E ANOMALIAS =====
  {
    id: 'group_health',
    category: 'Saúde',
    subcategory: 'Geral',
    name: 'Saúde Geral do Grupo',
    description: 'Score composto de múltiplas métricas de saúde',
    weight: 85,
    priority: 'high',
    triggers: [
      { condition: 'health_score', threshold: 50, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'excellent',
        title: 'Grupo Muito Saudável',
        description: 'Score de saúde acima de 90/100',
        recommendation: 'Continue as práticas atuais de gestão',
        weight: 85,
        trend: 'up'
      },
      {
        level: 'good',
        title: 'Grupo Saudável',
        description: 'Score de saúde entre 70-90/100',
        recommendation: 'Bom estado - pequenos ajustes podem melhorar',
        weight: 70,
        trend: 'stable'
      },
      {
        level: 'moderate',
        title: 'Saúde Moderada',
        description: 'Score de saúde entre 50-70/100',
        recommendation: 'Atenção necessária - revise estratégias de engajamento',
        weight: 60,
        trend: 'warning'
      },
      {
        level: 'poor',
        title: 'Grupo em Risco',
        description: 'Score de saúde abaixo de 50/100',
        recommendation: 'Ação urgente - grupo precisa de intervenção',
        weight: 90,
        trend: 'critical'
      }
    ],
    businessValue: 'Visão holística da performance do grupo',
    actionability: 'high',
    frequency: 'daily'
  },

  {
    id: 'anomaly_detection',
    category: 'Anomalias',
    subcategory: 'Detecção',
    name: 'Atividade Anômala',
    description: 'Detecta padrões estatisticamente incomuns',
    weight: 70,
    priority: 'medium',
    triggers: [
      { condition: 'statistical_anomaly', threshold: 2, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'extreme',
        title: 'Anomalia Extrema',
        description: 'Atividade mais de 5 desvios padrão da média',
        recommendation: 'Investigação urgente - possível evento crítico',
        weight: 95,
        trend: 'critical'
      },
      {
        level: 'significant',
        title: 'Atividade Anômala Detectada',
        description: 'Atividade 2-5 desvios padrão da média',
        recommendation: 'Investigue o que causou esta atividade atípica',
        weight: 70,
        trend: 'warning'
      },
      {
        level: 'minor',
        title: 'Pequena Anomalia',
        description: 'Atividade ligeiramente fora do padrão',
        recommendation: 'Monitore para verificar se é tendência',
        weight: 45,
        trend: 'stable'
      }
    ],
    businessValue: 'Identifica eventos importantes ou problemas',
    actionability: 'high',
    frequency: 'daily'
  },

  // ===== CATEGORIA: RETENÇÃO E CHURN =====
  {
    id: 'member_retention',
    category: 'Retenção',
    subcategory: 'Membros',
    name: 'Retenção de Membros',
    description: 'Analisa quantos membros continuam ativos ao longo do tempo',
    weight: 75,
    priority: 'high',
    triggers: [
      { condition: 'retention_rate', threshold: 50, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'excellent',
        title: 'Excelente Retenção',
        description: 'Mais de 80% dos membros permanecem ativos',
        recommendation: 'Ótimo! Identifique fatores de sucesso para replicar',
        weight: 80,
        trend: 'up'
      },
      {
        level: 'good',
        title: 'Boa Retenção',
        description: '60-80% dos membros permanecem ativos',
        recommendation: 'Bom nível - trabalhe para melhorar ainda mais',
        weight: 65,
        trend: 'stable'
      },
      {
        level: 'concerning',
        title: 'Retenção Preocupante',
        description: '40-60% dos membros permanecem ativos',
        recommendation: 'Atenção - implemente estratégias de retenção',
        weight: 70,
        trend: 'warning'
      },
      {
        level: 'poor',
        title: 'Baixa Retenção',
        description: 'Menos de 40% dos membros permanecem ativos',
        recommendation: 'Crítico - revise completamente a estratégia do grupo',
        weight: 85,
        trend: 'critical'
      }
    ],
    businessValue: 'Indica sustentabilidade a longo prazo do grupo',
    actionability: 'high',
    frequency: 'weekly'
  },

  // ===== CATEGORIA: RESPOSTA E INTERAÇÃO =====
  {
    id: 'response_rate',
    category: 'Interação',
    subcategory: 'Resposta',
    name: 'Taxa de Resposta',
    description: 'Mede quantas mensagens geram respostas',
    weight: 60,
    priority: 'medium',
    triggers: [
      { condition: 'response_percentage', threshold: 20, comparison: 'greater' }
    ],
    variations: [
      {
        level: 'very_interactive',
        title: 'Grupo Muito Interativo',
        description: 'Mais de 60% das mensagens geram respostas',
        recommendation: 'Excelente! Grupo tem alta interatividade',
        weight: 75,
        trend: 'up'
      },
      {
        level: 'interactive',
        title: 'Grupo Interativo',
        description: '40-60% das mensagens geram respostas',
        recommendation: 'Boa interação - mantenha o nível',
        weight: 60,
        trend: 'stable'
      },
      {
        level: 'moderate',
        title: 'Interação Moderada',
        description: '20-40% das mensagens geram respostas',
        recommendation: 'Considere fazer perguntas mais envolventes',
        weight: 45,
        trend: 'stable'
      },
      {
        level: 'low',
        title: 'Baixa Interação',
        description: 'Menos de 20% das mensagens geram respostas',
        recommendation: 'Crie conteúdo que incentive mais respostas',
        weight: 50,
        trend: 'warning'
      }
    ],
    businessValue: 'Mede qualidade das interações e engajamento',
    actionability: 'medium',
    frequency: 'weekly'
  }
];

// SISTEMA DE PESOS E PRIORIZAÇÃO
export const PRIORITY_WEIGHTS = {
  critical: 1.5,  // Multiplica peso por 1.5
  high: 1.2,      // Multiplica peso por 1.2
  medium: 1.0,    // Peso normal
  low: 0.8        // Reduz peso para 80%
};

// CATEGORIAS DE NEGÓCIO
export const BUSINESS_CATEGORIES = {
  'Engajamento': {
    description: 'Métricas relacionadas à participação e envolvimento',
    priority: 'critical',
    weight_multiplier: 1.3
  },
  'Crescimento': {
    description: 'Tendências de crescimento e desenvolvimento',
    priority: 'high',
    weight_multiplier: 1.2
  },
  'Saúde': {
    description: 'Indicadores de saúde geral do grupo',
    priority: 'high',
    weight_multiplier: 1.2
  },
  'Distribuição': {
    description: 'Como a atividade está distribuída entre membros',
    priority: 'medium',
    weight_multiplier: 1.0
  },
  'Qualidade': {
    description: 'Qualidade do conteúdo e discussões',
    priority: 'medium',
    weight_multiplier: 1.0
  },
  'Temporal': {
    description: 'Padrões relacionados ao tempo',
    priority: 'low',
    weight_multiplier: 0.9
  },
  'Anomalias': {
    description: 'Detecção de padrões incomuns',
    priority: 'medium',
    weight_multiplier: 1.1
  }
};

// FUNÇÃO PARA CALCULAR PESO FINAL
export const calculateFinalWeight = (
  baseWeight: number,
  priority: string,
  category: string,
  confidence: number
): number => {
  const priorityMultiplier = PRIORITY_WEIGHTS[priority as keyof typeof PRIORITY_WEIGHTS] || 1.0;
  const categoryMultiplier = BUSINESS_CATEGORIES[category as keyof typeof BUSINESS_CATEGORIES]?.weight_multiplier || 1.0;
  const confidenceMultiplier = confidence / 100;
  
  return Math.round(baseWeight * priorityMultiplier * categoryMultiplier * confidenceMultiplier);
};

// FUNÇÃO PARA OBTER TEMPLATE POR ID
export const getInsightTemplate = (id: string): InsightCardTemplate | undefined => {
  return INSIGHTS_CATALOG.find(template => template.id === id);
};

// FUNÇÃO PARA FILTRAR TEMPLATES POR CATEGORIA
export const getTemplatesByCategory = (category: string): InsightCardTemplate[] => {
  return INSIGHTS_CATALOG.filter(template => template.category === category);
};

// FUNÇÃO PARA OBTER TODOS OS TIPOS DE INSIGHTS DISPONÍVEIS
export const getAllInsightTypes = (): string[] => {
  return INSIGHTS_CATALOG.map(template => template.id);
}; 