import { format, differenceInDays, subDays, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos de insights disponíveis
export type InsightType = 
  | 'participation_excellence' 
  | 'participation_decline' 
  | 'activity_peak' 
  | 'growth_trend' 
  | 'engagement_pattern'
  | 'member_concentration'
  | 'time_pattern'
  | 'content_quality'
  | 'group_health'
  | 'anomaly_detection'
  | 'seasonal_pattern'
  | 'leadership_emergence'
  | 'conversation_depth'
  | 'response_rate'
  | 'retention_analysis';

// Níveis de importância dos insights
export type InsightPriority = 'critical' | 'high' | 'medium' | 'low';

// Tendências possíveis
export type InsightTrend = 'up' | 'down' | 'stable' | 'warning' | 'critical';

// Interface principal do insight
export interface SmartInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  weight: number; // 1-100, usado para ranking
  groupId: string;
  groupName: string;
  title: string;
  description: string;
  value: number | string;
  change?: number;
  trend: InsightTrend;
  actionable: boolean;
  recommendation?: string;
  metadata: {
    period: string;
    dataPoints: number;
    confidence: number; // 0-100
    category: string;
  };
  visualization?: {
    type: 'chart' | 'metric' | 'comparison' | 'timeline';
    data?: any;
  };
}

// Dados necessários para análise (usando apenas dados reais)
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

// Engine principal de insights
export class InsightsEngine {
  private insights: SmartInsight[] = [];

  // Método principal para gerar insights
  public generateInsights(groupsData: GroupAnalysisData[]): SmartInsight[] {
    this.insights = [];

    for (const groupData of groupsData) {
      // Análises de atividade e crescimento
      this.analyzeActivityPatterns(groupData);
      
      // Análises de tendências temporais
      this.analyzeGrowthTrends(groupData);
      
      // Análises de engajamento baseadas em dados reais
      this.analyzeEngagementPatterns(groupData);
      
      // Análises de concentração de membros
      this.analyzeMemberConcentration(groupData);
      
      // Análises temporais
      this.analyzeTimePatterns(groupData);
      
      // Análises de qualidade de conteúdo
      this.analyzeContentQuality(groupData);
      
      // Análises de consistência
      this.analyzeConsistencyPatterns(groupData);
      
      // Detecção de anomalias
      this.detectAnomalies(groupData);
      
      // Análises de liderança
      this.analyzeLeadershipEmergence(groupData);
      
      // Análises de diversidade de participação
      this.analyzeMemberDiversity(groupData);
    }

    // Ordenar por peso e retornar os top 3
    return this.insights
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  }

