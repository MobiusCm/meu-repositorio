import React from 'react';
import { Users, BarChart3, Percent, PieChart, Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell } from 'recharts';
import { DataProcessor, GroupAnalysisData, MemberConcentrationData } from '../utils/DataProcessor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface MemberConcentrationInsight {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  groupId: string;
  groupName: string;
  metadata?: {
    period?: string;
  };
  trend: 'up' | 'down' | 'stable' | 'warning' | 'critical';
  groupData: GroupAnalysisData;
}

export function MemberConcentration({ insight }: { insight: MemberConcentrationInsight }) {
  // Processar dados usando o DataProcessor
  const data = React.useMemo((): MemberConcentrationData => {
    return DataProcessor.getMemberConcentrationData(insight.groupData);
  }, [insight.groupData]);

  // Cores para tema claro e escuro
  const getThemeColors = () => ({
    // Backgrounds
    card: 'bg-white dark:bg-gray-900',
    cardSecondary: 'bg-gray-50 dark:bg-gray-800',
    cardAccent: 'bg-purple-50 dark:bg-purple-950/20',
    
    // Borders
    border: 'border-gray-200 dark:border-gray-700',
    borderAccent: 'border-purple-200 dark:border-purple-800/50',
    
    // Text
    textPrimary: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    textMuted: 'text-gray-500 dark:text-gray-500',
    textAccent: 'text-purple-700 dark:text-purple-300',
    
    // Chart colors
    chart: {
      primary: '#8b5cf6',   // purple-500
      secondary: '#a78bfa', // purple-400
      tertiary: '#c4b5fd',  // purple-300
      quaternary: '#ddd6fe', // purple-200
      quinary: '#ede9fe',   // purple-100
      grid: '#e5e7eb',      // gray-200
      gridDark: '#374151'   // gray-700
    }
  });

  const colors = getThemeColors();

  // Função para determinar cor do badge de nível
  const getLevelBadge = (level: MemberConcentrationData['summary']['level']) => {
    const badges = {
      balanced: { variant: 'secondary' as const, text: 'Equilibrado', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
      moderate: { variant: 'secondary' as const, text: 'Moderado', color: 'text-blue-600 dark:text-blue-400', icon: BarChart3 },
      concentrated: { variant: 'secondary' as const, text: 'Concentrado', color: 'text-orange-600 dark:text-orange-400', icon: TrendingUp },
      monopolized: { variant: 'destructive' as const, text: 'Monopolizado', color: 'text-red-600 dark:text-red-400', icon: AlertTriangle }
    };
    
    return badges[level];
  };

  const levelBadge = getLevelBadge(data.summary.level);

  // Cores para o gráfico de barras
  const getBarColor = (index: number) => {
    const colorMap = [
      colors.chart.primary,
      colors.chart.secondary,
      colors.chart.tertiary,
      colors.chart.quaternary,
      colors.chart.quinary
    ];
    return colorMap[index] || colors.chart.quinary;
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header com Badge de Verificação e Nível */}
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
            <Badge variant={levelBadge.variant} className="text-xs flex items-center gap-1">
              <levelBadge.icon className="h-3 w-3" />
              {levelBadge.text}
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
              <Users className="h-4 w-4 text-purple-500" />
              <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                Top 3 Membros
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.textAccent}`}>
              {data.concentration.top3Percentage}%
            </div>
            <p className={`text-xs ${colors.textMuted} mt-1`}>
              das mensagens totais
            </p>
            <div className="mt-2">
              <Progress 
                value={data.concentration.top3Percentage} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-500" />
              <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                Índice de Diversidade
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.textPrimary}`}>
              {data.concentration.diversityIndex}
            </div>
            <p className={`text-xs ${colors.textMuted} mt-1`}>
              Simpson's Index (0-1)
            </p>
          </CardContent>
        </Card>

        <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <CardTitle className={`text-sm font-medium ${colors.textSecondary}`}>
                Coef. de Gini
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${colors.textPrimary}`}>
              {data.concentration.giniCoefficient}
            </div>
            <p className={`text-xs ${colors.textMuted} mt-1`}>
              desigualdade (0-1)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Membros Mais Ativos */}
      <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${colors.textPrimary}`}>
            Top 5 Membros Mais Ativos
          </CardTitle>
          <CardDescription className={colors.textSecondary}>
            Ranking dos membros com maior participação no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topMembers.map((member, index) => (
              <div key={member.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white
                    ${index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-purple-500'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${colors.textPrimary}`}>
                      {member.name}
                    </p>
                    <p className={`text-sm ${colors.textMuted}`}>
                      {member.messages} mensagens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${colors.textPrimary}`}>
                    {member.percentage}%
                  </div>
                  <div className="w-20">
                    <Progress 
                      value={member.percentage} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Distribuição */}
      <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${colors.textPrimary}`}>
            Distribuição de Mensagens por Membro
          </CardTitle>
          <CardDescription className={colors.textSecondary}>
            Visualização da concentração de atividade entre os membros mais ativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgb(229 231 235)"
                  className="dark:stroke-gray-700"
                />
                <XAxis 
                  dataKey="member" 
                  tick={{ fontSize: 12 }}
                  className={colors.textMuted}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                  labelStyle={{ color: 'rgb(75 85 99)' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'messages') {
                      return [`${value} mensagens`, 'Mensagens'];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="messages" radius={[4, 4, 0, 0]}>
                  {data.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Análise e Recomendações */}
      <Card className={`${colors.card} ${colors.border} border shadow-sm`}>
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${colors.textPrimary} flex items-center gap-2`}>
            <Percent className="h-5 w-5 text-purple-500" />
            Análise e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.summary.level === 'balanced' && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  ✅ Participação Equilibrada
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  O grupo apresenta uma distribuição saudável de participação. Continue incentivando a participação de todos os membros.
                </p>
              </div>
            )}
            
            {data.summary.level === 'moderate' && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  ℹ️ Concentração Moderada
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Alguns membros dominam as conversas, mas ainda há participação de outros. Considere incentivar membros menos ativos.
                </p>
              </div>
            )}
            
            {data.summary.level === 'concentrated' && (
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/50">
                <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                  ⚠️ Alta Concentração
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Poucos membros dominam as conversas. Considere criar tópicos específicos ou fazer perguntas diretas para engajar outros membros.
                </p>
              </div>
            )}
            
            {data.summary.level === 'monopolized' && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  🚨 Participação Monopolizada
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Muito poucos membros dominam completamente as conversas. É essencial tomar medidas para incentivar a participação de outros membros e equilibrar as discussões.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h5 className={`font-medium ${colors.textPrimary}`}>Métricas Técnicas:</h5>
                <ul className={`text-sm ${colors.textSecondary} space-y-1`}>
                  <li>• Índice de Diversidade: {data.concentration.diversityIndex}</li>
                  <li>• Coeficiente de Gini: {data.concentration.giniCoefficient}</li>
                  <li>• Top 3: {data.concentration.top3Percentage}% das mensagens</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h5 className={`font-medium ${colors.textPrimary}`}>Sugestões:</h5>
                <ul className={`text-sm ${colors.textSecondary} space-y-1`}>
                  <li>• Faça perguntas diretas a membros menos ativos</li>
                  <li>• Crie tópicos de interesse específico</li>
                  <li>• Promova discussões em grupos menores</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 