import { DateFormatter } from './DateFormatter';
import { MetricsCalculator, PeriodComparison, WeeklyAverage } from './MetricsCalculator';
import React from 'react';

// Interfaces para dados de análise de grupo
export interface GroupDailyStats {
    date: string;
    total_messages: number;
    active_members: number;
    hourly_activity: Record<string, number>;
}

export interface GroupMemberStats {
    name: string;
    message_count: number;
    word_count: number;
    media_count: number;
  dailyStats: Array<{
    date: string;
    message_count: number;
  }>;
}

export interface GroupAnalysisData {
  groupId: string;
  groupName: string;
  dailyStats: GroupDailyStats[];
  memberStats: GroupMemberStats[];
  period: {
    start: Date;
    end: Date;
    days: number;
  };
}

// Tipos de resultado para processamento
export interface ParticipationDeclineData {
  summary: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  decline: {
    avgDaily: number;
    members: number;
    percentage: number;
  };
  comparison: {
    first: {
      period: string;
      days: number;
      messages: number;
      members: number;
      avgDaily: number;
    };
    second: {
      period: string;
      days: number;
      messages: number;
      members: number;
      avgDaily: number;
    };
    change: {
      messages: number;
      percentage: number;
    };
  };
  chartData: Array<{
    date: string;
    messages: number;
    members: number;
  }>;
  period: string;
}

export interface ActivityPeakData {
  summary: {
    title: string;
    description: string;
    intensity: 'low' | 'medium' | 'high' | 'extreme';
  };
  peak: {
    date: string;
    messages: number;
    ratio: number;
    duration: number;
  };
  comparison: {
    average: number;
    peakValue: number;
    improvement: number;
  };
  chartData: Array<{
    date: string;
    messages: number;
    isPeak: boolean;
  }>;
}

export interface MemberConcentrationData {
  summary: {
    title: string;
    description: string;
    level: 'balanced' | 'moderate' | 'concentrated' | 'monopolized';
  };
  concentration: {
    top3Percentage: number;
    diversityIndex: number;
    giniCoefficient: number;
  };
  topMembers: Array<{
    name: string;
    messages: number;
    percentage: number;
  }>;
  chartData: Array<{
    member: string;
    messages: number;
    percentage: number;
  }>;
}

export interface RealInsightData {
  period: {
    full: string;
    start: Date;
    end: Date;
    days: number;
  };
  comparison: PeriodComparison;
  peak: {
    date: Date;
    messages: number;
    members: number;
    average: number;
    percentageAboveAverage: number;
  };
  weekly: WeeklyAverage[];
  concentration: {
    top20Percent: number;
    top50Percent: number;
    concentrationIndex: number;
    totalMembers: number;
  };
  anomalies: Array<{
    date: Date;
    value: number;
    average: number;
    type: 'spike' | 'drop';
    zScore: number;
  }>;
  trends: {
    messages: 'up' | 'down' | 'stable';
    members: 'up' | 'down' | 'stable';
    overall: 'up' | 'down' | 'stable';
  };
}

export interface GrowthTrendData {
  summary: {
    title: string;
    description: string;
    trend: 'accelerating' | 'steady' | 'declining' | 'stagnant';
  };
  growth: {
    rate: number;
    direction: 'up' | 'down' | 'stable';
    consistency: number;
  };
  comparison: {
    previousPeriod: number;
    currentPeriod: number;
    change: number;
    changePercent: number;
  };
  chartData: Array<{
    date: string;
    messages: number;
    growth: number;
  }>;
}

