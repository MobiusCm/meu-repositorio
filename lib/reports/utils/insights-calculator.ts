import { DetailedStats } from '@/lib/analysis';
import { ReportInsight } from '../types';

export class InsightsCalculator {
  static calculateInsights(stats: DetailedStats): ReportInsight[] {
    const insights: ReportInsight[] = [];
    
    // Insights de atividade geral
    insights.push(...this.calculateActivityInsights(stats));
    
    // Insights de membros
    insights.push(...this.calculateMemberInsights(stats));
    
    // Insights temporais
    insights.push(...this.calculateTimeInsights(stats));
    
    // Insights de engajamento
    insights.push(...this.calculateEngagementInsights(stats));
    
    return insights;
  }
  
  private static calculateActivityInsights(stats: DetailedStats): ReportInsight[] {
    const insights: ReportInsight[] = [];
    
    if (stats.days_analyzed === 0) return insights;
    
    const avgMessagesPerDay = Math.round(stats.total_messages / stats.days_analyzed);
    
    // Insight sobre atividade diária
    if (avgMessagesPerDay > 100) {
      insights.push({
        id: 'high_activity',
        title: 'Grupo Muito Ativo',
        description: `O grupo tem uma média excepcional de ${avgMessagesPerDay} mensagens por dia, indicando alto engajamento.`,
        type: 'positive',
        category: 'Atividade',
        value: avgMessagesPerDay,
        trend: 'up',
        recommendation: 'Mantenha o momentum criando conteúdo relevante e incentivando participação.'
      });
    } else if (avgMessagesPerDay < 10) {
      insights.push({
        id: 'low_activity',
        title: 'Baixa Atividade',
        description: `O grupo tem apenas ${avgMessagesPerDay} mensagens por dia em média. Pode precisar de mais engajamento.`,
        type: 'warning',
        category: 'Atividade',
        value: avgMessagesPerDay,
        trend: 'down',
        recommendation: 'Considere criar tópicos interessantes, fazer perguntas ou compartilhar conteúdo relevante.'
      });
    }
    
    // Insight sobre consistência
    const activeDays = stats.daily_stats.filter(day => day.total_messages > 0).length;
    const consistencyRate = (activeDays / stats.days_analyzed) * 100;
    
    if (consistencyRate > 80) {
      insights.push({
        id: 'consistent_activity',
        title: 'Atividade Consistente',
        description: `Excelente! O grupo teve atividade em ${Math.round(consistencyRate)}% dos dias analisados.`,
        type: 'positive',
        category: 'Consistência',
        value: `${Math.round(consistencyRate)}%`,
        trend: 'stable'
      });
    } else if (consistencyRate < 50) {
      insights.push({
        id: 'inconsistent_activity',
        title: 'Atividade Irregular',
        description: `O grupo teve atividade em apenas ${Math.round(consistencyRate)}% dos dias. Pode indicar falta de engajamento.`,
        type: 'warning',
        category: 'Consistência',
        value: `${Math.round(consistencyRate)}%`,
        trend: 'down',
        recommendation: 'Tente estabelecer uma rotina de postagens ou tópicos recorrentes.'
      });
    }
    
    return insights;
  }
  
