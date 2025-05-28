import { DateFormatter } from './DateFormatter';

export interface WeeklyAverage {
  week: number;
  start: Date;
  end: Date;
  avgMessages: number;
  avgMembers: number;
  totalMessages: number;
  peakDay: { date: Date; messages: number };
}

export interface PeriodComparison {
  first: {
    period: string;
    messages: number;
    members: number;
    avgDaily: number;
    days: number;
  };
  second: {
    period: string;
    messages: number;
    members: number;
    avgDaily: number;
    days: number;
  };
  change: {
    messages: number;
    members: number;
    percentage: number;
  };
}

export interface DailyStats {
  date: string;
  total_messages: number;
  active_members: number;
  hourly_activity: Record<string, number>;
}

export class MetricsCalculator {
  // Calcular mudança percentual
  static calculatePercentChange(before: number, after: number): number {
    if (before === 0) return after > 0 ? 100 : 0;
    return Math.round(((after - before) / before) * 100);
  }

  // Determinar tendência baseada em valores
  static calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = this.calculatePercentChange(firstAvg, secondAvg);
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  // Calcular médias semanais
  static getWeeklyAverages(dailyStats: DailyStats[], period: { start: Date; end: Date }): WeeklyAverage[] {
    const weeks = DateFormatter.getWeekRanges(period.start, period.end);
    
    return weeks.map((week, index) => {
      // Filtrar dados da semana
      const weekData = dailyStats.filter(day => {
        const dayDate = DateFormatter.parseDate(day.date);
        return dayDate >= week.start && dayDate <= week.end;
      });

      const totalMessages = weekData.reduce((sum, day) => sum + day.total_messages, 0);
      const totalMembers = weekData.reduce((sum, day) => sum + day.active_members, 0);
      const avgMessages = weekData.length > 0 ? totalMessages / weekData.length : 0;
      const avgMembers = weekData.length > 0 ? totalMembers / weekData.length : 0;

      // Encontrar pico da semana
      const peakDay = weekData.reduce((max, day) => 
        day.total_messages > max.total_messages ? day : max, 
        weekData[0] || { date: week.start.toISOString(), total_messages: 0 }
      );

      return {
        week: index + 1,
        start: week.start,
        end: week.end,
        avgMessages: Math.round(avgMessages),
        avgMembers: Math.round(avgMembers),
        totalMessages,
        peakDay: {
          date: DateFormatter.parseDate(peakDay.date),
          messages: peakDay.total_messages
        }
      };
    });
  }

  // Comparar dois períodos
  static comparePeriods(dailyStats: DailyStats[], period: { start: Date; end: Date }): PeriodComparison {
    const { first, second } = DateFormatter.splitPeriod(period.start, period.end);

    // Dados do primeiro período
    const firstData = dailyStats.filter(day => {
      const dayDate = DateFormatter.parseDate(day.date);
      return dayDate >= first.start && dayDate <= first.end;
    });

    // Dados do segundo período
    const secondData = dailyStats.filter(day => {
      const dayDate = DateFormatter.parseDate(day.date);
      return dayDate >= second.start && dayDate <= second.end;
    });

    // Cálculos para primeiro período
    const firstMessages = firstData.reduce((sum, day) => sum + day.total_messages, 0);
    const firstMembers = firstData.reduce((sum, day) => sum + day.active_members, 0);
    const firstAvgDaily = firstData.length > 0 ? firstMessages / firstData.length : 0;

    // Cálculos para segundo período  
    const secondMessages = secondData.reduce((sum, day) => sum + day.total_messages, 0);
    const secondMembers = secondData.reduce((sum, day) => sum + day.active_members, 0);
    const secondAvgDaily = secondData.length > 0 ? secondMessages / secondData.length : 0;

    // Mudanças
    const messageChange = this.calculatePercentChange(firstMessages, secondMessages);
    const memberChange = this.calculatePercentChange(firstMembers, secondMembers);
    const avgChange = this.calculatePercentChange(firstAvgDaily, secondAvgDaily);

    return {
      first: {
        period: DateFormatter.formatPeriod(first.start, first.end),
        messages: firstMessages,
        members: Math.round(firstMembers / firstData.length) || 0,
        avgDaily: Math.round(firstAvgDaily),
        days: firstData.length
      },
      second: {
        period: DateFormatter.formatPeriod(second.start, second.end),
        messages: secondMessages,
        members: Math.round(secondMembers / secondData.length) || 0,
        avgDaily: Math.round(secondAvgDaily),
        days: secondData.length
      },
      change: {
        messages: messageChange,
        members: memberChange,
        percentage: avgChange
      }
    };
  }

