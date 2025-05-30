import { DetailedStats } from '@/lib/analysis';

export interface ReportOptions {
  // === SEÇÕES PRINCIPAIS ===
  includeGeneralStats: boolean;
  includeDailyActivity: boolean;
  includeMemberRanking: boolean;
  includeHourlyActivity: boolean;
  includeInsights: boolean;
  includeActivityPatterns: boolean;
  includeEngagementAnalysis: boolean;
  includeTimeDistribution: boolean;
  includeWordStatistics: boolean;
  includeMediaAnalysis: boolean;
  includePeakHours: boolean;
  includeConsistencyAnalysis: boolean;
  includeMemberEvolution: boolean;
  includeTrendAnalysis: boolean;
  
  // === ANÁLISES AVANÇADAS ===
  // Análises de Participação
  includeParticipationDecline: boolean;
  includeParticipationTrends: boolean;
  includeMemberGrowth: boolean;
  includeEngagementRates: boolean;
  
  // Análises de Comportamento
  includeBehaviorPatterns: boolean;
  includeActivityPeaks: boolean;
  includeMemberConcentration: boolean;
  includeLeadershipEmergence: boolean;
  includeInfluencerAnalysis: boolean;
  
  // Análises Temporais
  includeSeasonalPatterns: boolean;
  includeWeekdayWeekendComparison: boolean;
  includeTimeZoneAnalysis: boolean;
  includePeakActivityAnalysis: boolean;
  
  // Análises de Conteúdo
  includeContentQuality: boolean;
  includeTopicDistribution: boolean;
  includeMediaPatterns: boolean;
  includeResponseAnalysis: boolean;
  includeConversationDepth: boolean;
  
  // Análises Comparativas
  includePeriodComparison: boolean;
  includeBenchmarkAnalysis: boolean;
  includeGrowthProjections: boolean;
  includeAnomalyDetection: boolean;
  
  // Análises de Rede Social
  includeNetworkAnalysis: boolean;
  includeCommunityDetection: boolean;
  includeInfluenceMapping: boolean;
  includeMentionAnalysis: boolean;
  
  // === CONFIGURAÇÕES ESPECÍFICAS ===
  maxMembersInRanking: number;
  colorTheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'indigo' | 'pink';
  rankingDisplay: 'table' | 'cards' | 'minimal' | 'detailed';
  showMemberStats: boolean;
  showActivityTrends: boolean;
  showDetailedMetrics: boolean;
  includeCharts: boolean;
  includePredictions: boolean;
  reportStyle: 'standard' | 'executive' | 'detailed' | 'visual' | 'minimal';
  
  // === CONFIGURAÇÕES DE VISUALIZAÇÃO ===
  chartStyle: 'modern' | 'classic' | 'minimal' | 'colorful';
  showGridLines: boolean;
  showDataLabels: boolean;
  useGradients: boolean;
  animatedCharts: boolean;
  
  // === CONFIGURAÇÕES DE PERÍODO ===
  enablePeriodComparison: boolean;
  comparisonPeriods: ('previous' | 'monthly' | 'quarterly' | 'yearly')[];
  baselineCalculation: 'average' | 'median' | 'trend';
  
  // === CONFIGURAÇÕES DE INSIGHTS ===
  insightDepth: 'basic' | 'advanced' | 'expert';
  includeRecommendations: boolean;
  includeActionItems: boolean;
  includeRiskAssessment: boolean;
  
  // === PARA RELATÓRIO DE MEMBROS ===
  memberDisplayMode: 'ranking' | 'detailed' | 'cards' | 'minimal' | 'comprehensive';
  includeMemberInsights: boolean;
  showMemberActivity: boolean;
  showMemberComparison: boolean;
  includeMemberProfiles: boolean;
  showMemberNetworks: boolean;
  includeMemberJourney: boolean;
  
  // === CONFIGURAÇÕES DE EXPORTAÇÃO ===
  includeRawData: boolean;
  includeMetadata: boolean;
  includeDataDictionary: boolean;
  watermark: boolean;
  logoInclude: boolean;
}

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  option: 'all' | '7days' | '15days' | '30days' | '60days' | '90days' | 'custom';
  customRange?: { from: Date; to: Date };
  timezone?: string;
  includeWeekends?: boolean;
  businessHoursOnly?: boolean;
}

export interface ReportGroup {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  member_count?: number;
  created_at?: string;
  category?: string;
  tags?: string[];
}

export interface ReportData {
  group: ReportGroup;
  period: ReportPeriod;
  template: ReportTemplate;
  format: ReportFormat;
  options: ReportOptions;
  stats: DetailedStats;
  metadata?: {
    createdAt: Date;
    version: string;
    exportedBy?: string;
    generator: string;
    processingTime?: number;
  };
}

export type ReportTemplate = 'complete' | 'members' | 'executive' | 'analytics' | 'trends' | 'insights' | 'comparison';
export type ReportFormat = 'csv' | 'pdf' | 'png';

