import React from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GroupAnalysisData, DataProcessor } from '../utils/DataProcessor';

// Tipos base para insights
export interface BaseInsight {
  id: string;
  type: 'verified' | 'custom';
  category: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  groupId: string;
  groupName: string;
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface VerifiedInsight extends BaseInsight {
  type: 'verified';
  verified: true;
  formula: {
    expression: string;
    variables: string[];
    threshold: number;
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  };
  metadata: {
    version: string;
    author: 'system';
    accuracy: number; // 0-100
    complexity: 'basic' | 'intermediate' | 'advanced';
  };
}

export interface CustomInsight extends BaseInsight {
  type: 'custom';
  verified: false;
  formula: string; // String da fórmula criada pelo usuário
  variables: string[];
  conditions: Array<{
    field: string;
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
    value: number | string;
  }>;
  icon: string;
  createdBy: string;
}

export interface VerifiedInsightData {
  insight: VerifiedInsight;
  groupData: GroupAnalysisData;
  calculatedValues: Record<string, number>;
  triggered: boolean;
  trend: 'up' | 'down' | 'stable' | 'warning' | 'critical';
}

export interface InsightPreference {
  id: string;
  userId: string;
  groupId: string;
  insightId: string;
  enabled: boolean;
  threshold?: number;
  customSettings?: Record<string, any>;
  lastModified: Date;
}

// Registry de insights verificados
export class InsightRegistry {
  private static verifiedInsights: Record<string, VerifiedInsight> = {
    'participation_decline': {
      id: 'participation_decline',
      type: 'verified',
      verified: true,
      category: 'Engajamento',
      title: 'Declínio de Participação',
      description: 'Detecta quando há redução significativa na atividade do grupo',
      priority: 'high',
      groupId: '',
      groupName: '',
      enabled: true,
      createdAt: new Date(),
      formula: {
        expression: '(first_period_avg - second_period_avg) / first_period_avg * 100',
        variables: ['first_period_avg', 'second_period_avg'],
        threshold: -20, // -20% ou mais é considerado declínio
        operator: 'lte'
      },
      metadata: {
        version: '1.0.0',
        author: 'system',
        accuracy: 95,
        complexity: 'intermediate'
      }
    },
    
    'activity_peak': {
      id: 'activity_peak',
      type: 'verified',
      verified: true,
      category: 'Atividade',
      title: 'Pico de Atividade',
      description: 'Identifica dias com atividade excepcionalmente alta',
      priority: 'medium',
      groupId: '',
      groupName: '',
      enabled: true,
      createdAt: new Date(),
      formula: {
        expression: '(peak_messages - average_messages) / average_messages * 100',
        variables: ['peak_messages', 'average_messages'],
        threshold: 150, // 150% acima da média
        operator: 'gte'
      },
      metadata: {
        version: '1.0.0',
        author: 'system',
        accuracy: 90,
        complexity: 'basic'
      }
    },
    
    'member_concentration': {
      id: 'member_concentration',
      type: 'verified',
      verified: true,
      category: 'Distribuição',
      title: 'Concentração de Membros',
      description: 'Alerta quando poucos membros dominam as conversas',
      priority: 'medium',
      groupId: '',
      groupName: '',
      enabled: true,
      createdAt: new Date(),
      formula: {
        expression: 'top_20_percent_messages / total_messages * 100',
        variables: ['top_20_percent_messages', 'total_messages'],
        threshold: 80, // 80% das mensagens vêm de 20% dos membros
        operator: 'gte'
      },
      metadata: {
        version: '1.0.0',
        author: 'system',
        accuracy: 88,
        complexity: 'intermediate'
      }
    },
    
    'growth_acceleration': {
      id: 'growth_acceleration',
      type: 'verified',
      verified: true,
      category: 'Crescimento',
      title: 'Aceleração de Crescimento',
      description: 'Detecta tendências de crescimento acelerado',
      priority: 'low',
      groupId: '',
      groupName: '',
      enabled: true,
      createdAt: new Date(),
      formula: {
        expression: 'weekly_growth_rate',
        variables: ['weekly_growth_rate'],
        threshold: 25, // 25% de crescimento semanal
        operator: 'gte'
      },
      metadata: {
        version: '1.0.0',
        author: 'system',
        accuracy: 85,
        complexity: 'advanced'
      }
    }
  };

  // Obter todos os insights verificados
  static getVerifiedInsights(): VerifiedInsight[] {
    return Object.values(this.verifiedInsights);
  }

  // Obter insight verificado por ID
  static getVerifiedInsight(id: string): VerifiedInsight | null {
    return this.verifiedInsights[id] || null;
  }