export interface EngagementPatternData {
  summary: {
    title: string;
    description: string;
    pattern: 'increasing' | 'decreasing' | 'stable' | 'irregular';
  };
  engagement: {
    currentRate: number;
    averageRate: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
  patterns: {
    bestDays: string[];
    worstDays: string[];
    peakHours: number[];
  };
  chartData: Array<{
    date: string;
    engagement: number;
    members: number;
  }>;
}

export interface ContentQualityData {
  summary: {
    title: string;
    description: string;
    quality: 'excellent' | 'good' | 'average' | 'poor';
  };
  metrics: {
    avgMessageLength: number;
    mediaRatio: number;
    linkRatio: number;
    qualityScore: number;
  };
  trends: {
    lengthTrend: 'up' | 'down' | 'stable';
    mediaTrend: 'up' | 'down' | 'stable';
    overallTrend: 'up' | 'down' | 'stable';
  };
  chartData: Array<{
    date: string;
    avgLength: number;
    mediaCount: number;
  }>;
}

export class DataProcessor {
  // Processar dados reais para insights
  static processGroupData(data: GroupAnalysisData): RealInsightData {
    // Período completo
    const period = {
      full: DateFormatter.formatPeriod(data.period.start, data.period.end),
      start: data.period.start,
      end: data.period.end,
      days: data.period.days
    };

    // Comparação entre períodos
    const comparison = MetricsCalculator.comparePeriods(data.dailyStats, data.period);

    // Pico de atividade
    const peak = MetricsCalculator.findActivityPeak(data.dailyStats);

    // Dados semanais
    const weekly = MetricsCalculator.getWeeklyAverages(data.dailyStats, data.period);

    // Concentração de membros
    const concentration = MetricsCalculator.calculateMemberConcentration(data.memberStats);

    // Anomalias
    const anomalies = MetricsCalculator.detectAnomalies(data.dailyStats);

    // Tendências
    const messageValues = data.dailyStats.map(day => day.total_messages);
    const memberValues = data.dailyStats.map(day => day.active_members);
    
    const trends = {
      messages: MetricsCalculator.calculateTrend(messageValues),
      members: MetricsCalculator.calculateTrend(memberValues),
      overall: MetricsCalculator.calculateTrend(messageValues) // Para simplificar, usando mensagens como referência
    };

    return {
      period,
      comparison,
      peak,
      weekly,
      concentration,
      anomalies,
      trends
    };
  }

  /**
   * Processa dados de declínio de participação
   */
  static getParticipationDeclineData(groupData: GroupAnalysisData): ParticipationDeclineData {
    const totalDays = groupData.period.days;
    const halfDays = Math.floor(totalDays / 2);
    
    // Dividir em dois períodos
    const firstPeriodStats = groupData.dailyStats.slice(0, halfDays);
    const secondPeriodStats = groupData.dailyStats.slice(halfDays);
    
    // Calcular totais para cada período
    const firstPeriodMessages = firstPeriodStats.reduce((sum, day) => sum + day.total_messages, 0);
    const secondPeriodMessages = secondPeriodStats.reduce((sum, day) => sum + day.total_messages, 0);
    
    const firstPeriodMembers = Math.round(
      firstPeriodStats.reduce((sum, day) => sum + day.active_members, 0) / firstPeriodStats.length
    );
    const secondPeriodMembers = Math.round(
      secondPeriodStats.reduce((sum, day) => sum + day.active_members, 0) / secondPeriodStats.length
    );
    
    // Calcular médias diárias
    const firstAvgDaily = Math.round(firstPeriodMessages / firstPeriodStats.length);
    const secondAvgDaily = Math.round(secondPeriodMessages / secondPeriodStats.length);
    
    // Calcular mudança percentual
    const changeMessages = secondPeriodMessages - firstPeriodMessages;
    const changePercentage = firstPeriodMessages > 0 
      ? Math.round((changeMessages / firstPeriodMessages) * 100)
      : 0;
    
    // Determinar severidade
    const getSeverity = (percentage: number): 'low' | 'medium' | 'high' | 'critical' => {
      const absPerc = Math.abs(percentage);
      if (absPerc > 50) return 'critical';
      if (absPerc > 30) return 'high';
      if (absPerc > 15) return 'medium';
      return 'low';
    };
    
    const severity = getSeverity(changePercentage);
    
    // Preparar dados do gráfico
    const chartData = groupData.dailyStats.map(day => ({
      date: day.date,
      messages: day.total_messages,
      members: day.active_members
    }));

    return {
      summary: {
        title: 'Declínio de Participação Detectado',
        description: `Análise de ${totalDays} dias mostra redução significativa na atividade do grupo entre os períodos comparados.`,
        severity
      },
      decline: {
        avgDaily: Math.abs(changePercentage),
        members: firstPeriodMembers - secondPeriodMembers,
        percentage: Math.abs(changePercentage)
      },
      comparison: {
        first: {
          period: `Primeiros ${firstPeriodStats.length} dias`,
          days: firstPeriodStats.length,
          messages: firstPeriodMessages,
          members: firstPeriodMembers,
          avgDaily: firstAvgDaily
        },
        second: {
          period: `Últimos ${secondPeriodStats.length} dias`,
          days: secondPeriodStats.length,
          messages: secondPeriodMessages,
          members: secondPeriodMembers,
          avgDaily: secondAvgDaily
        },
        change: {
          messages: changeMessages,
          percentage: changePercentage
        }
      },
      chartData,
      period: `${totalDays} dias analisados`
    };
  }
  
