import React from 'react';
import { TrendingDown, Calendar, Users, MessageSquare, Target, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DataProcessor, GroupAnalysisData } from '../utils/DataProcessor';
import { DateFormatter } from '../utils/DateFormatter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const data = DataProcessor.getParticipationDeclineData(insight.groupData);
  
  return (
    <div className="max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
      <div className="space-y-6 p-6">
        {/* Header Card - Clean e Minimalista */}
        <Card className="border border-red-200 dark:border-red-800/30 bg-white dark:bg-red-950/40">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-700/50">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 dark:text-red-100">
                    Declínio de Participação
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-red-300 mt-1">
                    Análise detalhada do grupo {insight.groupName}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="destructive" className="bg-red-600 text-white border-0">
                {insight.priority === 'critical' ? 'Crítico' : 'Alto'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 border border-red-100 dark:border-red-700/30">
              <p className="text-sm text-slate-700 dark:text-red-200 leading-relaxed">
                {data.summary.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Queda de Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                -{Math.abs(data.comparison.change.percentage)}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                De {data.comparison.first.messages.toLocaleString()} para {data.comparison.second.messages.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Membros Afetados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {data.decline.members}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Menos membros ativos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período Analisado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {data.comparison.first.days + data.comparison.second.days} dias
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {data.period}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Comparação de Períodos */}
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Comparação de Períodos</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Análise detalhada entre o primeiro e segundo período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primeiro Período */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 dark:text-emerald-400 flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  Primeiro Período
                </h4>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800/30">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-emerald-300">Período:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-emerald-200">{data.comparison.first.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-emerald-300">Mensagens:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-emerald-200">{data.comparison.first.messages.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-emerald-300">Membros ativos:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-emerald-200">{data.comparison.first.members}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-emerald-300">Média diária:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-emerald-200">{data.comparison.first.avgDaily} msgs/dia</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segundo Período */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 dark:text-red-400 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Segundo Período
                </h4>
                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-100 dark:border-red-800/30">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-red-300">Período:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-red-200">{data.comparison.second.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-red-300">Mensagens:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-red-200">{data.comparison.second.messages.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-red-300">Membros ativos:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-red-200">{data.comparison.second.members}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-red-300">Média diária:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-red-200">{data.comparison.second.avgDaily} msgs/dia</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Tendência */}
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Evolução da Atividade</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Mensagens e membros ativos ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor' }}
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor' }}
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="messages" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    name="Mensagens"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="members" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    name="Membros Ativos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Plano de Ação
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Estratégias para reverter o declínio de participação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-blue-100">Identificar Causas</h5>
                  <p className="text-sm text-slate-600 dark:text-blue-300 mt-1">
                    Analise as {data.comparison.first.days} primeiras e {data.comparison.second.days} últimas datas para identificar eventos que causaram a queda
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-800/30">
                <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">2</span>
                </div>
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-amber-100">Reengajar Membros</h5>
                  <p className="text-sm text-slate-600 dark:text-amber-300 mt-1">
                    Publique conteúdo relevante e faça perguntas diretas para motivar os {data.decline.members} membros inativos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-emerald-100">Monitorar Progresso</h5>
                  <p className="text-sm text-slate-600 dark:text-emerald-300 mt-1">
                    Acompanhe se as ações resultam em aumento para mais de {data.comparison.first.avgDaily} mensagens/dia
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 