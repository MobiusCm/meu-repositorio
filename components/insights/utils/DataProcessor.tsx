import { DateFormatter } from './DateFormatter';
import { MetricsCalculator, PeriodComparison, WeeklyAverage } from './MetricsCalculator';

export interface GroupAnalysisData {
  groupId: string;
  groupName: string;
  dailyStats: Array<{
    date: string;
    total_messages: number;
    active_members: number;
    hourly_activity: Record<string, number>;
  }>;
  memberStats: Array<{
    name: string;
    message_count: number;
    word_count: number;
    media_count: number;
    dailyStats: Array<{ date: string; message_count: number }>;
  }>;
  period: {
    start: Date;
    end: Date;
    days: number;
  };
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

  // Dados específicos para declínio de participação
  static getParticipationDeclineData(data: GroupAnalysisData): {
    period: string;
    summary: {
      description: string;
    };
    comparison: PeriodComparison;
    decline: {
      messages: number;
      members: number;
      avgDaily: number;
    };
    chartData: Array<{ date: string; messages: number; members: number }>;
  } {
    const processed = this.processGroupData(data);

    // Gerar descrição baseada nos dados reais
    const description = `Detectado declínio significativo de ${Math.abs(processed.comparison.change.percentage)}% na atividade do grupo ${data.groupName}. ` +
      `A média diária de mensagens diminuiu de ${processed.comparison.first.avgDaily} para ${processed.comparison.second.avgDaily} mensagens, ` +
      `representando uma redução de ${Math.abs(processed.comparison.first.messages - processed.comparison.second.messages)} mensagens totais ` +
      `entre os períodos analisados (${DateFormatter.formatDayMonth(processed.period.start)} a ${DateFormatter.formatDayMonth(processed.period.end)}).`;

    return {
      period: processed.period.full,
      summary: {
        description
      },
      comparison: processed.comparison,
      decline: {
        messages: processed.comparison.change.messages,
        members: processed.comparison.change.members,
        avgDaily: processed.comparison.change.percentage
      },
      chartData: data.dailyStats.map(day => ({
        date: DateFormatter.formatForChart(DateFormatter.parseDate(day.date)),
        messages: day.total_messages,
        members: day.active_members
      }))
    };
  }

  // Dados específicos para tendência de crescimento
  static getGrowthTrendData(data: GroupAnalysisData): {
    period: string;
    weekly: WeeklyAverage[];
    trend: 'up' | 'down' | 'stable';
    growth: {
      weekly: number;
      projected: number;
    };
    chartData: Array<{ week: string; messages: number; growth: number }>;
  } {
    const processed = this.processGroupData(data);
    
    // Calcular crescimento semanal
    const weeklyGrowth = processed.weekly.map((week, index) => {
      const previousWeek = processed.weekly[index - 1];
      if (!previousWeek) return 0;
      
      return MetricsCalculator.calculatePercentChange(
        previousWeek.avgMessages, 
        week.avgMessages
      );
    }).slice(1); // Remove primeira semana (sem comparação)

    const avgWeeklyGrowth = weeklyGrowth.length > 0 
      ? weeklyGrowth.reduce((sum, growth) => sum + growth, 0) / weeklyGrowth.length 
      : 0;

    const projectedGrowth = avgWeeklyGrowth * 4; // Projeção mensal

    return {
      period: processed.period.full,
      weekly: processed.weekly,
      trend: processed.trends.overall,
      growth: {
        weekly: Math.round(avgWeeklyGrowth),
        projected: Math.round(projectedGrowth)
      },
      chartData: processed.weekly.map((week, index) => ({
        week: `Sem ${week.week}`,
        messages: week.avgMessages,
        growth: index > 0 ? weeklyGrowth[index - 1] : 0
      }))
    };
  }