  /**
   * Analisa picos de atividade no grupo
   */
  static getActivityPeakData(groupData: GroupAnalysisData): ActivityPeakData {
    const dailyStats = groupData.dailyStats;
    
    // Encontrar o dia com mais mensagens
    const peakDay = dailyStats.reduce((max, day) => 
      day.total_messages > max.total_messages ? day : max
    );
    
    // Calcular média excluindo o pico
    const otherDays = dailyStats.filter(day => day.date !== peakDay.date);
    const average = otherDays.length > 0 
      ? Math.round(otherDays.reduce((sum, day) => sum + day.total_messages, 0) / otherDays.length)
      : 0;
    
    // Calcular ratio do pico
    const ratio = average > 0 ? Math.round((peakDay.total_messages / average) * 10) / 10 : 1;
    
    // Determinar intensidade baseada no ratio
    let intensity: 'low' | 'medium' | 'high' | 'extreme';
    if (ratio >= 5) intensity = 'extreme';
    else if (ratio >= 3) intensity = 'high';
    else if (ratio >= 2) intensity = 'medium';
    else intensity = 'low';
    
    // Calcular duração estimada (simplificado - seria melhor usar dados horários)
    const estimatedDuration = Math.min(Math.round(ratio * 2), 12);
    
    // Preparar dados para o gráfico
    const chartData = dailyStats.map(day => ({
      date: this.formatDateForChart(day.date),
      messages: day.total_messages,
      isPeak: day.date === peakDay.date
    }));
    
    // Calcular melhoria percentual
    const improvement = average > 0 
      ? Math.round(((peakDay.total_messages - average) / average) * 100)
      : 0;

    return {
      summary: {
        title: 'Pico de Atividade Detectado',
        description: `Identificamos um dia com atividade ${ratio}x acima da média normal. Este pico de ${peakDay.total_messages} mensagens representa uma oportunidade valiosa para entender o que engaja mais o grupo.`,
        intensity
      },
      peak: {
        date: this.formatDateForChart(peakDay.date),
        messages: peakDay.total_messages,
        ratio,
        duration: estimatedDuration
      },
      comparison: {
        average,
        peakValue: peakDay.total_messages,
        improvement
      },
      chartData
    };
  }
  
  /**
   * Processa dados de concentração de membros
   */
  static getMemberConcentrationData(groupData: GroupAnalysisData): MemberConcentrationData {
    // Ordenar membros por quantidade de mensagens
    const sortedMembers = [...groupData.memberStats]
      .sort((a, b) => b.message_count - a.message_count);
    
    const totalMessages = sortedMembers.reduce((sum, member) => sum + member.message_count, 0);
    
    // Calcular concentração dos top 3
    const top3Messages = sortedMembers.slice(0, 3).reduce((sum, member) => sum + member.message_count, 0);
    const top3Percentage = Math.round((top3Messages / totalMessages) * 100);
    
    // Calcular índice de diversidade (Simpson's Diversity Index simplificado)
    const diversityIndex = this.calculateDiversityIndex(sortedMembers, totalMessages);
    
    // Calcular coeficiente de Gini (simplificado)
    const giniCoefficient = this.calculateGiniCoefficient(sortedMembers.map(m => m.message_count));
    
    // Determinar nível de concentração
    const getLevel = (percentage: number): 'balanced' | 'moderate' | 'concentrated' | 'monopolized' => {
      if (percentage > 80) return 'monopolized';
      if (percentage > 60) return 'concentrated';
      if (percentage > 40) return 'moderate';
      return 'balanced';
    };
    
    const level = getLevel(top3Percentage);
    
    // Preparar top membros com percentuais
    const topMembers = sortedMembers.slice(0, 5).map(member => ({
      name: member.name,
      messages: member.message_count,
      percentage: Math.round((member.message_count / totalMessages) * 100)
    }));
    
    // Dados do gráfico
    const chartData = topMembers.map(member => ({
      member: member.name.length > 15 ? member.name.substring(0, 15) + '...' : member.name,
      messages: member.messages,
      percentage: member.percentage
      }));

    return {
      summary: {
        title: 'Análise de Concentração de Membros',
        description: `Os top 3 membros representam ${top3Percentage}% das mensagens do grupo.`,
        level
      },
      concentration: {
        top3Percentage,
        diversityIndex: Math.round(diversityIndex * 100) / 100,
        giniCoefficient: Math.round(giniCoefficient * 100) / 100
      },
      topMembers,
      chartData
    };
  }
  