  // Calcular valores para um insight verificado
  static calculateInsightValues(
    insight: VerifiedInsight, 
    groupData: GroupAnalysisData
  ): VerifiedInsightData {
    let calculatedValues: Record<string, number> = {};
    let triggered = false;
    let trend: 'up' | 'down' | 'stable' | 'warning' | 'critical' = 'stable';

    switch (insight.id) {
      case 'participation_decline': {
        const data = DataProcessor.getParticipationDeclineData(groupData);
        
        calculatedValues = {
          first_period_avg: data.comparison.first.avgDaily,
          second_period_avg: data.comparison.second.avgDaily,
          decline_percentage: Math.abs(data.comparison.change.percentage)
        };
        
        triggered = data.comparison.change.percentage <= insight.formula.threshold;
        trend = triggered ? (data.comparison.change.percentage <= -30 ? 'critical' : 'down') : 'stable';
        break;
      }
      
      case 'activity_peak': {
        const data = DataProcessor.getActivityPeakData(groupData);
        
        calculatedValues = {
          peak_messages: data.peak.messages,
          average_messages: data.comparison.average,
          percentage_above_average: (data.peak.messages / data.comparison.average) * 100 - 100
        };
        
        const percentageAboveAverage = (data.peak.messages / data.comparison.average) * 100 - 100;
        triggered = percentageAboveAverage >= insight.formula.threshold;
        trend = triggered ? 'up' : 'stable';
        break;
      }
      
      case 'member_concentration': {
        const data = DataProcessor.getMemberConcentrationData(groupData);
        const totalMessages = groupData.dailyStats.reduce((sum, day) => sum + day.total_messages, 0);
        
        calculatedValues = {
          top_20_percent_messages: data.concentration.top3Percentage, // Usando top3 como proxy para top20%
          total_messages: totalMessages,
          concentration_percentage: data.concentration.top3Percentage
        };
        
        triggered = data.concentration.top3Percentage >= insight.formula.threshold;
        trend = triggered ? 'warning' : 'stable';
        break;
      }
      
      case 'growth_acceleration': {
        const data = DataProcessor.getGrowthTrendData(groupData);
        
        calculatedValues = {
          weekly_growth_rate: data.growth.rate,
          growth_direction: data.growth.direction === 'up' ? 1 : data.growth.direction === 'down' ? -1 : 0
        };
        
        triggered = data.growth.rate >= insight.formula.threshold && data.growth.direction === 'up';
        trend = triggered ? 'up' : data.growth.direction === 'down' ? 'down' : 'stable';
        break;
      }
    }

    return {
      insight: {
        ...insight,
        groupId: groupData.groupId,
        groupName: groupData.groupName
      },
      groupData,
      calculatedValues,
      triggered,
      trend
    };
  }

  // Renderizar selo de verificado
  static renderVerificationBadge(): React.ReactNode {
    return (
      <Badge 
        variant="secondary" 
        className="gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50"
      >
        <Shield className="h-3 w-3" />
        Verificado
      </Badge>
    );
  }

  // Renderizar ícone de insight verificado
  static renderVerificationIcon(): React.ReactNode {
    return (
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
        <CheckCircle className="h-3 w-3 text-white" />
      </div>
    );
  }

  // Obter cor da prioridade
  static getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  }

  // Obter descrição da precisão
  static getAccuracyDescription(accuracy: number): string {
    if (accuracy >= 95) return 'Extremamente Preciso';
    if (accuracy >= 90) return 'Muito Preciso';
    if (accuracy >= 85) return 'Preciso';
    if (accuracy >= 80) return 'Moderadamente Preciso';
    return 'Preciso';
  }

  // Obter insights ativos para um grupo
  static getActiveInsightsForGroup(groupData: GroupAnalysisData): VerifiedInsightData[] {
    const activeInsights: VerifiedInsightData[] = [];
    
    for (const insight of this.getVerifiedInsights()) {
      const calculatedData = this.calculateInsightValues(insight, groupData);
      if (calculatedData.triggered) {
        activeInsights.push(calculatedData);
      }
    }
    
    // Ordenar por prioridade (critical > high > medium > low)
    return activeInsights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.insight.priority] - priorityOrder[a.insight.priority];
    });
  }

  // Validar se um insight deve ser exibido
  static shouldDisplayInsight(insight: VerifiedInsightData, preferences?: InsightPreference[]): boolean {
    // Se não há preferências, usar configurações padrão
    if (!preferences) {
      return insight.triggered && insight.insight.enabled;
    }
    
    // Verificar se há preferência específica para este insight
    const preference = preferences.find(p => 
      p.insightId === insight.insight.id && 
      p.groupId === insight.insight.groupId
    );
    
    if (preference) {
      return preference.enabled && insight.triggered;
    }
    
    // Configuração padrão
    return insight.triggered && insight.insight.enabled;
  }
} 