export interface ReportSection {
  id: string;
  name: string;
  description: string;
  category: 'overview' | 'activity' | 'members' | 'insights' | 'trends' | 'behavior' | 'content' | 'network';
  available: boolean;
  required?: boolean;
  premium?: boolean;
  dependencies?: string[];
  estimatedSize?: 'small' | 'medium' | 'large';
  dataRequirements?: string[];
}

export interface TemplateConfig {
  id: ReportTemplate;
  name: string;
  description: string;
  icon: string;
  sections: ReportSection[];
  formats: ReportFormat[];
  defaultOptions: Partial<ReportOptions>;
  previewSupported: boolean;
  estimatedTime: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  requiredData: string[];
}

export interface ReportInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning' | 'critical' | 'opportunity';
  category: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'stable' | 'volatile';
  confidence?: number;
  recommendation?: string;
  actionItems?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  dataSource?: string;
  calculationMethod?: string;
  relatedInsights?: string[];
}

// === TIPOS PARA PREVIEW ===
export interface ReportPreview {
  id: string;
  template: ReportTemplate;
  format: ReportFormat;
  sections: PreviewSection[];
  estimatedFileSize: string;
  estimatedGenerationTime: string;
  lastUpdated: Date;
}

export interface PreviewSection {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'metric' | 'insight' | 'text';
  data: any;
  visible: boolean;
  order: number;
  customization?: {
    title?: string;
    subtitle?: string;
    colors?: string[];
    chartType?: string;
  };
}

// === TIPOS PARA ANÁLISES AVANÇADAS ===
export interface AdvancedAnalysis {
  participationAnalysis?: {
    declineDetected: boolean;
    growthRate: number;
    memberRetention: number;
    engagementScore: number;
  };
  
  behaviorAnalysis?: {
    patterns: BehaviorPattern[];
    anomalies: Anomaly[];
    influencers: Influencer[];
    clusters: MemberCluster[];
  };
  
  temporalAnalysis?: {
    seasonalPatterns: SeasonalPattern[];
    peakHours: PeakHour[];
    weekdayPatterns: WeekdayPattern[];
    trendProjections: TrendProjection[];
  };
  
  contentAnalysis?: {
    qualityScore: number;
    topicDistribution: TopicDistribution[];
    mediaUsage: MediaUsage;
    responsePatterns: ResponsePattern[];
  };
  
  networkAnalysis?: {
    centrality: NetworkCentrality[];
    communities: Community[];
    influenceMap: InfluenceMap;
    mentionNetwork: MentionNetwork;
  };
}

export interface BehaviorPattern {
  id: string;
  type: 'posting' | 'response' | 'engagement' | 'timing';
  description: string;
  frequency: number;
  confidence: number;
  members: string[];
}

export interface Anomaly {
  id: string;
  type: 'spike' | 'drop' | 'unusual_pattern' | 'outlier';
  date: Date;
  value: number;
  expected: number;
  deviation: number;
  description: string;
}

export interface Influencer {
  memberId: string;
  memberName: string;
  influenceScore: number;
  reach: number;
  engagement: number;
  categories: string[];
}

export interface MemberCluster {
  id: string;
  name: string;
  members: string[];
  characteristics: string[];
  activityLevel: 'low' | 'medium' | 'high';
}

export interface SeasonalPattern {
  period: 'daily' | 'weekly' | 'monthly';
  pattern: string;
  strength: number;
  description: string;
}

export interface PeakHour {
  hour: number;
  activity: number;
  dayType: 'weekday' | 'weekend';
  description: string;
}

export interface WeekdayPattern {
  day: string;
  activity: number;
  patterns: string[];
}

export interface TrendProjection {
  metric: string;
  currentValue: number;
  projectedValue: number;
  timeframe: string;
  confidence: number;
}

export interface TopicDistribution {
  topic: string;
  frequency: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  engagement: number;
}

export interface MediaUsage {
  images: number;
  videos: number;
  audio: number;
  documents: number;
  stickers: number;
  gifs: number;
}

export interface ResponsePattern {
  type: 'quick' | 'delayed' | 'ignored';
  frequency: number;
  averageTime: number;
  members: string[];
}

export interface NetworkCentrality {
  memberId: string;
  memberName: string;
  centrality: number;
  type: 'betweenness' | 'closeness' | 'degree' | 'eigenvector';
}

export interface Community {
  id: string;
  name: string;
  members: string[];
  cohesion: number;
  characteristics: string[];
}

export interface InfluenceMap {
  nodes: InfluenceNode[];
  edges: InfluenceEdge[];
}

export interface InfluenceNode {
  id: string;
  name: string;
  influence: number;
  category: string;
}

export interface InfluenceEdge {
  source: string;
  target: string;
  weight: number;
  type: 'responds_to' | 'mentions' | 'influences';
}

export interface MentionNetwork {
  totalMentions: number;
  topMentioned: Array<{ name: string; count: number }>;
  mentionPatterns: Array<{ pattern: string; frequency: number }>;
} 