  // 1. Análise de Picos de Atividade (REFORMULADA COM DADOS REAIS)
  private analyzeActivityPatterns(data: GroupAnalysisData): void {
    const totalDays = data.dailyStats.length;
    if (totalDays < 3) return; // Precisa de pelo menos 3 dias
    
    // Calcular média e desvio padrão das mensagens
    const messages = data.dailyStats.map(day => day.total_messages);
    const average = messages.reduce((sum, count) => sum + count, 0) / messages.length;
    
    if (average === 0) return; // Evitar divisão por zero
    
    // Calcular desvio padrão
    const variance = messages.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / messages.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Encontrar picos significativos (acima de 2 desvios padrão da média)
    const threshold = average + (2 * standardDeviation);
    const peaks = data.dailyStats.filter(day => day.total_messages > threshold && day.total_messages > average * 1.5);
    
    if (peaks.length > 0) {
      // Pegar o pico mais significativo
      const highestPeak = peaks.reduce((max, day) => 
        day.total_messages > max.total_messages ? day : max, peaks[0]);
      
      const peakValue = highestPeak.total_messages;
      const percentageAboveAverage = ((peakValue - average) / average) * 100;
      
      // Só gerar insight se o pico for realmente significativo (>50% acima da média)
      if (percentageAboveAverage > 50) {
        this.insights.push({
          id: `activity_peak_${data.groupId}`,
          type: 'activity_peak',
          priority: percentageAboveAverage > 200 ? 'critical' : percentageAboveAverage > 100 ? 'high' : 'medium',
          weight: Math.min(80 + (percentageAboveAverage / 10), 100),
          groupId: data.groupId,
          groupName: data.groupName,
          title: 'Pico de Atividade Detectado',
          description: `Identificado pico extraordinário no dia ${highestPeak.date}: ${peakValue} mensagens (${percentageAboveAverage.toFixed(0)}% acima da média de ${average.toFixed(1)} mensagens/dia). Este evento merece análise detalhada para entender seus fatores causais.`,
          value: Math.round(peakValue),
          change: Math.round(percentageAboveAverage),
          trend: 'up',
          actionable: true,
          recommendation: `Investigue imediatamente o contexto do dia ${highestPeak.date}: analise o tipo de conteúdo, horários de postagem e eventos que podem ter causado este pico. Documente os fatores de sucesso para replicar intencionalmente.`,
          metadata: {
            period: `Últimos ${totalDays} dias`,
            dataPoints: totalDays,
            confidence: Math.min(85 + (peaks.length * 5), 95),
            category: 'Atividade'
          },
          visualization: {
            type: 'chart',
            data: {
              groupData: data,
              analysisType: 'activity_peak',
              metrics: {
                peakValue,
                averageValue: average,
                percentageAboveAverage,
                peakDate: highestPeak.date,
                totalPeaks: peaks.length,
                threshold
              }
            }
          }
        });
      }
    }
    
    // Detectar consistência (ou falta dela)
    const activeDays = data.dailyStats.filter(day => day.total_messages > 0).length;
    const consistencyRate = activeDays / totalDays;
    
    if (consistencyRate < 0.3 && totalDays >= 7) {
      // Baixa consistência
      this.insights.push({
        id: `consistency_low_${data.groupId}`,
        type: 'engagement_pattern',
        priority: 'medium',
        weight: 65,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Inconsistência na Atividade',
        description: `Atividade irregular detectada: apenas ${Math.round(consistencyRate * 100)}% dos dias tiveram mensagens. Esta inconsistência pode indicar falta de engajamento regular ou necessidade de estratégias de ativação.`,
        value: Math.round(consistencyRate * 100),
        trend: 'warning',
        actionable: true,
        recommendation: 'Implemente estratégias para criar ritmo regular: posts programados, tópicos semanais, ou dinâmicas que incentivem participação diária.',
        metadata: {
          period: `Últimos ${totalDays} dias`,
          dataPoints: totalDays,
          confidence: 80,
          category: 'Engajamento'
        },
        visualization: {
          type: 'metric',
          data: {
            groupData: data,
            analysisType: 'consistency_analysis',
            metrics: {
              consistencyRate,
              activeDays,
              totalDays,
              averageDaily: average
            }
          }
        }
      });
    }
  }

