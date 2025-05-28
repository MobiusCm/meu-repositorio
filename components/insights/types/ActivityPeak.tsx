import React from 'react';
import { InsightTemplate } from '../templates/InsightTemplate';
import { DateFormatter } from '../utils/DateFormatter';
import { DataProcessor, GroupAnalysisData } from '../utils/DataProcessor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Calendar, TrendingUp, Users, Target } from 'lucide-react';

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
  const { groupData } = insight;
  
  // Processar dados do pico de atividade
  const peakData = DataProcessor.getActivityPeakData(groupData);
  
  const MetricCard = ({ title, value, subtitle, color, icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color: 'orange' | 'blue' | 'slate';
    icon?: React.ReactNode;
  }) => {
    const colorClasses = {
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
      slate: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
    };
    
    return (
      <Card className={`${colorClasses[color]} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm font-medium">{title}</div>
              {subtitle && (
                <div className="text-xs opacity-70 mt-1">{subtitle}</div>
              )}
            </div>
            {icon && (
              <div className="text-2xl opacity-60">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <InsightTemplate
      insight={{
        id: insight.id,
        title: insight.title,
        priority: insight.priority,
        groupId: insight.groupId,
        groupName: insight.groupName,
        metadata: insight.metadata,
        trend: insight.trend
      }}
      icon={<Zap className="h-5 w-5 text-orange-600" />}
      showHeader={false}
    >
      <div className="space-y-6">
        {/* Seção de Resumo do Pico */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Detalhes do Pico de Atividade
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="Mensagens no Pico"
              value={peakData.peak.messages.toLocaleString()}
              subtitle={peakData.peak.dateFormatted}
              color="orange"
              icon={<Zap />}
            />
            
            <MetricCard
              title="Membros Ativos"
              value={peakData.peak.members}
              subtitle="no dia do pico"
              color="blue"
              icon={<Users />}
            />
            
            <MetricCard
              title="Acima da Média"
              value={`+${peakData.peak.percentageAboveAverage.toFixed(0)}%`}
              subtitle={`vs ${peakData.peak.average.toFixed(0)} msg/dia`}
              color="slate"
              icon={<TrendingUp />}
            />
          </div>
        </div>

        {/* Gráfico da Atividade */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Evolução da Atividade</h3>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensagens por Dia</CardTitle>
              <CardDescription>
                Período: {peakData.period} • Pico destacado em laranja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={peakData.chartData}>
                    <defs>
                      <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fontSize: 11 }}
                    />
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      labelFormatter={(value) => `Data: ${value}`}
                      formatter={(value: any, name: string) => [
                        `${value} mensagens`,
                        name === 'messages' ? 'Atividade' : name
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#3b82f6"
                      fill="url(#colorNormal)"
                      strokeWidth={2}
                      name="Atividade Normal"
                    />
                    {/* Destacar o pico */}
                    {peakData.chartData.map((point, index) => 
                      point.isPeak ? (
                        <Area 
                          key={`peak-${index}`}
                          type="monotone" 
                          dataKey="messages" 
                          stroke="#f97316"
                          fill="url(#colorPeak)"
                          strokeWidth={3}
                          name="Pico de Atividade"
                        />
                      ) : null
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contexto do Pico */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contexto e Análise</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações contextuais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Contexto Temporal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dia da semana:</span>
                  <Badge variant="outline">{peakData.context.dayOfWeek}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tipo de dia:</span>
                  <Badge variant={peakData.context.isWeekend ? "secondary" : "outline"}>
                    {peakData.context.isWeekend ? "Fim de semana" : "Dia útil"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data exata:</span>
                  <span className="text-sm font-medium">{peakData.peak.dateFormatted}</span>
                </div>
              </CardContent>
            </Card>

            {/* Dias próximos para comparação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comparação com Dias Próximos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {peakData.context.nearbyDays.map((day, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span className="text-sm">{day.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{day.messages} msgs</span>
                      {day.date === peakData.peak.dateFormatted && (
                        <Badge variant="destructive" className="text-xs">PICO</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recomendações Específicas */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Estratégias Recomendadas
          </h3>
          
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                    Aproveitar o Momento de Alta Atividade
                  </h4>
                  <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400">•</span>
                      <span>
                        <strong>Analyze o gatilho:</strong> Identifique exatamente o que causou este pico no dia {peakData.peak.dateFormatted}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400">•</span>
                      <span>
                        <strong>Replique o sucesso:</strong> Documente o tipo de conteúdo, horário e contexto para reproduzir
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400">•</span>
                      <span>
                        <strong>Capitalize o engajamento:</strong> Use momentos de alta atividade para introduzir novos tópicos importantes
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400">•</span>
                      <span>
                        <strong>Monitore padrões:</strong> Verifique se há regularidade semanal ou correlação com eventos específicos
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Passos */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-3">
            Próximos Passos Recomendados:
          </h4>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>1. Analise o conteúdo específico do dia {peakData.peak.dateFormatted} para identificar padrões</p>
            <p>2. Documente horários e tipos de postagem que geraram maior resposta</p>
            <p>3. Teste replicar as estratégias bem-sucedidas em {peakData.context.dayOfWeek}s similares</p>
            <p>4. Use os próximos picos para introduzir conteúdo estratégico ou decisões importantes</p>
            <p>5. Monitore se consegue criar picos intencionalmente usando os insights descobertos</p>
          </div>
        </div>
      </div>
    </InsightTemplate>
  );
} 