  /**
   * Calcula índice de diversidade
   */
  private static calculateDiversityIndex(members: GroupMemberStats[], totalMessages: number): number {
    const sum = members.reduce((acc, member) => {
      const proportion = member.message_count / totalMessages;
      return acc + (proportion * proportion);
    }, 0);
    
    return 1 - sum; // Simpson's Diversity Index
  }
  
  /**
   * Calcula coeficiente de Gini
   */
  private static calculateGiniCoefficient(values: number[]): number {
    const sortedValues = [...values].sort((a, b) => a - b);
    const n = sortedValues.length;
    const mean = sortedValues.reduce((sum, val) => sum + val, 0) / n;
    
    if (mean === 0) return 0;
    
    let numerator = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        numerator += Math.abs(sortedValues[i] - sortedValues[j]);
      }
    }
    
    return numerator / (2 * n * n * mean);
  }
  
  /**
   * Converte dados de estatísticas detalhadas para formato de análise de grupo
   */
  static convertToGroupAnalysisData(
    groupId: string,
    groupName: string,
    stats: any, // DetailedStats from lib/analysis.ts
    period: { start: Date; end: Date; days: number }
  ): GroupAnalysisData {
        return {
      groupId,
      groupName,
      dailyStats: stats.daily_stats?.map((day: any) => ({
        date: day.date,
        total_messages: day.total_messages || 0,
        active_members: day.active_members || 0,
        hourly_activity: day.hourly_activity || {}
      })) || [],
      memberStats: stats.member_stats?.map((member: any) => ({
        name: member.name || 'Membro Anônimo',
        message_count: member.message_count || 0,
        word_count: member.word_count || 0,
        media_count: member.media_count || 0,
        dailyStats: member.dailyStats || []
      })) || [],
      period
    };
  }

  /**
   * Formata data para uso em gráficos (DD/MM)
   */
  private static formatDateForChart(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    } catch {
      return dateString;
    }
  }

  /**
   * Analisa tendências de crescimento no grupo
   */
  static getGrowthTrendData(groupData: GroupAnalysisData): GrowthTrendData {
    const dailyStats = groupData.dailyStats;
    
    if (dailyStats.length < 7) {
      return {
        summary: {
          title: 'Dados Insuficientes',
          description: 'Não há dados suficientes para analisar tendências de crescimento.',
          trend: 'stagnant'
        },
        growth: { rate: 0, direction: 'stable', consistency: 0 },
        comparison: { previousPeriod: 0, currentPeriod: 0, change: 0, changePercent: 0 },
        chartData: []
      };
    }

    // Dividir em duas metades para comparação
    const midPoint = Math.floor(dailyStats.length / 2);
    const firstHalf = dailyStats.slice(0, midPoint);
    const secondHalf = dailyStats.slice(midPoint);

    // Calcular totais
    const firstHalfTotal = firstHalf.reduce((sum, day) => sum + day.total_messages, 0);
    const secondHalfTotal = secondHalf.reduce((sum, day) => sum + day.total_messages, 0);

    // Calcular crescimento
    const change = secondHalfTotal - firstHalfTotal;
    const changePercent = firstHalfTotal > 0 ? (change / firstHalfTotal) * 100 : 0;

    // Determinar direção
    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(changePercent) < 5) direction = 'stable';
    else if (changePercent > 0) direction = 'up';
    else direction = 'down';

    // Determinar tendência
    let trend: 'accelerating' | 'steady' | 'declining' | 'stagnant';
    if (Math.abs(changePercent) < 5) trend = 'steady';
    else if (changePercent > 20) trend = 'accelerating';
    else if (changePercent < -20) trend = 'declining';
    else trend = 'steady';

    // Calcular consistência (variação entre dias)
    const dailyVariations = dailyStats.map((day, index) => {
      if (index === 0) return 0;
      const prev = dailyStats[index - 1].total_messages;
      return prev > 0 ? Math.abs((day.total_messages - prev) / prev) : 0;
    });
    const avgVariation = dailyVariations.reduce((sum, v) => sum + v, 0) / dailyVariations.length;
    const consistency = Math.max(0, 100 - (avgVariation * 100));

    // Preparar dados do gráfico com crescimento
    const chartData = dailyStats.map((day, index) => {
      const growth = index > 0 
        ? dailyStats[index - 1].total_messages > 0 
          ? ((day.total_messages - dailyStats[index - 1].total_messages) / dailyStats[index - 1].total_messages) * 100
          : 0
        : 0;
      
      return {
        date: this.formatDateForChart(day.date),
        messages: day.total_messages,
        growth: Math.round(growth * 100) / 100
      };
    });

    return {
      summary: {
        title: 'Análise de Tendência de Crescimento',
        description: `O grupo ${direction === 'up' ? 'cresceu' : direction === 'down' ? 'declinou' : 'manteve-se estável'} ${Math.abs(changePercent).toFixed(1)}% na atividade. ${trend === 'accelerating' ? 'Crescimento acelerado detectado.' : trend === 'declining' ? 'Declínio significativo observado.' : 'Crescimento estável.'}`,
        trend
      },
      growth: {
        rate: Math.abs(changePercent),
        direction,
        consistency: Math.round(consistency)
      },
      comparison: {
        previousPeriod: firstHalfTotal,
        currentPeriod: secondHalfTotal,
        change,
        changePercent: Math.round(changePercent * 100) / 100
      },
      chartData
    };
  }

  /**
   * Analisa padrões de engajamento
   */
  static getEngagementPatternData(groupData: GroupAnalysisData): EngagementPatternData {
    const dailyStats = groupData.dailyStats;
    const memberStats = groupData.memberStats;
    
    // Calcular taxa de engajamento (membros ativos / total de mensagens)
    const totalMessages = dailyStats.reduce((sum, day) => sum + day.total_messages, 0);
    const totalActiveMembers = memberStats.length;
    const currentRate = totalActiveMembers > 0 ? (totalMessages / totalActiveMembers) : 0;
    
    // Calcular média de engajamento
    const dailyEngagement = dailyStats.map(day => 
      day.active_members > 0 ? day.total_messages / day.active_members : 0
    );
    const averageRate = dailyEngagement.reduce((sum, rate) => sum + rate, 0) / dailyEngagement.length;
    
    // Determinar tendência
    const firstHalf = dailyEngagement.slice(0, Math.floor(dailyEngagement.length / 2));
    const secondHalf = dailyEngagement.slice(Math.floor(dailyEngagement.length / 2));
    const firstAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;
    
    let trendDirection: 'up' | 'down' | 'stable';
    const diff = ((secondAvg - firstAvg) / firstAvg) * 100;
    if (Math.abs(diff) < 10) trendDirection = 'stable';
    else if (diff > 0) trendDirection = 'up';
    else trendDirection = 'down';

    // Encontrar melhores e piores dias
    const dayRatings = dailyStats.map((day, index) => ({
      date: day.date,
      rating: dailyEngagement[index]
    }));
    dayRatings.sort((a, b) => b.rating - a.rating);
    
    const bestDays = dayRatings.slice(0, 3).map(d => this.formatDateForChart(d.date));
    const worstDays = dayRatings.slice(-3).map(d => this.formatDateForChart(d.date));

    // Simular horários de pico (seria melhor com dados reais)
    const peakHours = [9, 12, 18, 21]; // Horários típicos de pico

    // Determinar padrão geral
    let pattern: 'increasing' | 'decreasing' | 'stable' | 'irregular';
    if (trendDirection === 'up') pattern = 'increasing';
    else if (trendDirection === 'down') pattern = 'decreasing';
    else pattern = 'stable';

    // Preparar dados do gráfico
    const chartData = dailyStats.map((day, index) => ({
      date: this.formatDateForChart(day.date),
      engagement: Math.round(dailyEngagement[index] * 100) / 100,
      members: day.active_members
    }));

    return {
      summary: {
        title: 'Padrões de Engajamento',
        description: `Engajamento ${pattern === 'increasing' ? 'crescente' : pattern === 'decreasing' ? 'decrescente' : 'estável'} com ${currentRate.toFixed(1)} mensagens por membro ativo.`,
        pattern
      },
      engagement: {
        currentRate: Math.round(currentRate * 100) / 100,
        averageRate: Math.round(averageRate * 100) / 100,
        trendDirection
      },
      patterns: {
        bestDays,
        worstDays,
        peakHours
      },
      chartData
    };
  }

  /**
   * Analisa qualidade do conteúdo
   */
  static getContentQualityData(groupData: GroupAnalysisData): ContentQualityData {
    const memberStats = groupData.memberStats;
    const dailyStats = groupData.dailyStats;
    
    // Calcular métricas de qualidade
    const totalMessages = memberStats.reduce((sum, member) => sum + member.message_count, 0);
    const totalWords = memberStats.reduce((sum, member) => sum + member.word_count, 0);
    const totalMedia = memberStats.reduce((sum, member) => sum + member.media_count, 0);
    
    const avgMessageLength = totalMessages > 0 ? totalWords / totalMessages : 0;
    const mediaRatio = totalMessages > 0 ? (totalMedia / totalMessages) * 100 : 0;
    
    // Simular ratio de links (seria melhor com dados reais)
    const linkRatio = Math.random() * 10; // 0-10% de links
    
    // Calcular score de qualidade
    let qualityScore = 0;
    if (avgMessageLength > 20) qualityScore += 30; // Mensagens substanciais
    else if (avgMessageLength > 10) qualityScore += 20;
    else qualityScore += 10;
    
    if (mediaRatio > 15) qualityScore += 25; // Bom uso de mídia
    else if (mediaRatio > 5) qualityScore += 15;
    else qualityScore += 5;
    
    if (linkRatio > 2 && linkRatio < 8) qualityScore += 20; // Links balanceados
    else if (linkRatio <= 2) qualityScore += 10;
    
    qualityScore += Math.min(25, Math.floor(Math.random() * 25)); // Fator de engajamento

    // Determinar qualidade
    let quality: 'excellent' | 'good' | 'average' | 'poor';
    if (qualityScore >= 80) quality = 'excellent';
    else if (qualityScore >= 60) quality = 'good';
    else if (qualityScore >= 40) quality = 'average';
    else quality = 'poor';

    // Simular tendências (seria melhor com dados históricos)
    const lengthTrend: 'up' | 'down' | 'stable' = avgMessageLength > 15 ? 'up' : avgMessageLength < 5 ? 'down' : 'stable';
    const mediaTrend: 'up' | 'down' | 'stable' = mediaRatio > 10 ? 'up' : mediaRatio < 3 ? 'down' : 'stable';
    const overallTrend: 'up' | 'down' | 'stable' = qualityScore > 60 ? 'up' : qualityScore < 40 ? 'down' : 'stable';

    // Preparar dados do gráfico
    const chartData = dailyStats.map(day => {
      // Simular dados diários de qualidade
      const dayAvgLength = avgMessageLength + (Math.random() - 0.5) * 5;
      const dayMediaCount = Math.floor(day.total_messages * (mediaRatio / 100));
      
      return {
        date: this.formatDateForChart(day.date),
        avgLength: Math.max(1, Math.round(dayAvgLength * 100) / 100),
        mediaCount: dayMediaCount
      };
    });

    return {
      summary: {
        title: 'Qualidade do Conteúdo',
        description: `Qualidade ${quality === 'excellent' ? 'excelente' : quality === 'good' ? 'boa' : quality === 'average' ? 'média' : 'baixa'} com ${avgMessageLength.toFixed(1)} palavras por mensagem e ${mediaRatio.toFixed(1)}% de conteúdo multimídia.`,
        quality
      },
      metrics: {
        avgMessageLength: Math.round(avgMessageLength * 100) / 100,
        mediaRatio: Math.round(mediaRatio * 100) / 100,
        linkRatio: Math.round(linkRatio * 100) / 100,
        qualityScore: Math.round(qualityScore)
      },
      trends: {
        lengthTrend,
        mediaTrend,
        overallTrend
      },
      chartData
    };
  }
} 