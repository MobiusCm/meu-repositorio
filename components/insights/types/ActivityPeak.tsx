import React from 'react';
import { Zap, Calendar, TrendingUp, Clock, Target, BarChart3, Shield } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { DataProcessor, GroupAnalysisData, ActivityPeakData } from '../utils/DataProcessor';
import { DateFormatter } from '../utils/DateFormatter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ActivityPeakInsight {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  groupId: string;
  groupName: string;
  metadata?: {
    period?: string;
  };
  trend: 'up' | 'warning';
  groupData: GroupAnalysisData;
}

export function ActivityPeak({ insight }: { insight: ActivityPeakInsight }) {
  // Processar dados usando o DataProcessor
  const data = React.useMemo((): ActivityPeakData => {
    return DataProcessor.getActivityPeakData(insight.groupData);
  }, [insight.groupData]);

  // Cores para tema claro e escuro
  const getThemeColors = () => ({
    // Backgrounds
    card: 'bg-white dark:bg-gray-900',
    cardSecondary: 'bg-gray-50 dark:bg-gray-800',
    cardAccent: 'bg-amber-50 dark:bg-amber-950/20',
    
    // Borders
    border: 'border-gray-200 dark:border-gray-700',
    borderAccent: 'border-amber-200 dark:border-amber-800/50',
    
    // Text
    textPrimary: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    textMuted: 'text-gray-500 dark:text-gray-500',
    textAccent: 'text-amber-700 dark:text-amber-300',
    
    // Chart colors
    chart: {
      normal: '#6b7280', // gray-500
      peak: '#f59e0b',   // amber-500
      grid: '#e5e7eb',   // gray-200
      gridDark: '#374151' // gray-700
    }
  });

  const colors = getThemeColors();

  // Função para determinar cor do badge de intensidade
  const getIntensityBadge = (intensity: ActivityPeakData['summary']['intensity']) => {
    const badges = {
      low: { variant: 'secondary' as const, text: 'Baixa', color: 'text-blue-600 dark:text-blue-400' },
      medium: { variant: 'secondary' as const, text: 'Média', color: 'text-green-600 dark:text-green-400' },
      high: { variant: 'secondary' as const, text: 'Alta', color: 'text-orange-600 dark:text-orange-400' },
      extreme: { variant: 'destructive' as const, text: 'Extrema', color: 'text-red-600 dark:text-red-400' }
    };
    
    return badges[intensity];
  };

  const intensityBadge = getIntensityBadge(data.summary.intensity);

  return (
    <div className="space-y-6 p-1">
      {/* Header com Badge de Verificação e Intensidade */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-semibold ${colors.textPrimary}`}>
                {data.summary.title}
              </h1>
              <p className={`text-sm ${colors.textSecondary} mt-1`}>
                Insight Verificado • {insight.groupName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={intensityBadge.variant} className="text-xs">
              Intensidade: {intensityBadge.text}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {insight.metadata?.period || '30 dias'}
            </Badge>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${colors.cardAccent} ${colors.borderAccent} border`}>
          <p className={`text-sm leading-relaxed ${colors.textAccent}`}>
            {data.summary.description}
          </p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                Pico de Atividade
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.textAccent}`}>
              {data.peak.messages}
            </div>
            <p className={`text-xs ${colors.textMuted} mt-1`}>
              mensagens em {data.peak.date}
            </p>
          </CardContent>
        </Card>

        <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                Multiplicador
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.textPrimary}`}>
              {data.peak.ratio}x
            </div>
            <p className={`text-xs ${colors.textMuted} mt-1`}>
              acima da média normal
            </p>
          </CardContent>
        </Card>

        <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                Duração Estimada
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.textPrimary}`}>
              {data.peak.duration}h
            </div>
            <p className={`text-xs ${colors.textMuted} mt-1`}>
              de atividade intensa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Atividade com Pico Destacado */}
      <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${colors.textPrimary}`}>
            Atividade Diária com Pico Destacado
          </CardTitle>
          <CardDescription className={colors.textSecondary}>
            Distribuição das mensagens mostrando o dia de pico em destaque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgb(229 231 235)"
                  className="dark:stroke-gray-700"
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className={colors.textMuted}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className={colors.textMuted}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(255 255 255)',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="messages" name="Mensagens" radius={[2, 2, 0, 0]}>
                  {data.chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isPeak ? colors.chart.peak : colors.chart.normal}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparação com Média */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
          <CardHeader>
            <CardTitle className={`text-base font-semibold ${colors.textPrimary} flex items-center gap-2`}>
              <BarChart3 className="h-4 w-4 text-gray-500" />
              Média Normal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.textSecondary}`}>Mensagens por dia</span>
              <span className={`font-semibold ${colors.textPrimary}`}>
                {data.comparison.average}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.textSecondary}`}>Padrão esperado</span>
              <span className={`font-semibold ${colors.textPrimary}`}>
                Atividade regular
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Badge variant="secondary" className="text-xs">
                Base de comparação
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
          <CardHeader>
            <CardTitle className={`text-base font-semibold ${colors.textPrimary} flex items-center gap-2`}>
              <Zap className="h-4 w-4 text-amber-500" />
              Dia do Pico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.textSecondary}`}>Mensagens registradas</span>
              <span className={`font-semibold ${colors.textAccent}`}>
                {data.comparison.peakValue}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${colors.textSecondary}`}>Aumento percentual</span>
              <span className={`font-semibold ${colors.textAccent}`}>
                +{data.comparison.improvement}%
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Badge variant={intensityBadge.variant} className="text-xs">
                Pico em {data.peak.date}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises e Recomendações */}
      <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${colors.textPrimary} flex items-center gap-2`}>
            <Target className="h-5 w-5 text-blue-500" />
            Análises e Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${colors.cardSecondary}`}>
              <h4 className={`font-medium ${colors.textPrimary} mb-2`}>🔍 O que Aconteceu</h4>
              <ul className={`text-sm ${colors.textSecondary} space-y-1`}>
                <li>• Pico de {data.peak.ratio}x acima da média indica evento ou conteúdo especial</li>
                <li>• Atividade concentrada em {data.peak.duration} horas sugere alta relevância</li>
                <li>• Momento ideal identificado para máximo engajamento do grupo</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg ${colors.cardSecondary}`}>
              <h4 className={`font-medium ${colors.textPrimary} mb-2`}>💡 Como Replicar</h4>
              <ul className={`text-sm ${colors.textSecondary} space-y-1`}>
                <li>• Analise o tipo de conteúdo que gerou o pico</li>
                <li>• Identifique o horário específico de maior atividade</li>
                <li>• Replique elementos-chave em futuras postagens</li>
                <li>• Use o mesmo formato ou estilo que funcionou</li>
              </ul>
            </div>

            {data.summary.intensity === 'extreme' && (
              <div className={`p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border ${colors.borderAccent}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <h4 className={`font-medium ${colors.textAccent}`}>Pico Extremo Detectado</h4>
                </div>
                <p className={`text-sm ${colors.textAccent}`}>
                  Este pico representa atividade excepcional. Considere documentar o que 
                  causou este engajamento para uso em estratégias futuras de conteúdo.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 