import { TemplateConfig, ReportSection } from '../types';

// Seções disponíveis para o relatório completo
const COMPLETE_SECTIONS: ReportSection[] = [
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
  },
  {
    id: 'keyInsights',
    name: 'Insights Principais',
    description: 'Descobertas e padrões mais importantes identificados',
    category: 'insights',
    available: true,
    estimatedSize: 'medium'
  },
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
    id: 'trendAnalysis',
    name: 'Análise de Tendências',
    description: 'Identificação de padrões e tendências temporais',
    category: 'trends',
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
  },
  {
    id: 'engagementAnalysis',
    name: 'Análise de Engajamento',
    description: 'Métricas de participação e envolvimento',
    category: 'behavior',
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
  },
  {
    id: 'wordStatistics',
    name: 'Estatísticas de Palavras',
    description: 'Análise do conteúdo textual das mensagens',
    category: 'content',
    available: true,
    estimatedSize: 'medium'
  }
];

export const completeTemplate: TemplateConfig = {
  id: 'complete',
  name: 'Relatório Completo',
  description: 'Análise abrangente com todas as métricas, gráficos e insights detalhados do grupo.',
  icon: 'BarChart3',
  previewSupported: true,
  estimatedTime: '3-5 minutos',
  complexity: 'advanced',
  requiredData: ['daily_stats', 'member_stats', 'hourly_activity'],
  formats: ['csv', 'pdf'], // Removido PNG conforme solicitado
  sections: COMPLETE_SECTIONS,
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
    includeParticipationTrends: true,
    includeMemberGrowth: true,
    includeEngagementRates: true,
    includeBehaviorPatterns: true,
    includeActivityPeaks: true,
    includeMemberConcentration: true,
    includeLeadershipEmergence: false,
    includeInfluencerAnalysis: true,
    includeSeasonalPatterns: false,
    includeWeekdayWeekendComparison: true,
    includeTimeZoneAnalysis: false,
    includePeakActivityAnalysis: true,
    includeContentQuality: true,
    includeTopicDistribution: false,
    includeMediaPatterns: true,
    includeResponseAnalysis: false,
    includeConversationDepth: true,
    includePeriodComparison: false,
    includeBenchmarkAnalysis: false,
    includeGrowthProjections: true,
    includeAnomalyDetection: true,
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
    includePredictions: true,
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
    includeRiskAssessment: true,
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