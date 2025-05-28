'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  AlertCircle,
  Users,
  MessageSquare,
  Clock,
  Target,
  BarChart3,
  Zap,
  Globe,
  ChevronRight
} from 'lucide-react';
import { SmartInsight } from '@/lib/insights-engine';

interface SmartInsightCardProps {
  insight: SmartInsight;
  rank?: number;
  showGroupName?: boolean;
  compact?: boolean;
}

export function SmartInsightCard({ 
  insight, 
  rank, 
  showGroupName = true, 
  compact = false 
}: SmartInsightCardProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      case 'stable': return <Activity className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-600 dark:text-emerald-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      case 'stable': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'atividade': return <MessageSquare className="h-5 w-5" />;
      case 'crescimento': return <TrendingUp className="h-5 w-5" />;
      case 'engajamento': return <Users className="h-5 w-5" />;
      case 'distribuição': return <BarChart3 className="h-5 w-5" />;
      case 'temporal': return <Clock className="h-5 w-5" />;
      case 'qualidade': return <Target className="h-5 w-5" />;
      case 'saúde': return <Activity className="h-5 w-5" />;
      case 'anomalia': return <AlertTriangle className="h-5 w-5" />;
      case 'liderança': return <Users className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  const handleCardClick = () => {
    setShowDetails(true);
  };

  const handleGroupNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/groups/${insight.groupId}`);
  };

  const getCalculationFormula = () => {
    switch (insight.type) {
      case 'engagement_pattern':
        return 'Fórmula: (Intensidade de Mensagens × 60%) + (Score de Consistência × 40%)\n\nOnde:\n• Intensidade = (Msgs por Membro Único ÷ 10) × 100\n• Consistência = (Membros Ativos Médios ÷ Membros Únicos) × 100';
      
      case 'activity_peak':
        return 'Fórmula: ((Mensagens do Pico ÷ Média Diária) - 1) × 100\n\nIdentifica dias com atividade significativamente acima da média';
      
      case 'growth_trend':
        return 'Fórmula: ((Média Segunda Metade - Média Primeira Metade) ÷ Média Primeira Metade) × 100\n\nCompara atividade média entre duas metades do período';
      
      case 'member_concentration':
        return 'Fórmula: (Mensagens dos Top 3 ÷ Total de Mensagens) × 100\n\nMede concentração de atividade nos membros mais ativos';
      
      case 'time_pattern':
        return 'Fórmula: (Mensagens no Horário de Pico ÷ Total de Mensagens) × 100\n\nIdentifica concentração temporal de atividade';
      
      case 'content_quality':
        return 'Fórmula: Total de Palavras ÷ Mensagens de Texto\n\nExclui mensagens de mídia do cálculo';
      
      case 'group_health':
        return 'Fórmula: Score de Consistência + Frequência de Atividade\n\nBaseado na variação das mensagens por dia e dias com atividade';
      
      case 'anomaly_detection':
        return 'Fórmula: |Mensagens do Dia - Média| > 2 × Desvio Padrão\n\nDetecta dias com atividade estatisticamente anômala';
      
      case 'leadership_emergence':
        return 'Fórmula: ((Líder - Segundo Lugar) ÷ Segundo Lugar) × 100\n\nMede a diferença de atividade entre os membros mais ativos';
      
      default:
        return 'Fórmula baseada em análise estatística dos dados de atividade do grupo';
    }
  };

  const getInsightExplanation = () => {
    switch (insight.type) {
      case 'participation_excellence':
        return "Este insight analisa a taxa de participação dos membros no grupo. Uma alta participação indica um grupo saudável e engajado.";
      case 'participation_decline':
        return "Identifica quando a participação está abaixo do ideal. Baixa participação pode indicar problemas de engajamento ou conteúdo.";
      case 'activity_peak':
        return "Detecta dias com atividade excepcionalmente alta. Útil para identificar gatilhos de engajamento que podem ser replicados.";
      case 'growth_trend':
        return "Analisa tendências de crescimento ou declínio na atividade do grupo ao longo do tempo.";
      case 'engagement_pattern':
        return "Examina padrões de engajamento individual, como quantas mensagens cada membro ativo envia em média.";
      case 'member_concentration':
        return "Identifica se a atividade está muito concentrada em poucos membros, o que pode indicar necessidade de diversificar a participação.";
      case 'time_pattern':
        return "Analisa os horários de maior atividade para otimizar o timing de postagens importantes.";
      case 'content_quality':
        return "Avalia a qualidade das conversas baseado no comprimento médio das mensagens e uso de mídia.";
      case 'group_health':
        return "Calcula um score geral de saúde do grupo baseado em consistência, participação e atividade.";
      case 'anomaly_detection':
        return "Detecta atividades anômalas que fogem do padrão normal, ajudando a identificar eventos especiais ou problemas.";
      case 'leadership_emergence':
        return "Identifica membros que se destacam como líderes naturais baseado em sua atividade e engajamento.";
      default:
        return "Este insight fornece informações valiosas sobre o comportamento e padrões do seu grupo.";
    }
  };

  const getActionableSteps = () => {
    switch (insight.type) {
      case 'participation_excellence':
        return [
          "Continue as estratégias atuais de engajamento",
          "Considere expandir o grupo mantendo a qualidade",
          "Documente as práticas que funcionam bem",
          "Use este grupo como modelo para outros"
        ];
      case 'participation_decline':
        return [
          "Revise o tipo de conteúdo compartilhado",
          "Implemente estratégias de ativação de membros",
          "Considere enquetes e perguntas diretas",
          "Analise horários de postagem",
          "Remova membros inativos se necessário"
        ];
      case 'activity_peak':
        return [
          "Analise o que causou este pico de atividade",
          "Identifique o tipo de conteúdo ou evento",
          "Tente replicar as condições que geraram o pico",
          "Documente a estratégia para uso futuro"
        ];
      case 'growth_trend':
        return insight.trend === 'up' ? [
          "Identifique os fatores que causaram o crescimento",
          "Mantenha as estratégias que estão funcionando",
          "Considere escalar as táticas bem-sucedidas",
          "Monitore para garantir sustentabilidade"
        ] : [
          "Investigue as causas do declínio",
          "Revise a estratégia de conteúdo",
          "Implemente ações corretivas urgentes",
          "Considere pesquisa com membros para feedback"
        ];
      case 'member_concentration':
        return [
          "Incentive participação de membros menos ativos",
          "Faça perguntas diretas para diferentes membros",
          "Crie tópicos que interessem a diversos perfis",
          "Considere rotacionar moderadores"
        ];
      case 'time_pattern':
        return [
          "Programe conteúdo importante para o horário de pico",
          "Ajuste horários de postagens administrativas",
          "Considere fusos horários dos membros",
          "Use este padrão para maximizar alcance"
        ];
      default:
        return [
          "Monitore este indicador regularmente",
          "Implemente ações baseadas nos dados",
          "Documente mudanças e resultados",
          "Ajuste estratégias conforme necessário"
        ];
    }
  };

  if (compact) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card 
                className="group cursor-pointer hover:shadow-lg hover:shadow-black/5 transition-all duration-300 border-0 bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:scale-[1.02]"
                onClick={handleCardClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header com título e selo do grupo */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                          {insight.title}
                        </h3>
                        {showGroupName && (
                          <Badge 
                            variant="secondary" 
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0 text-xs px-2 py-1 font-medium whitespace-nowrap"
                            onClick={handleGroupNavigation}
                          >
                            {insight.groupName}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Descrição */}
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {insight.description}
                      </p>
                      
                      {/* Valor principal */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${getTrendColor(insight.trend)}`}>
                          {getTrendIcon(insight.trend)}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {typeof insight.value === 'string' ? insight.value : insight.value.toLocaleString('pt-BR')}
                          </span>
                          {insight.change !== undefined && (
                            <span className={`text-sm font-medium ${getTrendColor(insight.trend)}`}>
                              {insight.change > 0 ? '+' : ''}{insight.change}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Ícone da categoria */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(insight.metadata.category)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">Como é calculado</p>
                <p className="text-xs whitespace-pre-line">{getCalculationFormula()}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl border-0 bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${getTrendColor(insight.trend)}`}>
                  {getCategoryIcon(insight.metadata.category)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    {insight.title}
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {insight.groupName}
                    </Badge>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Valor principal detalhado */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Valor Principal</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {typeof insight.value === 'string' ? insight.value : insight.value.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {insight.change !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Variação</p>
                      <p className={`text-3xl font-bold ${getTrendColor(insight.trend)}`}>
                        {insight.change > 0 ? '+' : ''}{insight.change}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Análise detalhada */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Análise Detalhada</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {getInsightExplanation()}
                </p>
              </div>

              {/* Como é calculado */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Como é Calculado</h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
                    {getCalculationFormula()}
                  </pre>
                </div>
              </div>

              {/* Recomendações */}
              {insight.actionable && insight.recommendation && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Recomendação Estratégica</h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Próximos passos */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Próximos Passos</h4>
                <ul className="space-y-2">
                  {getActionableSteps().map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ações */}
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button 
                  variant="outline" 
                  onClick={handleGroupNavigation}
                  className="border-slate-200 dark:border-slate-700"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Ver Grupo
                </Button>
                <Button 
                  onClick={() => setShowDetails(false)}
                  className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Versão não-compact (para uso em outras páginas)
  return (
    <Card className="group cursor-pointer hover:shadow-lg hover:shadow-black/5 transition-all duration-300 border-0 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
      <CardContent className="p-6" onClick={handleCardClick}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                {insight.title}
              </h3>
              {showGroupName && (
                <Badge 
                  variant="secondary" 
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0 px-3 py-1 font-medium"
                  onClick={handleGroupNavigation}
                >
                  {insight.groupName}
                </Badge>
              )}
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {insight.description}
            </p>
            
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${getTrendColor(insight.trend)}`}>
                {getTrendIcon(insight.trend)}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {typeof insight.value === 'string' ? insight.value : insight.value.toLocaleString('pt-BR')}
                </span>
                {insight.change !== undefined && (
                  <span className={`text-lg font-medium ${getTrendColor(insight.trend)}`}>
                    {insight.change > 0 ? '+' : ''}{insight.change}%
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300">
            {getCategoryIcon(insight.metadata.category)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 