  // Dados específicos para pico de atividade
  static getActivityPeakData(data: GroupAnalysisData): {
    period: string;
    peak: {
      date: Date;
      dateFormatted: string;
      messages: number;
      members: number;
      average: number;
      percentageAboveAverage: number;
    };
    context: {
      dayOfWeek: string;
      isWeekend: boolean;
      nearbyDays: Array<{ date: string; messages: number }>;
    };
    chartData: Array<{ date: string; messages: number; isPeak: boolean }>;
  } {
    const processed = this.processGroupData(data);
    
    // Contexto do pico
    const peakDate = processed.peak.date;
    const dayOfWeek = DateFormatter.getDayName(peakDate);
    const isWeekend = DateFormatter.isWeekend(peakDate);
    
    // Dias próximos ao pico (3 antes e 3 depois)
    const peakIndex = data.dailyStats.findIndex(day => 
      DateFormatter.parseDate(day.date).getTime() === peakDate.getTime()
    );
    
    const nearbyDays = data.dailyStats
      .slice(Math.max(0, peakIndex - 3), peakIndex + 4)
      .map(day => ({
        date: DateFormatter.formatDayMonth(DateFormatter.parseDate(day.date)),
        messages: day.total_messages
      }));

    return {
      period: processed.period.full,
      peak: {
        date: processed.peak.date,
        dateFormatted: DateFormatter.formatDayMonth(processed.peak.date),
        messages: processed.peak.messages,
        members: processed.peak.members,
        average: processed.peak.average,
        percentageAboveAverage: processed.peak.percentageAboveAverage
      },
      context: {
        dayOfWeek,
        isWeekend,
        nearbyDays
      },
      chartData: data.dailyStats.map(day => {
        const dayDate = DateFormatter.parseDate(day.date);
        return {
          date: DateFormatter.formatForChart(dayDate),
          messages: day.total_messages,
          isPeak: dayDate.getTime() === peakDate.getTime()
        };
      })
    };
  }

  // Dados específicos para concentração de membros
  static getMemberConcentrationData(data: GroupAnalysisData): {
    period: string;
    concentration: {
      top20Percent: number;
      top50Percent: number;
      concentrationIndex: number;
      totalMembers: number;
    };
    topMembers: Array<{
      name: string;
      messages: number;
      percentage: number;
      rank: number;
    }>;
    distribution: Array<{
      tier: string;
      members: number;
      messages: number;
      percentage: number;
    }>;
  } {
    const processed = this.processGroupData(data);
    const totalMessages = data.memberStats.reduce((sum, member) => sum + member.message_count, 0);
    
    // Top membros
    const sortedMembers = [...data.memberStats]
      .sort((a, b) => b.message_count - a.message_count)
      .slice(0, 10);
    
    const topMembers = sortedMembers.map((member, index) => ({
      name: member.name,
      messages: member.message_count,
      percentage: Math.round((member.message_count / totalMessages) * 100),
      rank: index + 1
    }));

    // Distribuição por tercis
    const memberCount = data.memberStats.length;
    const topTier = Math.ceil(memberCount / 3);
    const middleTier = Math.ceil(memberCount / 3);
    const bottomTier = memberCount - topTier - middleTier;

    const distribution = [
      {
        tier: 'Top (33%)',
        members: topTier,
        messages: sortedMembers.slice(0, topTier).reduce((sum, m) => sum + m.message_count, 0),
        percentage: 0
      },
      {
        tier: 'Meio (33%)',
        members: middleTier,
        messages: sortedMembers.slice(topTier, topTier + middleTier).reduce((sum, m) => sum + m.message_count, 0),
        percentage: 0
      },
      {
        tier: 'Base (34%)',
        members: bottomTier,
        messages: sortedMembers.slice(topTier + middleTier).reduce((sum, m) => sum + m.message_count, 0),
        percentage: 0
      }
    ];

    // Calcular percentuais
    distribution.forEach(tier => {
      tier.percentage = Math.round((tier.messages / totalMessages) * 100);
    });

    return {
      period: processed.period.full,
      concentration: processed.concentration,
      topMembers,
      distribution
    };
  }
} 