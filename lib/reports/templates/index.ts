import { TemplateConfig, ReportTemplate, ReportOptions, ReportSection } from '../types';
import { completeTemplate } from './complete';
import { membersTemplate } from './members';
import { executiveTemplate } from './executive';

// === SEÇÕES DISPONÍVEIS ===
export const AVAILABLE_SECTIONS: Record<string, ReportSection[]> = {
  overview: [
    {
      id: 'generalStats',
      name: 'Estatísticas Gerais',
      description: 'Resumo executivo com métricas principais do grupo',
      category: 'overview',
      available: true,
      required: true,
      estimatedSize: 'small'
    },
    {
      id: 'executiveSummary',
      name: 'Resumo Executivo',
      description: 'Visão geral condensada das principais métricas',
      category: 'overview',
      available: true,
      estimatedSize: 'small'
    }
  ],
  activity: [
    {
      id: 'dailyActivity',
      name: 'Atividade Diária',
      description: 'Distribuição de mensagens ao longo dos dias',
      category: 'activity',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'hourlyActivity',
      name: 'Atividade por Hora',
      description: 'Padrões de atividade durante o dia',
      category: 'activity',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'activityPatterns',
      name: 'Padrões de Atividade',
      description: 'Identificação de padrões regulares de atividade',
      category: 'activity',
      available: true,
      estimatedSize: 'medium'
    }
  ],
  members: [
    {
      id: 'memberRanking',
      name: 'Ranking de Membros',
      description: 'Lista dos membros mais ativos do grupo',
      category: 'members',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'memberEvolution',
      name: 'Evolução dos Membros',
      description: 'Histórico de atividade dos principais membros',
      category: 'members',
      available: true,
      estimatedSize: 'large'
    },
    {
      id: 'memberConcentration',
      name: 'Concentração de Atividade',
      description: 'Análise da distribuição de participação entre membros',
      category: 'members',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'participationTrends',
      name: 'Tendências de Participação',
      description: 'Padrões de engajamento dos membros ao longo do tempo',
      category: 'members',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'influencerAnalysis',
      name: 'Análise de Influenciadores',
      description: 'Identificação dos membros mais influentes',
      category: 'members',
      available: true,
      estimatedSize: 'medium'
    }
  ],
  trends: [
    {
      id: 'trendAnalysis',
      name: 'Análise de Tendências',
      description: 'Identificação de padrões e tendências temporais',
      category: 'trends',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'seasonalPatterns',
      name: 'Padrões Sazonais',
      description: 'Variações de atividade por períodos do ano',
      category: 'trends',
      available: true,
      estimatedSize: 'medium'
    }
  ],
  behavior: [
    {
      id: 'engagementAnalysis',
      name: 'Análise de Engajamento',
      description: 'Métricas de participação e envolvimento',
      category: 'behavior',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'activityPeaks',
      name: 'Picos de Atividade',
      description: 'Momentos de maior engajamento do grupo',
      category: 'behavior',
      available: true,
      estimatedSize: 'small'
    },
    {
      id: 'consistencyAnalysis',
      name: 'Análise de Consistência',
      description: 'Regularidade da atividade do grupo',
      category: 'behavior',
      available: true,
      estimatedSize: 'small'
    }
  ],
  content: [
    {
      id: 'wordStatistics',
      name: 'Estatísticas de Palavras',
      description: 'Análise do conteúdo textual das mensagens',
      category: 'content',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'mediaAnalysis',
      name: 'Análise de Mídia',
      description: 'Uso de imagens, vídeos e outros tipos de mídia',
      category: 'content',
      available: true,
      estimatedSize: 'small'
    }
  ],
  insights: [
    {
      id: 'keyInsights',
      name: 'Insights Principais',
      description: 'Descobertas e padrões mais importantes identificados',
      category: 'insights',
      available: true,
      estimatedSize: 'medium'
    },
    {
      id: 'anomalyDetection',
      name: 'Detecção de Anomalias',
      description: 'Identificação de padrões anômalos no grupo',
      category: 'insights',
      available: true,
      estimatedSize: 'small'
    },
    {
      id: 'growthProjections',
      name: 'Projeções de Crescimento',
      description: 'Previsões baseadas em tendências históricas',
      category: 'insights',
      available: true,
      estimatedSize: 'medium'
    }
  ]
};

// === CONFIGURAÇÕES DOS TEMPLATES ===

