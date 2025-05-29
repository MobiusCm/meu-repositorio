import React from 'react';
import { TrendingDown, Calendar, Users, MessageSquare, Target, AlertTriangle, Shield } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { DataProcessor, GroupAnalysisData, ParticipationDeclineData } from '../utils/DataProcessor';
import { DateFormatter } from '../utils/DateFormatter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InsightRegistry } from './InsightRegistry';

export interface ParticipationDeclineInsight {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  groupId: string;
  groupName: string;
  metadata?: {
    period?: string;
  };
  trend: 'down' | 'critical';
  groupData: GroupAnalysisData;
}

export function ParticipationDecline({ insight }: { insight: ParticipationDeclineInsight }) {
  // Processar dados usando o novo DataProcessor
  const data = React.useMemo((): ParticipationDeclineData => {
    return DataProcessor.getParticipationDeclineData(insight.groupData);
  }, [insight.groupData]);

  // Cores para tema claro e escuro
  const getThemeColors = () => ({
    // Cores principais mais clean e minimalistas
    primary: {
      bg: 'bg-white dark:bg-gray-900',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-gray-100'
    },
    
    // Cards com background sutil
    card: {
      bg: 'bg-gray-50 dark:bg-gray-800/50',
      border: 'border-gray-100 dark:border-gray-700/50'
    },
    
    // Métricas com cores mais neutras
    metric: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-700 dark:text-gray-300'
    },
    
    // Alertas de declínio - mais sutis no tema claro
    decline: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-100 dark:border-red-800/30',
      text: 'text-red-700 dark:text-red-300',
      accent: 'text-red-600 dark:text-red-400'
    },
    
    // Textos secundários
    muted: 'text-gray-600 dark:text-gray-400',
    
    // Chart colors - mais sutis
    chart: {
      primary: '#ef4444', // red-500
      secondary: '#f87171', // red-400
      gradient: {
        from: 'rgba(239, 68, 68, 0.1)', // red-500 com 10% opacidade
        to: 'rgba(239, 68, 68, 0.05)'   // red-500 com 5% opacidade
      }
    }
  });

  const colors = getThemeColors();

  // Função para determinar cor do badge de severidade
  const getSeverityBadge = (severity: ParticipationDeclineData['summary']['severity']) => {
    const badges = {
      low: { variant: 'secondary' as const, text: 'Baixo', color: 'text-blue-600 dark:text-blue-400' },
      medium: { variant: 'secondary' as const, text: 'Médio', color: 'text-yellow-600 dark:text-yellow-400' },
      high: { variant: 'secondary' as const, text: 'Alto', color: 'text-orange-600 dark:text-orange-400' },
      critical: { variant: 'destructive' as const, text: 'Crítico', color: 'text-red-600 dark:text-red-400' }
    };
    
    return badges[severity];
  };

  const severityBadge = getSeverityBadge(data.summary.severity);

  return (
    <div className="space-y-6 p-1">
      {/* Header com Badge de Verificação e Severidade */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-semibold ${colors.primary.text}`}>
                {data.summary.title}
              </h1>
              <p className={`text-sm ${colors.muted} mt-1`}>
                Insight Verificado • {insight.groupName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={severityBadge.variant} className="text-xs">
              Severidade: {severityBadge.text}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.period}
            </Badge>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${colors.decline.bg} ${colors.decline.border} border`}>
          <p className={`text-sm leading-relaxed ${colors.decline.text}`}>
            {data.summary.description}
          </p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${colors.card.bg} ${colors.card.border} border shadow-sm`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <CardTitle className={`text-sm font-medium ${colors.muted}`}>
                Declínio Total
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.decline.text}`}>
              {data.decline.percentage}%
            </div>
            <p className={`text-xs ${colors.muted} mt-1`}>
              {Math.abs(data.comparison.change.messages)} mensagens a menos
            </p>
          </CardContent>
        </Card>

        <Card className={`${colors.card.bg} ${colors.card.border} border shadow-sm`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <CardTitle className={`text-sm font-medium ${colors.muted}`}>
                Membros Afetados
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.primary.text}`}>
              {Math.abs(data.decline.members)}
            </div>
            <p className={`text-xs ${colors.muted} mt-1`}>
              {data.decline.members < 0 ? 'a menos' : 'a mais'} membros ativos
            </p>
          </CardContent>
        </Card>

        <Card className={`${colors.card.bg} ${colors.card.border} border shadow-sm`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <CardTitle className={`text-sm font-medium ${colors.muted}`}>
                Média Diária
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.primary.text}`}>
              {data.comparison.second.avgDaily}
            </div>
            <p className={`text-xs ${colors.muted} mt-1`}>
              vs {data.comparison.first.avgDaily} anteriormente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendência */}
      <Card className={`${colors.card.bg} ${colors.card.border} border shadow-sm`}>
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${colors.primary.text}`}>
            Tendência de Atividade
          </CardTitle>
          <CardDescription className={colors.muted}>
            Evolução das mensagens e membros ativos ao longo do período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.chart.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.chart.primary} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.chart.secondary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.chart.secondary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgb(229 231 235)"
                  className="dark:stroke-gray-700"
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className={colors.muted}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className={colors.muted}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(255 255 255)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stroke={colors.chart.primary}
                  fillOpacity={1} 
                  fill="url(#colorMessages)" 
                  name="Mensagens"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="members" 
                  stroke={colors.chart.secondary}
                  fillOpacity={1} 
                  fill="url(#colorMembers)" 
                  name="Membros Ativos"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparação Detalhada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`${colors.card.bg} ${colors.card.border} border shadow-sm`}>
          <CardHeader>
            <CardTitle className={`text-base font-semibold ${colors.primary.text} flex items-center gap-2`}>
              <Calendar className="h-4 w-4 text-green-500" />
              {data.comparison.first.period}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.muted}`}>Total de mensagens</span>
              <span className={`font-semibold ${colors.primary.text}`}>
                {data.comparison.first.messages.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.muted}`}>Membros ativos médios</span>
              <span className={`font-semibold ${colors.primary.text}`}>
                {data.comparison.first.members}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.muted}`}>Média diária</span>
              <span className={`font-semibold ${colors.primary.text}`}>
                {data.comparison.first.avgDaily}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Badge variant="secondary" className="text-xs">
                Período de referência
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={`${colors.card.bg} ${colors.card.border} border shadow-sm`}>
          <CardHeader>
            <CardTitle className={`text-base font-semibold ${colors.primary.text} flex items-center gap-2`}>
              <Calendar className="h-4 w-4 text-red-500" />
              {data.comparison.second.period}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.muted}`}>Total de mensagens</span>
              <span className={`font-semibold ${colors.decline.text}`}>
                {data.comparison.second.messages.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.muted}`}>Membros ativos médios</span>
              <span className={`font-semibold ${colors.decline.text}`}>
                {data.comparison.second.members}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.muted}`}>Média diária</span>
              <span className={`font-semibold ${colors.decline.text}`}>
                {data.comparison.second.avgDaily}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Badge variant="destructive" className="text-xs">
                {data.comparison.change.percentage > 0 ? '+' : ''}{data.comparison.change.percentage}% de mudança
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações e Ações */}
      <Card className={`${colors.card.bg} ${colors.card.border} border shadow-sm`}>
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${colors.primary.text} flex items-center gap-2`}>
            <Target className="h-5 w-5 text-blue-500" />
            Recomendações para Reverter o Declínio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${colors.card.bg}`}>
              <h4 className={`font-medium ${colors.primary.text} mb-2`}>🎯 Ações Imediatas</h4>
              <ul className={`text-sm ${colors.muted} space-y-1`}>
                <li>• Revisar conteúdo recente e identificar possíveis causas do declínio</li>
                <li>• Engajar com membros menos ativos através de mensagens diretas</li>
                <li>• Planejar atividades ou discussões para reativar o interesse</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg ${colors.card.bg}`}>
              <h4 className={`font-medium ${colors.primary.text} mb-2`}>📈 Estratégias de Longo Prazo</h4>
              <ul className={`text-sm ${colors.muted} space-y-1`}>
                <li>• Implementar cronograma regular de conteúdo interessante</li>
                <li>• Criar enquetes e perguntas para estimular participação</li>
                <li>• Organizar eventos virtuais ou encontros para fortalecer vínculos</li>
              </ul>
            </div>

            {data.summary.severity === 'critical' && (
              <div className={`p-4 rounded-lg ${colors.decline.bg} ${colors.decline.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <h4 className={`font-medium ${colors.decline.text}`}>Atenção Urgente Necessária</h4>
                </div>
                <p className={`text-sm ${colors.decline.text}`}>
                  O declínio atingiu nível crítico. Considere uma intervenção direta com os 
                  principais membros do grupo para entender as causas e desenvolver um plano 
                  de recuperação específico.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 