  // 2. Análise de Tendências de Crescimento (REFORMULADA COM DADOS REAIS)
  private analyzeGrowthTrends(data: GroupAnalysisData): void {
    const totalDays = data.dailyStats.length;
    if (totalDays < 7) return; // Precisa de pelo menos 7 dias para análise confiável

    // Análise por semanas para detectar tendências
    const weekSize = 7;
    const weeks = [];
    for (let i = 0; i < totalDays; i += weekSize) {
      const weekData = data.dailyStats.slice(i, Math.min(i + weekSize, totalDays));
      if (weekData.length >= 3) { // Pelo menos 3 dias para considerar uma semana válida
        const weekMessages = weekData.reduce((sum, day) => sum + day.total_messages, 0);
        const weekActiveMembers = weekData.reduce((sum, day) => sum + day.active_members, 0);
        weeks.push({
          messages: weekMessages,
          avgMessages: weekMessages / weekData.length,
          activeMembers: weekActiveMembers,
          avgActiveMembers: weekActiveMembers / weekData.length,
          days: weekData.length
        });
      }
    }

    if (weeks.length < 2) return; // Precisa de pelo menos 2 períodos para comparar

    // Comparar última semana com média das anteriores
    const lastWeek = weeks[weeks.length - 1];
    const previousWeeks = weeks.slice(0, -1);
    const avgPreviousMessages = previousWeeks.reduce((sum, week) => sum + week.avgMessages, 0) / previousWeeks.length;
    const avgPreviousMembers = previousWeeks.reduce((sum, week) => sum + week.avgActiveMembers, 0) / previousWeeks.length;

    const messageGrowth = avgPreviousMessages > 0 ? ((lastWeek.avgMessages - avgPreviousMessages) / avgPreviousMessages) * 100 : 0;
    const memberGrowth = avgPreviousMembers > 0 ? ((lastWeek.avgActiveMembers - avgPreviousMembers) / avgPreviousMembers) * 100 : 0;

    // Calcular tendência geral (regressão linear simples)
    const weeklyTrend = this.calculateTrendSlope(weeks.map(w => w.avgMessages));

    if (messageGrowth > 20 && weeklyTrend > 0.5) {
      this.insights.push({
        id: `growth_accelerating_${data.groupId}`,
        type: 'growth_trend',
        priority: 'high',
        weight: 88,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Crescimento Acelerado',
        description: `Expansão significativa detectada: atividade subiu ${messageGrowth.toFixed(1)}% na última semana vs média histórica. Média atual de ${lastWeek.avgMessages.toFixed(1)} mensagens/dia com ${lastWeek.avgActiveMembers.toFixed(1)} membros ativos/dia.`,
        value: Math.round(messageGrowth),
        change: Math.round(messageGrowth),
        trend: 'up',
        actionable: true,
        recommendation: 'Capitalize o momentum: identifique os fatores do crescimento e considere estratégias para sustentar esta trajetória positiva.',
        metadata: {
          period: `Últimas ${weeks.length} semanas`,
          dataPoints: weeks.length,
          confidence: 90,
          category: 'Crescimento'
        }
      });
    } else if (messageGrowth < -20 && weeklyTrend < -0.5) {
      this.insights.push({
        id: `growth_declining_${data.groupId}`,
        type: 'growth_trend',
        priority: 'critical',
        weight: 92,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Declínio de Atividade',
        description: `Queda preocupante: atividade caiu ${Math.abs(messageGrowth).toFixed(1)}% na última semana. Média atual de ${lastWeek.avgMessages.toFixed(1)} mensagens/dia vs ${avgPreviousMessages.toFixed(1)} das semanas anteriores.`,
        value: Math.round(Math.abs(messageGrowth)),
        change: Math.round(messageGrowth),
        trend: 'down',
        actionable: true,
        recommendation: 'Intervenção necessária: analise as causas do declínio e implemente estratégias de recuperação antes que a tendência se cristalize.',
        metadata: {
          period: `Últimas ${weeks.length} semanas`,
          dataPoints: weeks.length,
          confidence: 95,
          category: 'Crescimento'
        }
      });
    } else if (Math.abs(weeklyTrend) < 0.3 && lastWeek.avgMessages > 3) {
      this.insights.push({
        id: `growth_steady_${data.groupId}`,
        type: 'growth_trend',
        priority: 'medium',
        weight: 70,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Crescimento Sustentável',
        description: `Estabilidade sólida: variação de apenas ${messageGrowth.toFixed(1)}% na atividade com tendência neutra. Média consistente de ${lastWeek.avgMessages.toFixed(1)} mensagens/dia indica maturidade operacional.`,
        value: Math.round(Math.abs(messageGrowth)),
        change: Math.round(messageGrowth),
        trend: 'stable',
        actionable: true,
        recommendation: 'Base sólida para inovação: use esta estabilidade para testar novas estratégias de engajamento sem risco de disrupção.',
        metadata: {
          period: `Últimas ${weeks.length} semanas`,
          dataPoints: weeks.length,
          confidence: 85,
          category: 'Crescimento'
        }
      });
    }
  }

  // Método auxiliar para calcular tendência linear
  private calculateTrendSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // soma de 0,1,2...n-1
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // soma de 0²,1²,2²...n-1²
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  // 3. Análise de Padrões de Engajamento (REFORMULADA COM ANÁLISE TEMPORAL)
  private analyzeEngagementPatterns(data: GroupAnalysisData): void {
    const totalDays = data.dailyStats.length;
    if (totalDays < 7 || data.memberStats.length === 0) return; // Precisa de pelo menos 7 dias

    // Dividir o período em duas metades para análise de tendência
    const halfPoint = Math.floor(totalDays / 2);
    const firstHalf = data.dailyStats.slice(0, halfPoint);
    const secondHalf = data.dailyStats.slice(halfPoint);
    
    if (firstHalf.length === 0 || secondHalf.length === 0) return;

    // Calcular métricas para cada metade
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.total_messages, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.total_messages, 0) / secondHalf.length;
    