export const completeReportTemplate: TemplateConfig = {
  id: 'complete',
  name: 'Relatório Completo',
  description: 'Análise abrangente com todas as métricas, gráficos e insights detalhados.',
  icon: 'BarChart3',
  previewSupported: true,
  estimatedTime: '3-5 minutos',
  complexity: 'advanced',
  requiredData: ['daily_stats', 'member_stats', 'hourly_activity'],
  formats: ['csv', 'pdf', 'png'],
  sections: [
    AVAILABLE_SECTIONS.overview[0],
    AVAILABLE_SECTIONS.overview[1],
    AVAILABLE_SECTIONS.activity[0],
    AVAILABLE_SECTIONS.activity[1],
    AVAILABLE_SECTIONS.activity[2],
    AVAILABLE_SECTIONS.activity[3],
    AVAILABLE_SECTIONS.activity[4],
    AVAILABLE_SECTIONS.activity[5],
    AVAILABLE_SECTIONS.members[0],
    AVAILABLE_SECTIONS.members[1],
    AVAILABLE_SECTIONS.members[2],
    AVAILABLE_SECTIONS.members[3],
    AVAILABLE_SECTIONS.members[4],
    AVAILABLE_SECTIONS.trends[0],
    AVAILABLE_SECTIONS.trends[1],
    AVAILABLE_SECTIONS.behavior[0],
    AVAILABLE_SECTIONS.behavior[1],
    AVAILABLE_SECTIONS.behavior[2],
    AVAILABLE_SECTIONS.content[0],
    AVAILABLE_SECTIONS.content[1],
    AVAILABLE_SECTIONS.insights[0],
    AVAILABLE_SECTIONS.insights[1],
    AVAILABLE_SECTIONS.insights[2]
  ],
  defaultOptions: {
    includeGeneralStats: true,
    includeDailyActivity: true,
    includeMemberRanking: true,
    includeHourlyActivity: true,
    includeInsights: true,
    includeActivityPatterns: true,
    includeEngagementAnalysis: true,
    includeTimeDistribution: true,
    includeWordStatistics: true,
    includeMediaAnalysis: true,
    includePeakHours: true,
    includeConsistencyAnalysis: true,
    includeMemberEvolution: true,
    includeTrendAnalysis: true,
    includeParticipationDecline: true,
    includeParticipationTrends: false,
    includeMemberGrowth: false,
    includeEngagementRates: true,
    includeBehaviorPatterns: false,
    includeActivityPeaks: true,
    includeMemberConcentration: false,
    includeLeadershipEmergence: false,
    includeInfluencerAnalysis: false,
    includeSeasonalPatterns: false,
    includeWeekdayWeekendComparison: false,
    includeTimeZoneAnalysis: false,
    includePeakActivityAnalysis: true,
    includeContentQuality: false,
    includeTopicDistribution: false,
    includeMediaPatterns: true,
    includeResponseAnalysis: false,
    includeConversationDepth: false,
    includePeriodComparison: false,
    includeBenchmarkAnalysis: false,
    includeGrowthProjections: false,
    includeAnomalyDetection: false,
    includeNetworkAnalysis: false,
    includeCommunityDetection: false,
    includeInfluenceMapping: false,
    includeMentionAnalysis: false,
    maxMembersInRanking: 20,
    colorTheme: 'blue',
    rankingDisplay: 'table',
    showMemberStats: true,
    showActivityTrends: true,
    showDetailedMetrics: true,
    includeCharts: true,
    includePredictions: false,
    reportStyle: 'detailed',
    chartStyle: 'modern',
    showGridLines: true,
    showDataLabels: true,
    useGradients: true,
    animatedCharts: false,
    enablePeriodComparison: false,
    comparisonPeriods: [],
    baselineCalculation: 'average',
    insightDepth: 'advanced',
    includeRecommendations: true,
    includeActionItems: true,
    includeRiskAssessment: false,
    memberDisplayMode: 'detailed',
    includeMemberInsights: true,
    showMemberActivity: true,
    showMemberComparison: true,
    includeMemberProfiles: false,
    showMemberNetworks: false,
    includeMemberJourney: false,
    includeRawData: false,
    includeMetadata: true,
    includeDataDictionary: false,
    watermark: true,
    logoInclude: true
  }
};