  private static calculateMemberInsights(stats: DetailedStats): ReportInsight[] {
    const insights: ReportInsight[] = [];
    
    if (!stats.member_stats || stats.member_stats.length === 0) return insights;
    
    const topMember = stats.member_stats[0];
    const totalParticipation = (topMember.message_count / stats.total_messages) * 100;
    
    // Concentração de participação
    if (totalParticipation > 40) {
      insights.push({
        id: 'high_concentration',
        title: 'Alta Concentração',
        description: `${topMember.name} domina ${Math.round(totalParticipation)}% das conversas. Pode inibir outros membros.`,
        type: 'warning',
        category: 'Participação',
        value: `${Math.round(totalParticipation)}%`,
        recommendation: 'Incentive outros membros a participar mais através de perguntas diretas ou tópicos diversos.'
      });
    } else if (totalParticipation < 15) {
      insights.push({
        id: 'balanced_participation',
        title: 'Participação Equilibrada',
        description: `Ótima distribuição! O membro mais ativo representa apenas ${Math.round(totalParticipation)}% das mensagens.`,
        type: 'positive',
        category: 'Participação',
        value: `${Math.round(totalParticipation)}%`
      });
    }
    
    // Top 3 membros
    if (stats.member_stats.length >= 3) {
      const top3Messages = stats.member_stats.slice(0, 3).reduce((sum, member) => sum + member.message_count, 0);
      const top3Percentage = (top3Messages / stats.total_messages) * 100;
      
      if (top3Percentage > 70) {
        insights.push({
          id: 'top3_dominance',
          title: 'Dominância do Top 3',
          description: `Os 3 membros mais ativos representam ${Math.round(top3Percentage)}% de todas as mensagens.`,
          type: 'warning',
          category: 'Distribuição',
          value: `${Math.round(top3Percentage)}%`,
          recommendation: 'Trabalhe para distribuir melhor a participação entre todos os membros.'
        });
      }
    }
    
    // Análise de palavras por mensagem
    if (stats.avg_words_per_message > 15) {
      insights.push({
        id: 'verbose_messages',
        title: 'Mensagens Detalhadas',
        description: `As mensagens têm em média ${Math.round(stats.avg_words_per_message)} palavras, indicando conversas aprofundadas.`,
        type: 'positive',
        category: 'Qualidade',
        value: Math.round(stats.avg_words_per_message)
      });
    } else if (stats.avg_words_per_message < 5) {
      insights.push({
        id: 'short_messages',
        title: 'Mensagens Curtas',
        description: `Mensagens muito curtas (${Math.round(stats.avg_words_per_message)} palavras em média). Pode indicar conversas superficiais.`,
        type: 'neutral',
        category: 'Qualidade',
        value: Math.round(stats.avg_words_per_message),
        recommendation: 'Incentive discussões mais aprofundadas com perguntas abertas.'
      });
    }
    
    return insights;
  }
  
  private static calculateTimeInsights(stats: DetailedStats): ReportInsight[] {
    const insights: ReportInsight[] = [];
    
    if (!stats.hourly_activity || Object.keys(stats.hourly_activity).length === 0) return insights;
    
    // Encontrar horário de pico
    const peakHour = Object.entries(stats.hourly_activity)
      .reduce((max, [hour, count]) => count > max.count ? { hour, count } : max, { hour: '00', count: 0 });
    
    const peakPercentage = (peakHour.count / stats.total_messages) * 100;
    
    if (peakPercentage > 20) {
      insights.push({
        id: 'strong_peak_hour',
        title: 'Horário de Pico Definido',
        description: `${Math.round(peakPercentage)}% das mensagens acontecem às ${peakHour.hour}h. Ótimo para timing estratégico.`,
        type: 'positive',
        category: 'Temporal',
        value: `${peakHour.hour}:00`,
        recommendation: 'Use este horário para comunicações importantes e conteúdo relevante.'
      });
    }
    
    // Análise de distribuição temporal
    const activeHours = Object.values(stats.hourly_activity).filter(count => count > 0).length;
    if (activeHours > 16) {
      insights.push({
        id: 'extended_activity',
        title: 'Atividade Estendida',
        description: `O grupo tem atividade em ${activeHours} horas diferentes do dia, indicando membros em diversos fusos horários.`,
        type: 'neutral',
        category: 'Temporal',
        value: activeHours
      });
    } else if (activeHours < 8) {
      insights.push({
        id: 'concentrated_time',
        title: 'Horários Concentrados',
        description: `Atividade concentrada em apenas ${activeHours} horas do dia. Grupo com rotina bem definida.`,
        type: 'neutral',
        category: 'Temporal',
        value: activeHours
      });
    }
    
    return insights;
  }
  