  // Encontrar pico de atividade
  static findActivityPeak(dailyStats: DailyStats[]): {
    date: Date;
    messages: number;
    members: number;
    average: number;
    percentageAboveAverage: number;
  } {
    if (dailyStats.length === 0) {
      return {
        date: new Date(),
        messages: 0,
        members: 0,
        average: 0,
        percentageAboveAverage: 0
      };
    }

    // Encontrar dia com mais mensagens
    const peakDay = dailyStats.reduce((max, day) => 
      day.total_messages > max.total_messages ? day : max
    );

    // Calcular média histórica
    const average = dailyStats.reduce((sum, day) => sum + day.total_messages, 0) / dailyStats.length;
    const percentageAboveAverage = this.calculatePercentChange(average, peakDay.total_messages);

    return {
      date: DateFormatter.parseDate(peakDay.date),
      messages: peakDay.total_messages,
      members: peakDay.active_members,
      average: Math.round(average),
      percentageAboveAverage
    };
  }

  // Calcular concentração de membros
  static calculateMemberConcentration(memberStats: Array<{ name: string; message_count: number }>): {
    top20Percent: number;
    top50Percent: number;
    concentrationIndex: number;
    totalMembers: number;
  } {
    if (memberStats.length === 0) {
      return { top20Percent: 0, top50Percent: 0, concentrationIndex: 0, totalMembers: 0 };
    }

    const sortedMembers = [...memberStats].sort((a, b) => b.message_count - a.message_count);
    const totalMessages = sortedMembers.reduce((sum, member) => sum + member.message_count, 0);

    // Top 20% dos membros
    const top20Count = Math.ceil(sortedMembers.length * 0.2);
    const top20Messages = sortedMembers
      .slice(0, top20Count)
      .reduce((sum, member) => sum + member.message_count, 0);
    const top20Percent = Math.round((top20Messages / totalMessages) * 100);

    // Top 50% dos membros
    const top50Count = Math.ceil(sortedMembers.length * 0.5);
    const top50Messages = sortedMembers
      .slice(0, top50Count)
      .reduce((sum, member) => sum + member.message_count, 0);
    const top50Percent = Math.round((top50Messages / totalMessages) * 100);

    // Índice de concentração (similar ao Gini)
    const concentrationIndex = top20Percent;

    return {
      top20Percent,
      top50Percent,
      concentrationIndex,
      totalMembers: sortedMembers.length
    };
  }

  // Detectar anomalias
  static detectAnomalies(dailyStats: DailyStats[]): Array<{
    date: Date;
    value: number;
    average: number;
    standardDeviation: number;
    zScore: number;
    type: 'spike' | 'drop';
  }> {
    if (dailyStats.length < 3) return [];

    const values = dailyStats.map(day => day.total_messages);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calcular desvio padrão
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    const anomalies: Array<{
      date: Date;
      value: number;
      average: number;
      standardDeviation: number;
      zScore: number;
      type: 'spike' | 'drop';
    }> = [];

    dailyStats.forEach(day => {
      const zScore = standardDeviation > 0 ? (day.total_messages - average) / standardDeviation : 0;
      
      // Anomalia se Z-score > 2.5 ou < -2.5
      if (Math.abs(zScore) > 2.5) {
        anomalies.push({
          date: DateFormatter.parseDate(day.date),
          value: day.total_messages,
          average: Math.round(average),
          standardDeviation: Math.round(standardDeviation),
          zScore: Math.round(zScore * 100) / 100,
          type: zScore > 0 ? 'spike' : 'drop'
        });
      }
    });

    return anomalies;
  }
} 