export const membersReportTemplate: TemplateConfig = {
  id: 'members',
  name: 'Relatório de Membros',
  description: 'Foco detalhado nos membros com ranking, análises individuais e padrões de participação.',
  icon: 'Users',
  previewSupported: true,
  estimatedTime: '2-3 minutos',
  complexity: 'intermediate',
  requiredData: ['member_stats', 'daily_stats'],
  formats: ['csv', 'pdf', 'png'],
  sections: [
    AVAILABLE_SECTIONS.overview[0],
    AVAILABLE_SECTIONS.members[0],
    AVAILABLE_SECTIONS.members[1],
    AVAILABLE_SECTIONS.members[2],
    AVAILABLE_SECTIONS.members[3],
    AVAILABLE_SECTIONS.members[4],
    AVAILABLE_SECTIONS.trends[0],
    AVAILABLE_SECTIONS.behavior[0],
    AVAILABLE_SECTIONS.behavior[1],
    AVAILABLE_SECTIONS.behavior[2],
    AVAILABLE_SECTIONS.content[0],
    AVAILABLE_SECTIONS.content[1]
  ],
  defaultOptions: {
    includeGeneralStats: true,
    includeDailyActivity: false,
    includeMemberRanking: true,
    includeHourlyActivity: false,
    includeInsights: true,
    includeActivityPatterns: false,
    includeEngagementAnalysis: true,
    includeTimeDistribution: false,
    includeWordStatistics: true,
    includeMediaAnalysis: true,
    includePeakHours: false,
    includeConsistencyAnalysis: false,
    includeMemberEvolution: true,
    includeTrendAnalysis: false,
    includeParticipationDecline: false,
    includeParticipationTrends: true,
    includeMemberGrowth: true,
    includeEngagementRates: true,
    includeBehaviorPatterns: false,
    includeActivityPeaks: false,
    includeMemberConcentration: true,
    includeLeadershipEmergence: false,
    includeInfluencerAnalysis: true,
    includeSeasonalPatterns: false,
    includeWeekdayWeekendComparison: false,
    includeTimeZoneAnalysis: false,
    includePeakActivityAnalysis: false,
    includeContentQuality: false,
    includeTopicDistribution: false,
    includeMediaPatterns: true,
    includeResponseAnalysis: false,
    includeConversationDepth: false,
    includePeriodComparison: false,
    includeBenchmarkAnalysis: false,
    includeGrowthProjections: false,
    includeAnomalyDetection: false,
    includeNetworkAnalysis: false,
    includeCommunityDetection: false,
    includeInfluenceMapping: false,
    includeMentionAnalysis: false,
    maxMembersInRanking: 50,
    colorTheme: 'green',
    rankingDisplay: 'cards',
    showMemberStats: true,
    showActivityTrends: true,
    showDetailedMetrics: true,
    includeCharts: true,
    includePredictions: false,
    reportStyle: 'detailed',
    chartStyle: 'modern',
    showGridLines: true,
    showDataLabels: true,
    useGradients: true,
    animatedCharts: false,
    enablePeriodComparison: false,
    comparisonPeriods: [],
    baselineCalculation: 'average',
    insightDepth: 'advanced',
    includeRecommendations: true,
    includeActionItems: true,
    includeRiskAssessment: false,
    memberDisplayMode: 'comprehensive',
    includeMemberInsights: true,
    showMemberActivity: true,
    showMemberComparison: true,
    includeMemberProfiles: true,
    showMemberNetworks: false,
    includeMemberJourney: true,
    includeRawData: false,
    includeMetadata: true,
    includeDataDictionary: false,
    watermark: true,
    logoInclude: true
  }
};

export const executiveReportTemplate: TemplateConfig = {
  id: 'executive',
  name: 'Relatório Executivo',
  description: 'Visão estratégica condensada com métricas-chave e insights principais para tomada de decisão.',
  icon: 'Target',
  previewSupported: true,
  estimatedTime: '1-2 minutos',
  complexity: 'basic',
  requiredData: ['daily_stats', 'member_stats'],
  formats: ['pdf', 'png'],
  sections: [
    AVAILABLE_SECTIONS.overview[1],
    AVAILABLE_SECTIONS.insights[0],
    AVAILABLE_SECTIONS.overview[0],
    AVAILABLE_SECTIONS.trends[0],
    AVAILABLE_SECTIONS.insights[1],
    AVAILABLE_SECTIONS.insights[2]
  ],
  defaultOptions: {
    includeGeneralStats: true,
    includeDailyActivity: false,
    includeMemberRanking: false,
    includeHourlyActivity: false,
    includeInsights: true,
    includeActivityPatterns: false,
    includeEngagementAnalysis: false,
    includeTimeDistribution: false,
    includeWordStatistics: false,
    includeMediaAnalysis: false,
    includePeakHours: false,
    includeConsistencyAnalysis: false,
    includeMemberEvolution: false,
    includeTrendAnalysis: true,
    includeParticipationDecline: true,
    includeParticipationTrends: false,
    includeMemberGrowth: false,
    includeEngagementRates: false,
    includeBehaviorPatterns: false,
    includeActivityPeaks: false,
    includeMemberConcentration: false,
    includeLeadershipEmergence: false,
    includeInfluencerAnalysis: false,
    includeSeasonalPatterns: false,
    includeWeekdayWeekendComparison: false,
    includeTimeZoneAnalysis: false,
    includePeakActivityAnalysis: false,
    includeContentQuality: false,
    includeTopicDistribution: false,
    includeMediaPatterns: false,
    includeResponseAnalysis: false,
    includeConversationDepth: false,
    includePeriodComparison: false,
    includeBenchmarkAnalysis: false,
    includeGrowthProjections: false,
    includeAnomalyDetection: true,
    includeNetworkAnalysis: false,
    includeCommunityDetection: false,
    includeInfluenceMapping: false,
    includeMentionAnalysis: false,
    maxMembersInRanking: 10,
    colorTheme: 'purple',
    rankingDisplay: 'minimal',
    showMemberStats: false,
    showActivityTrends: true,
    showDetailedMetrics: false,
    includeCharts: true,
    includePredictions: false,
    reportStyle: 'executive',
    chartStyle: 'minimal',
    showGridLines: false,
    showDataLabels: true,
    useGradients: false,
    animatedCharts: false,
    enablePeriodComparison: false,
    comparisonPeriods: [],
    baselineCalculation: 'average',
    insightDepth: 'basic',
    includeRecommendations: true,
    includeActionItems: true,
    includeRiskAssessment: true,
    memberDisplayMode: 'minimal',
    includeMemberInsights: false,
    showMemberActivity: false,
    showMemberComparison: false,
    includeMemberProfiles: false,
    showMemberNetworks: false,
    includeMemberJourney: false,
    includeRawData: false,
    includeMetadata: false,
    includeDataDictionary: false,
    watermark: true,
    logoInclude: true
  }
};