    const firstHalfMembers = firstHalf.reduce((sum, day) => sum + day.active_members, 0) / firstHalf.length;
    const secondHalfMembers = secondHalf.reduce((sum, day) => sum + day.active_members, 0) / secondHalf.length;
    
    // Calcular tendência (% de mudança)
    const messageTrend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const memberTrend = firstHalfMembers > 0 ? ((secondHalfMembers - firstHalfMembers) / firstHalfMembers) * 100 : 0;
    
    // Calcular consistência (dias com atividade)
    const activeDaysRatio = data.dailyStats.filter(day => day.total_messages > 0).length / totalDays;
    
    // Score baseado em tendências reais
    const currentActivity = secondHalfAvg; // Atividade atual
    const activityConsistency = activeDaysRatio * 100;
    
    // Determinar status baseado em dados reais
    if (messageTrend > 15 && memberTrend > 0) {
      this.insights.push({
        id: `engagement_growing_${data.groupId}`,
        type: 'engagement_pattern',
        priority: 'high',
        weight: 85,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Engajamento em Crescimento',
        description: `Tendência positiva confirmada: atividade cresceu ${messageTrend.toFixed(1)}% entre as duas metades do período. Média atual de ${secondHalfAvg.toFixed(1)} mensagens/dia vs ${firstHalfAvg.toFixed(1)} anteriormente. Consistência de ${activityConsistency.toFixed(0)}% dos dias.`,
        value: Math.round(messageTrend),
        change: Math.round(messageTrend),
        trend: 'up',
        actionable: true,
        recommendation: 'Momento ideal para expansão: capitalize este momentum positivo introduzindo novos tópicos estratégicos ou convidando membros qualificados.',
        metadata: {
          period: `Últimos ${totalDays} dias`,
          dataPoints: totalDays,
          confidence: 90,
          category: 'Engajamento'
        },
        visualization: {
          type: 'chart',
          data: {
            groupData: data,
            analysisType: 'growth_trend',
            metrics: {
              messageTrend,
              memberTrend,
              firstHalfAvg,
              secondHalfAvg,
              activityConsistency
            }
          }
        }
      });
    } else if (messageTrend < -15) {
      this.insights.push({
        id: `engagement_declining_${data.groupId}`,
        type: 'participation_decline',  // Mudando para usar o sistema modular
        priority: 'critical',
        weight: 95,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Declínio de Participação',
        description: `Queda preocupante: atividade caiu ${Math.abs(messageTrend).toFixed(1)}% na última semana. Média atual de ${secondHalfAvg.toFixed(1)} mensagens/dia vs ${firstHalfAvg.toFixed(1)} das semanas anteriores.`,
        value: Math.round(Math.abs(messageTrend)),
        change: Math.round(messageTrend),
        trend: 'down',
        actionable: true,
        recommendation: 'Ação corretiva urgente: revisite o tipo de conteúdo, implemente estratégias de reativação e considere pesquisa para entender as necessidades dos membros.',
        metadata: {
          period: `Últimos ${totalDays} dias`,
          dataPoints: totalDays,
          confidence: 95,
          category: 'Participação'
        },
        visualization: {
          type: 'chart',
          data: {
            groupData: data,
            analysisType: 'participation_decline',
            metrics: {
              messageTrend,
              memberTrend,
              firstHalfAvg,
              secondHalfAvg,
              declinePercentage: Math.abs(messageTrend)
            }
          }
        }
      });
    } else if (activityConsistency > 80 && currentActivity > 5) {
      this.insights.push({
        id: `engagement_stable_${data.groupId}`,
        type: 'engagement_pattern',
        priority: 'medium',
        weight: 75,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Engajamento Estável',
        description: `Performance consistente: atividade mantida em ${secondHalfAvg.toFixed(1)} mensagens/dia com ${activityConsistency.toFixed(0)}% de consistência. Tendência de ${messageTrend.toFixed(1)}% indica estabilidade operacional.`,
        value: Math.round(activityConsistency),
        change: Math.round(messageTrend),
        trend: 'stable',
        actionable: true,
        recommendation: 'Oportunidade de otimização: grupo estável é base ideal para testes de novas estratégias de engajamento e crescimento controlado.',
        metadata: {
          period: `Últimos ${totalDays} dias`,
          dataPoints: totalDays,
          confidence: 85,
          category: 'Engajamento'
        },
        visualization: {
          type: 'metric',
          data: {
            groupData: data,
            analysisType: 'stable_engagement',
            metrics: {
              activityConsistency,
              currentActivity,
              stabilityScore: Math.round(activityConsistency)
            }
          }
        }
      });
    }
  }

  // 4. Análise de Concentração de Membros (REFINADA)
  private analyzeMemberConcentration(data: GroupAnalysisData): void {
    if (data.memberStats.length < 5) return;

    const totalMessages = data.memberStats.reduce((sum, member) => sum + member.message_count, 0);
    if (totalMessages === 0) return;

    const sortedMembers = data.memberStats.sort((a, b) => b.message_count - a.message_count);
    const top3Messages = sortedMembers.slice(0, 3).reduce((sum, member) => sum + member.message_count, 0);
    const top5Messages = sortedMembers.slice(0, 5).reduce((sum, member) => sum + member.message_count, 0);
    
    const concentrationRatio = (top3Messages / totalMessages) * 100;
    const top5Ratio = (top5Messages / totalMessages) * 100;

    if (concentrationRatio > 70) {
      this.insights.push({
        id: `concentration_extreme_${data.groupId}`,
        type: 'member_concentration',
        priority: 'critical',
        weight: 85,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Concentração Extrema de Atividade',
        description: `Alerta crítico: apenas 3 membros dominam ${Math.round(concentrationRatio)}% das conversas. ${sortedMembers[0].name} lidera com ${sortedMembers[0].message_count.toLocaleString('pt-BR')} mensagens. Esta concentração pode inibir a participação de outros membros.`,
        value: Math.round(concentrationRatio),
        trend: 'critical',
        actionable: true,
        recommendation: 'Diversificação urgente: implemente estratégias de rotação de tópicos, moderação distribuída e perguntas diretas para ativar membros silenciosos. Consider criar subgrupos temáticos.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: data.memberStats.length,
          confidence: 95,
          category: 'Distribuição'
        }
      });
    } else if (concentrationRatio < 35) {
      this.insights.push({
        id: `distribution_excellent_${data.groupId}`,
        type: 'member_concentration',
        priority: 'high',
        weight: 80,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Distribuição Ideal de Participação',
        description: `Excelência em democratização: os top 3 membros representam apenas ${Math.round(concentrationRatio)}% das conversas, enquanto os top 5 alcançam ${Math.round(top5Ratio)}%. Esta distribuição equilibrada maximiza o potencial de engajamento coletivo.`,
        value: Math.round(concentrationRatio),
        trend: 'up',
        actionable: false,
        recommendation: 'Mantenha as práticas atuais: continue fomentando esta distribuição saudável e use este grupo como benchmark para outras comunidades.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: data.memberStats.length,
          confidence: 95,
          category: 'Distribuição'
        }
      });
    }
  }

  // 5. Análise de Padrões Temporais (ESTRATÉGICA)
  private analyzeTimePatterns(data: GroupAnalysisData): void {
    const hourlyTotal: Record<string, number> = {};
    let totalHourlyMessages = 0;

    data.dailyStats.forEach(day => {
      Object.entries(day.hourly_activity).forEach(([hour, count]) => {
        hourlyTotal[hour] = (hourlyTotal[hour] || 0) + count;
        totalHourlyMessages += count;
      });
    });

    if (totalHourlyMessages === 0 || Object.keys(hourlyTotal).length === 0) return;

    const sortedHours = Object.entries(hourlyTotal)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const [peakHour, peakCount] = sortedHours[0];
    const peakConcentration = (peakCount / totalHourlyMessages) * 100;

    if (peakConcentration > 12 && peakCount > 15) {
      this.insights.push({
        id: `time_pattern_${data.groupId}`,
        type: 'time_pattern',
        priority: 'medium',
        weight: 75,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Janela de Ouro Identificada',
        description: `Oportunidade estratégica: ${peakConcentration.toFixed(1)}% da atividade se concentra às ${peakHour}h com ${peakCount.toLocaleString('pt-BR')} mensagens. Os top 3 horários (${sortedHours[0][0]}h, ${sortedHours[1][0]}h, ${sortedHours[2][0]}h) capturam grande parte do engajamento.`,
        value: `${peakHour}:00`,
        change: Math.round(peakConcentration),
        trend: 'stable',
        actionable: true,
        recommendation: 'Otimize timing estratégico: programe anúncios importantes, lançamentos e conteúdo de alta prioridade para estas janelas de máximo engajamento.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: Object.keys(hourlyTotal).length,
          confidence: 85,
          category: 'Temporal'
        }
      });
    }
  }

  // 6. Análise de Qualidade de Conteúdo (SOFISTICADA)
  private analyzeContentQuality(data: GroupAnalysisData): void {
    const totalMessages = data.memberStats.reduce((sum, member) => sum + member.message_count, 0);
    const totalWords = data.memberStats.reduce((sum, member) => sum + member.word_count, 0);
    const totalMedia = data.memberStats.reduce((sum, member) => sum + member.media_count, 0);
    
    if (totalMessages === 0) return;

    const textMessages = totalMessages - totalMedia;
    const avgWordsPerMessage = textMessages > 0 ? totalWords / textMessages : 0;
    const mediaRatio = (totalMedia / totalMessages) * 100;
    const textRatio = 100 - mediaRatio;

    if (avgWordsPerMessage > 20) {
      this.insights.push({
        id: `content_premium_${data.groupId}`,
        type: 'content_quality',
        priority: 'high',
        weight: 78,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Conversas de Alto Valor',
        description: `Qualidade excepcional: ${avgWordsPerMessage.toFixed(1)} palavras por mensagem textual indicam discussões aprofundadas. Com ${textRatio.toFixed(1)}% de conteúdo textual e ${mediaRatio.toFixed(1)}% de mídia, o grupo mantém um equilíbrio ideal para conversas substanciais.`,
        value: Math.round(avgWordsPerMessage * 10) / 10,
        trend: 'up',
        actionable: false,
        recommendation: 'Preserve esta qualidade: continue incentivando discussões aprofundadas e considere implementar tópicos de discussão semanais para manter o nível.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: textMessages,
          confidence: 90,
          category: 'Qualidade'
        }
      });
    } else if (avgWordsPerMessage < 6) {
      this.insights.push({
        id: `content_superficial_${data.groupId}`,
        type: 'content_quality',
        priority: 'medium',
        weight: 65,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Oportunidade de Profundidade',
        description: `Potencial não explorado: apenas ${avgWordsPerMessage.toFixed(1)} palavras por mensagem sugerem conversas superficiais. Com ${mediaRatio.toFixed(1)}% de mídia, há espaço para estimular discussões mais elaboradas e construtivas.`,
        value: Math.round(avgWordsPerMessage * 10) / 10,
        trend: 'warning',
        actionable: true,
        recommendation: 'Estimule profundidade: implemente perguntas abertas, promova debates estruturados e compartilhe conteúdo que demande reflexão e opinião dos membros.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: textMessages,
          confidence: 85,
          category: 'Qualidade'
        }
      });
    }
  }

  // 7. Análise de Consistência (ESTRATÉGICA)
  private analyzeConsistencyPatterns(data: GroupAnalysisData): void {
    if (data.dailyStats.length < 7) return;

    const consistency = this.calculateConsistency(data.dailyStats);
    const avgActivity = data.dailyStats.reduce((sum, day) => sum + day.total_messages, 0) / data.dailyStats.length;
    const daysWithActivity = data.dailyStats.filter(day => day.total_messages > 0).length;
    const activityFrequency = (daysWithActivity / data.dailyStats.length) * 100;

    if (consistency > 75 && activityFrequency > 85) {
      this.insights.push({
        id: `consistency_exceptional_${data.groupId}`,
        type: 'group_health',
        priority: 'high',
        weight: 82,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Consistência Estratégica',
        description: `Performance exemplar: atividade consistente em ${daysWithActivity} de ${data.dailyStats.length} dias (${Math.round(activityFrequency)}%) com score de previsibilidade de ${Math.round(consistency)}%. Esta consistência é um ativo valioso para engajamento sustentável.`,
        value: Math.round(consistency),
        change: Math.round(activityFrequency),
        trend: 'up',
        actionable: false,
        recommendation: 'Mantenha o padrão: esta consistência é um diferencial competitivo. Documente as práticas que geram esta regularidade para replicar em outros grupos.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: data.dailyStats.length,
          confidence: 95,
          category: 'Saúde'
        }
      });
    } else if (activityFrequency < 60) {
      this.insights.push({
        id: `consistency_critical_${data.groupId}`,
        type: 'group_health',
        priority: 'critical',
        weight: 90,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Inconsistência Crítica',
        description: `Alerta estratégico: atividade esporádica em apenas ${daysWithActivity} de ${data.dailyStats.length} dias (${Math.round(activityFrequency)}%). Esta irregularidade compromete o valor percebido e pode causar abandono de membros.`,
        value: Math.round(activityFrequency),
        change: Math.round(consistency),
        trend: 'critical',
        actionable: true,
        recommendation: 'Reestruturação necessária: implemente cronograma de conteúdo regular, considere automação de postagens e estabeleça responsáveis por manter atividade mínima diária.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: data.dailyStats.length,
          confidence: 95,
          category: 'Saúde'
        }
      });
    }
  }

  // 8. Detecção de Anomalias (INTELIGENTE)
  private detectAnomalies(data: GroupAnalysisData): void {
    if (data.dailyStats.length < 7) return;

    const messages = data.dailyStats.map(day => day.total_messages);
    const mean = messages.reduce((sum, val) => sum + val, 0) / messages.length;
    
    if (mean === 0) return;
    
    const variance = messages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / messages.length;
    const stdDev = Math.sqrt(variance);

    const significantAnomalies = data.dailyStats.filter(day => 
      Math.abs(day.total_messages - mean) > 2.5 * stdDev && day.total_messages > 0
    );

    if (significantAnomalies.length > 0 && stdDev > 0) {
      const anomaly = significantAnomalies[0];
      const deviationPercent = Math.round(((anomaly.total_messages - mean) / mean) * 100);
      const isPositive = anomaly.total_messages > mean;
      
      this.insights.push({
        id: `anomaly_${data.groupId}`,
        type: 'anomaly_detection',
        priority: 'medium',
        weight: 73,
        groupId: data.groupId,
        groupName: data.groupName,
        title: isPositive ? 'Evento Extraordinário Detectado' : 'Atividade Anômala Identificada',
        description: `${isPositive ? 'Oportunidade de aprendizado' : 'Situação atípica'}: em ${anomaly.date}, a atividade foi ${Math.abs(deviationPercent)}% ${isPositive ? 'superior' : 'inferior'} ao padrão usual. Com ${anomaly.total_messages.toLocaleString('pt-BR')} mensagens vs média de ${Math.round(mean)}, este evento merece investigação.`,
        value: anomaly.total_messages,
        change: deviationPercent,
        trend: isPositive ? 'up' : 'down',
        actionable: true,
        recommendation: isPositive 
          ? 'Analise o sucesso: identifique os fatores que causaram este pico excepcional para criar estratégias replicáveis de engajamento.'
          : 'Investigue a causa: entenda os fatores que levaram a esta queda para prevenir situações similares no futuro.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: data.dailyStats.length,
          confidence: 88,
          category: 'Anomalia'
        }
      });
    }
  }

  // 9. Análise de Emergência de Liderança (REFINADA)
  private analyzeLeadershipEmergence(data: GroupAnalysisData): void {
    if (data.memberStats.length < 4) return;

    const sortedMembers = data.memberStats.sort((a, b) => b.message_count - a.message_count);
    const leader = sortedMembers[0];
    const second = sortedMembers[1];
    
    if (second.message_count === 0) return;

    const leadershipGap = ((leader.message_count - second.message_count) / second.message_count) * 100;
    const totalMessages = data.memberStats.reduce((sum, member) => sum + member.message_count, 0);
    const leaderParticipation = (leader.message_count / totalMessages) * 100;

    if (leadershipGap > 75 && leader.message_count > 30 && leaderParticipation > 20) {
      this.insights.push({
        id: `leadership_natural_${data.groupId}`,
        type: 'leadership_emergence',
        priority: 'high',
        weight: 77,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Liderança Natural Consolidada',
        description: `Identificação estratégica: ${leader.name} demonstra liderança excepcional com ${leader.message_count.toLocaleString('pt-BR')} mensagens (${Math.round(leaderParticipation)}% do total). A diferença de ${Math.round(leadershipGap)}% sobre o segundo colocado evidencia influência natural e potencial de moderação.`,
        value: leader.message_count,
        change: Math.round(leadershipGap),
        trend: 'up',
        actionable: true,
        recommendation: 'Aproveite esta liderança: considere oferecer responsabilidades de co-moderação, mentoria de novos membros ou liderança de projetos especiais para potencializar esta influência natural.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: data.memberStats.length,
          confidence: 92,
          category: 'Liderança'
        }
      });
    }
  }

  // 10. Análise de Diversidade de Participação (SOFISTICADA)
  private analyzeMemberDiversity(data: GroupAnalysisData): void {
    if (data.memberStats.length < 8) return;

    const totalMessages = data.memberStats.reduce((sum, member) => sum + member.message_count, 0);
    const activeMembersCount = data.memberStats.filter(member => member.message_count > 0).length;
    const avgMessagesPerMember = totalMessages / activeMembersCount;
    
    // Análise por tercis de participação
    const lowThreshold = avgMessagesPerMember * 0.25;
    const highThreshold = avgMessagesPerMember * 2;
    
    const participationLevels = {
      high: data.memberStats.filter(m => m.message_count >= highThreshold).length,
      medium: data.memberStats.filter(m => m.message_count >= lowThreshold && m.message_count < highThreshold).length,
      low: data.memberStats.filter(m => m.message_count > 0 && m.message_count < lowThreshold).length
    };

    const mediumParticipationRatio = (participationLevels.medium / activeMembersCount) * 100;
    const diversityIndex = 100 - Math.abs(50 - mediumParticipationRatio);

    if (diversityIndex > 75 && participationLevels.medium >= 4) {
      this.insights.push({
        id: `diversity_optimal_${data.groupId}`,
        type: 'member_concentration',
        priority: 'high',
        weight: 83,
        groupId: data.groupId,
        groupName: data.groupName,
        title: 'Ecossistema Equilibrado',
        description: `Distribuição excepcional: ${participationLevels.high} membros altamente ativos, ${participationLevels.medium} moderadamente engajados e ${participationLevels.low} participantes ocasionais. Esta diversidade (índice ${Math.round(diversityIndex)}%) cria um ambiente saudável e sustentável.`,
        value: Math.round(diversityIndex),
        change: Math.round(mediumParticipationRatio),
        trend: 'up',
        actionable: false,
        recommendation: 'Preserve este equilíbrio: esta distribuição ideal maximiza a dinâmica do grupo. Monitore para garantir que nenhum segmento domine excessivamente as conversas.',
        metadata: {
          period: `Últimos 30 dias`,
          dataPoints: activeMembersCount,
          confidence: 88,
          category: 'Distribuição'
        }
      });
    }
  }

  // Função auxiliar para calcular consistência (APRIMORADA)
  private calculateConsistency(dailyStats: Array<{ total_messages: number }>): number {
    if (dailyStats.length < 3) return 100;
    
    const messages = dailyStats.map(day => day.total_messages);
    const mean = messages.reduce((sum, val) => sum + val, 0) / messages.length;
    
    if (mean === 0) return 0;
    
    const variance = messages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / messages.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    // Score de consistência mais refinado
    const consistencyScore = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 60)));
    return consistencyScore;
  }
}

// Função principal para usar no dashboard
export const generateSmartInsights = (groupsData: GroupAnalysisData[]): SmartInsight[] => {
  const engine = new InsightsEngine();
  return engine.generateInsights(groupsData);
}; 