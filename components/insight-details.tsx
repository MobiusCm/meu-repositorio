'use client';

import React from 'react';
import { SmartInsight } from '@/lib/insights-engine';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  AlertTriangle, 
  Users, 
  Clock, 
  MessageSquare, 
  Activity,
  CheckCircle,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Zap,
  BarChart3,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Importar novos componentes modulares
import { ParticipationDecline, ParticipationDeclineInsight } from './insights/types/ParticipationDecline';
import { GroupAnalysisData } from './insights/utils/DataProcessor';
import { ActivityPeak } from './insights/types/ActivityPeak';

interface InsightDetailsProps {
  insight: SmartInsight | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InsightDetails({ insight, isOpen, onClose }: InsightDetailsProps) {
  const router = useRouter();

  const getInsightIcon = (insight: SmartInsight) => {
    // Determinar cor baseada na tendência e criticidade
    const getIconColor = () => {
      switch (insight.trend) {
        case 'up':
          return 'text-emerald-600 dark:text-emerald-400';
        case 'down':
          return 'text-red-600 dark:text-red-400';
        case 'critical':
          return 'text-red-700 dark:text-red-300';
        case 'warning':
          return 'text-amber-600 dark:text-amber-400';
        case 'stable':
          return 'text-blue-600 dark:text-blue-400';
        default:
          return 'text-slate-600 dark:text-slate-400';
      }
    };
    
    const iconColor = getIconColor();
    
    // Escolher ícone baseado no tipo e criticidade
    switch (insight.type) {
      case 'participation_excellence':
        return <CheckCircle className={`h-8 w-8 ${iconColor}`} />;
      case 'participation_decline':
      case 'engagement_pattern':
        if (insight.trend === 'down' || insight.trend === 'critical') {
          return <TrendingDown className={`h-8 w-8 ${iconColor}`} />;
        }
        return <TrendingUp className={`h-8 w-8 ${iconColor}`} />;
      case 'growth_trend':
        if (insight.trend === 'down' || insight.trend === 'critical') {
          return <TrendingDown className={`h-8 w-8 ${iconColor}`} />;
        } else if (insight.trend === 'up') {
          return <TrendingUp className={`h-8 w-8 ${iconColor}`} />;
        }
        return <Activity className={`h-8 w-8 ${iconColor}`} />;
      case 'activity_peak':
        return <Zap className={`h-8 w-8 ${iconColor}`} />;
      case 'anomaly_detection':
        return <AlertTriangle className={`h-8 w-8 ${iconColor}`} />;
      case 'member_concentration':
      case 'leadership_emergence':
        return <Users className={`h-8 w-8 ${iconColor}`} />;
      case 'time_pattern':
        return <Clock className={`h-8 w-8 ${iconColor}`} />;
      case 'content_quality':
        return <MessageSquare className={`h-8 w-8 ${iconColor}`} />;
      default: 
        return <Activity className={`h-8 w-8 ${iconColor}`} />;
    }
  };

  // Verificar se há dados reais disponíveis
  const hasRealData = insight?.visualization?.data?.groupData;

  // Renderizar insight modular se houver dados reais
  const renderModularInsight = (insight: SmartInsight) => {
    if (!hasRealData || !insight.visualization?.data?.groupData) return null;

    const groupData = insight.visualization.data.groupData as GroupAnalysisData;

    switch (insight.type) {
      case 'participation_decline':
        return (
          <ParticipationDecline 
            insight={{
              id: insight.id,
              title: insight.title,
              priority: insight.priority,
              groupId: insight.groupId,
              groupName: insight.groupName,
              metadata: insight.metadata,
              trend: insight.trend as 'down' | 'critical',
              groupData
            }}
          />
        );
      
      case 'activity_peak':
        return (
          <ActivityPeak 
            insight={{
              id: insight.id,
              title: insight.title,
              priority: insight.priority,
              groupId: insight.groupId,
              groupName: insight.groupName,
              metadata: insight.metadata,
              trend: insight.trend as 'up' | 'warning',
              groupData
            }}
          />
        );
      
      default:
        return null;
    }
  };

  const getInsightSpecificDetails = (insight: SmartInsight) => {
    switch (insight.type) {
      case 'participation_decline':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">Análise de Declínio</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    A participação está em queda consistente. Isso pode indicar:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1 list-disc list-inside">
                    <li>Conteúdo não está ressoando com os membros</li>
                    <li>Horários de postagem não são ideais</li>
                    <li>Falta de moderação ou engajamento dos administradores</li>
                    <li>Competição com outras plataformas ou grupos</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {typeof insight.value === 'number' ? `${insight.value}%` : insight.value}
                </div>
                <div className="text-xs text-muted-foreground">Declínio registrado</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold">{insight.metadata.confidence}%</div>
                <div className="text-xs text-muted-foreground">Confiança na análise</div>
              </div>
            </div>
          </div>
        );

      case 'growth_trend':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Tendência de Crescimento</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    O grupo está apresentando sinais positivos de crescimento:
                  </p>
                  <ul className="text-sm text-emerald-700 dark:text-emerald-300 mt-2 space-y-1 list-disc list-inside">
                    <li>Aumento no número de mensagens diárias</li>
                    <li>Maior engajamento dos membros existentes</li>
                    <li>Padrões de conversação mais frequentes</li>
                    <li>Potencial para expansão estratégica</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  +{typeof insight.value === 'number' ? `${insight.value}%` : insight.value}
                </div>
                <div className="text-xs text-muted-foreground">Crescimento identificado</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold">{insight.metadata.confidence}%</div>
                <div className="text-xs text-muted-foreground">Precisão da análise</div>
              </div>
            </div>
          </div>
        );

      case 'activity_peak':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Pico de Atividade Detectado</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Um período de alta atividade foi identificado. Fatores possíveis:
                  </p>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 mt-2 space-y-1 list-disc list-inside">
                    <li>Tópico viral ou de grande interesse</li>
                    <li>Evento ou data comemorativa</li>
                    <li>Participação de membro influente</li>
                    <li>Conteúdo estratégico bem executado</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value}
                </div>
                <div className="text-xs text-muted-foreground">Mensagens no pico</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold">{insight.metadata.dataPoints}</div>
                <div className="text-xs text-muted-foreground">Pontos de dados</div>
              </div>
            </div>
          </div>
        );

      case 'member_concentration':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-100">Concentração de Membros</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    A atividade está concentrada em poucos membros:
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1 list-disc list-inside">
                    <li>Risco de dependência de poucos usuários</li>
                    <li>Oportunidade para incentivar outros membros</li>
                    <li>Necessário diversificar engajamento</li>
                    <li>Considerar estratégias de ativação</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {typeof insight.value === 'number' ? `${insight.value}%` : insight.value}
                </div>
                <div className="text-xs text-muted-foreground">Concentração detectada</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold">{insight.metadata.confidence}%</div>
                <div className="text-xs text-muted-foreground">Confiança na métrica</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Detalhes da Análise</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta análise foi baseada em {insight.metadata.dataPoints} pontos de dados 
                    durante o período de {insight.metadata.period.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold">
                  {typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value}
                </div>
                <div className="text-xs text-muted-foreground">Valor principal</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-lg font-semibold">{insight.metadata.confidence}%</div>
                <div className="text-xs text-muted-foreground">Confiança</div>
              </div>
            </div>
          </div>
        );
    }
  };

  const getActionableSteps = (insight: SmartInsight): string[] => {
    switch (insight.type) {
      case 'participation_decline':
        return [
          'Analise o histórico recente para identificar mudanças no tipo de conteúdo',
          'Revise os horários de postagem e compare com períodos de maior atividade',
          'Considere uma pesquisa rápida com os membros mais ativos',
          'Implemente estratégias de reativação (enquetes, tópicos relevantes)',
          'Monitore a resposta às mudanças implementadas nos próximos 7 dias'
        ];
      
      case 'growth_trend':
        return [
          'Documente os fatores que contribuíram para o crescimento',
          'Considere expandir os tipos de conteúdo que estão funcionando',
          'Avalie a possibilidade de convidar novos membros qualificados',
          'Implemente estratégias para manter o momentum positivo',
          'Monitore se o crescimento é sustentável ou apenas temporário'
        ];
      
      case 'activity_peak':
        return [
          'Identifique exatamente quais fatores causaram o pico',
          'Analise o tipo de conteúdo que gerou maior engajamento',
          'Documente horários e padrões de maior atividade',
          'Considere replicar as estratégias bem-sucedidas',
          'Use o momento de alta atividade para introduzir novos tópicos'
        ];
      
      case 'member_concentration':
        return [
          'Identifique membros menos ativos e desenvolva estratégias de engajamento',
          'Crie conteúdo que incentive participação mais ampla',
          'Considere mencionar ou perguntar diretamente a membros específicos',
          'Implemente dinâmicas que requeiram participação diversificada',
          'Monitore se as ações resultam em maior distribuição da atividade'
        ];
      
      default:
        return [
          'Monitore as métricas relacionadas nos próximos dias',
          'Considere ajustar estratégias baseado nos dados apresentados',
          'Documente padrões identificados para análises futuras',
          'Implemente mudanças graduais baseadas nas recomendações',
          'Acompanhe o impacto das ações tomadas'
        ];
    }
  };

  // Se não há insight, não renderizar nada
  if (!insight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 z-50">
        {/* Se há dados reais, renderizar apenas o componente modular */}
        {hasRealData ? (
          <>
            {/* DialogTitle oculto para acessibilidade */}
            <DialogHeader className="sr-only">
              <DialogTitle>{insight.title}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              {renderModularInsight(insight)}
            </div>
          </>
        ) : (
          // Renderizar o sistema clássico se não há dados reais
          <>
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getInsightIcon(insight)}
                  <div>
                    <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      {insight.title}
                    </DialogTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge 
                        variant={
                          insight.priority === 'critical' ? 'destructive' :
                          insight.priority === 'high' ? 'default' :
                          insight.priority === 'medium' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {insight.priority === 'critical' ? 'Crítico' :
                         insight.priority === 'high' ? 'Alto' :
                         insight.priority === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                      
                      <Badge 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-muted"
                        onClick={() => router.push(`/groups/${insight.groupId}`)}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        {insight.groupName}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {insight.metadata.period}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {insight.metadata.confidence}% confiança • {insight.metadata.dataPoints} pontos de dados
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 pb-6">
              <div className="space-y-6">
                {/* Descrição Principal */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {/* Detalhes específicos do insight */}
                {getInsightSpecificDetails(insight)}

                {/* Recomendações */}
                {insight.recommendation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Target className="mr-2 h-5 w-5 text-blue-500" />
                        Recomendações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-800 dark:text-slate-200 mb-4">
                        {insight.recommendation}
                      </p>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200">Próximos passos:</h4>
                        {getActionableSteps(insight).map((step, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm text-slate-800 dark:text-slate-200">{step}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botão de ação */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Fechar
                  </Button>
                  <Button onClick={() => router.push(`/groups/${insight.groupId}`)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver Grupo
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 