  private static calculateEngagementInsights(stats: DetailedStats): ReportInsight[] {
    const insights: ReportInsight[] = [];
    
    if (stats.active_members === 0) return insights;
    
    // Taxa de mensagens por membro
    const messagesPerMember = stats.total_messages / stats.active_members;
    
    if (messagesPerMember > 50) {
      insights.push({
        id: 'high_engagement',
        title: 'Alto Engajamento',
        description: `Cada membro ativo enviou em média ${Math.round(messagesPerMember)} mensagens. Excelente engajamento!`,
        type: 'positive',
        category: 'Engajamento',
        value: Math.round(messagesPerMember),
        trend: 'up'
      });
    } else if (messagesPerMember < 10) {
      insights.push({
        id: 'low_engagement',
        title: 'Baixo Engajamento',
        description: `Apenas ${Math.round(messagesPerMember)} mensagens por membro ativo. Pode indicar baixo engajamento.`,
        type: 'warning',
        category: 'Engajamento',
        value: Math.round(messagesPerMember),
        trend: 'down',
        recommendation: 'Tente criar conteúdo mais envolvente ou fazer perguntas que incentivem respostas.'
      });
    }
    
    // Análise de crescimento (se houver dados suficientes)
    if (stats.daily_stats.length >= 7) {
      const firstWeek = stats.daily_stats.slice(0, 7);
      const lastWeek = stats.daily_stats.slice(-7);
      
      const firstWeekAvg = firstWeek.reduce((sum, day) => sum + day.total_messages, 0) / 7;
      const lastWeekAvg = lastWeek.reduce((sum, day) => sum + day.total_messages, 0) / 7;
      
      const growthRate = firstWeekAvg > 0 ? ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100 : 0;
      
      if (growthRate > 20) {
        insights.push({
          id: 'positive_growth',
          title: 'Crescimento Positivo',
          description: `O grupo teve crescimento de ${Math.round(growthRate)}% na atividade entre a primeira e última semana.`,
          type: 'positive',
          category: 'Crescimento',
          value: `+${Math.round(growthRate)}%`,
          trend: 'up'
        });
      } else if (growthRate < -20) {
        insights.push({
          id: 'declining_activity',
          title: 'Atividade em Declínio',
          description: `A atividade diminuiu ${Math.abs(Math.round(growthRate))}% entre a primeira e última semana.`,
          type: 'warning',
          category: 'Crescimento',
          value: `${Math.round(growthRate)}%`,
          trend: 'down',
          recommendation: 'Investigue possíveis causas do declínio e implemente estratégias de reengajamento.'
        });
      }
    }
    
    return insights;
  }
  
  static generateSummaryInsight(stats: DetailedStats): string {
    if (stats.days_analyzed === 0) return 'Nenhum dado disponível para análise.';
    
    const avgDaily = Math.round(stats.total_messages / stats.days_analyzed);
    const topMember = stats.member_stats?.[0];
    const peakHour = stats.hourly_activity ? 
      Object.entries(stats.hourly_activity)
        .reduce((max, [hour, count]) => count > max.count ? { hour, count } : max, { hour: '12', count: 0 }) :
      { hour: '12', count: 0 };
    
    let summary = `Durante ${stats.days_analyzed} dias, o grupo registrou ${stats.total_messages.toLocaleString('pt-BR')} mensagens`;
    summary += ` (média de ${avgDaily} por dia) com ${stats.active_members} membros ativos.`;
    
    if (topMember) {
      const participation = ((topMember.message_count / stats.total_messages) * 100).toFixed(1);
      summary += ` ${topMember.name} foi o mais ativo com ${participation}% das mensagens.`;
    }
    
    if (peakHour.count > 0) {
      summary += ` O horário de maior atividade foi às ${peakHour.hour}h.`;
    }
    
    if (stats.avg_words_per_message > 0) {
      summary += ` Cada mensagem teve em média ${Math.round(stats.avg_words_per_message)} palavras.`;
    }
    
    return summary;
  }
} 