// === REGISTRO DE TEMPLATES ===
export const TEMPLATE_REGISTRY: Record<ReportTemplate, TemplateConfig> = {
  complete: completeTemplate,
  members: membersTemplate,
  executive: executiveTemplate,
  analytics: completeTemplate, // Placeholder
  trends: completeTemplate, // Placeholder
  insights: completeTemplate, // Placeholder
  comparison: completeTemplate // Placeholder
};

// === FUNÇÕES UTILITÁRIAS ===

export function getTemplateById(id: ReportTemplate): TemplateConfig {
  const template = TEMPLATE_REGISTRY[id];
  if (!template) {
    throw new Error(`Template "${id}" não encontrado`);
  }
  return template;
}

export function getAllTemplates(): TemplateConfig[] {
  return Object.values(TEMPLATE_REGISTRY);
}

export function getTemplatesByComplexity(complexity: 'basic' | 'intermediate' | 'advanced'): TemplateConfig[] {
  return getAllTemplates().filter(template => template.complexity === complexity);
}

export function getTemplatesByFormat(format: 'csv' | 'pdf' | 'png'): TemplateConfig[] {
  return getAllTemplates().filter(template => template.formats.includes(format));
}

export function getSectionsByCategory(category: string): ReportSection[] {
  return AVAILABLE_SECTIONS[category] || [];
}

export function getAvailableSections(): ReportSection[] {
  return Object.values(AVAILABLE_SECTIONS).flat();
}

export function getPremiumSections(): ReportSection[] {
  return Object.values(AVAILABLE_SECTIONS).flat().filter(section => section.premium);
}

// === VALIDAÇÕES ===

export function validateTemplateConfig(template: TemplateConfig): boolean {
  // Verificar se todas as seções estão disponíveis
  const unavailableSections = template.sections.filter(section => !section.available);
  if (unavailableSections.length > 0) {
    console.warn(`Template ${template.id} possui seções indisponíveis:`, unavailableSections);
    return false;
  }
  
  // Verificar se os formatos são válidos
  const validFormats = ['csv', 'pdf', 'png'];
  const invalidFormats = template.formats.filter(format => !validFormats.includes(format));
  if (invalidFormats.length > 0) {
    console.warn(`Template ${template.id} possui formatos inválidos:`, invalidFormats);
    return false;
  }
  
  return true;
}

export function getEstimatedSize(sections: ReportSection[]): string {
  const sizes = { small: 1, medium: 2, large: 3 };
  const totalSize = sections.reduce((sum, section) => {
    return sum + (sizes[section.estimatedSize || 'medium'] || 2);
  }, 0);
  
  if (totalSize <= 5) return 'Pequeno (~1-2 MB)';
  if (totalSize <= 10) return 'Médio (~3-5 MB)';
  return 'Grande (~6+ MB)';
}

export function getSectionById(id: string): ReportSection | undefined {
  for (const sections of Object.values(AVAILABLE_SECTIONS)) {
    const section = sections.find(s => s.id === id);
    if (section) return section;
  }
  return undefined;
}

export function templateSupportsFormat(templateId: ReportTemplate, format: string): boolean {
  const template = getTemplateById(templateId);
  return template.formats.includes(format as any);
}

export function getTemplateSections(templateId: ReportTemplate): ReportSection[] {
  const template = getTemplateById(templateId);
  return template.sections;
}

export function createCustomTemplate(
  id: string, 
  config: Omit<TemplateConfig, 'id'>
): TemplateConfig {
  return {
    id: id as ReportTemplate,
    ...config
  };
} 