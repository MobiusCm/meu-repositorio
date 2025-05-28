'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Database,
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  Activity,
  Calculator,
  Eye,
  BarChart3,
  Info,
  Zap,
  Plus
} from 'lucide-react';

// Dados simulados realistas para demonstração
const SAMPLE_DATA = {
  // Dados básicos do grupo
  total_messages: 1547,
  active_members: 28,
  member_count: 45,
  total_words: 23847,
  total_media: 312,
  
  // Dados de períodos anteriores para comparação
  prev_total_messages: 1320,
  prev_active_members: 25,
  prev_total_words: 19200,
  
  // Dados temporais
  morning_activity: 187,
  afternoon_activity: 423,
  evening_activity: 612,
  night_activity: 325,
  weekend_activity: 485,
  weekday_activity: 1062,
  
  // Dados de qualidade
  avg_message_length: 15.4,
  media_ratio: 0.202,
  response_rate: 0.72,
  conversation_depth: 3.2,
  
  // Dados de distribuição
  top3_members_messages: 623,
  top20_percent_activity: 0.68,
  participation_diversity_index: 0.75,
  
  // Dados avançados
  peak_activity_ratio: 2.8,
  peak_duration_hours: 3.5,
  consistency_score: 0.82,
  anomaly_score: 0.15
};

// Definição completa das variáveis com cálculos e exemplos
const VARIABLE_CATEGORIES = [
  {
    category: 'Básicas',
    icon: Database,
    color: 'blue',
    description: 'Métricas fundamentais de atividade do grupo',
    variables: [
      {
        name: 'total_messages',
        description: 'Total de mensagens no período',
        type: 'number',
        example: SAMPLE_DATA.total_messages,
        calculation: 'Contagem direta de todas as mensagens',
        useCase: 'Volume geral de atividade'
      },
      {
        name: 'active_members',
        description: 'Membros que enviaram ao menos 1 mensagem',
        type: 'number',
        example: SAMPLE_DATA.active_members,
        calculation: 'COUNT(DISTINCT sender) WHERE message_count > 0',
        useCase: 'Engajamento de participação'
      },
      {
        name: 'member_count',
        description: 'Total de membros no grupo',
        type: 'number',
        example: SAMPLE_DATA.member_count,
        calculation: 'Contagem total de membros registrados',
        useCase: 'Tamanho do grupo'
      },
      {
        name: 'avg_messages_day',
        description: 'Média de mensagens por dia',
        type: 'number',
        example: Math.round(SAMPLE_DATA.total_messages / 7 * 100) / 100,
        calculation: 'total_messages / dias_no_periodo',
        useCase: 'Consistência de atividade diária'
      },
      {
        name: 'avg_messages_member',
        description: 'Média de mensagens por membro ativo',
        type: 'number',
        example: Math.round(SAMPLE_DATA.total_messages / SAMPLE_DATA.active_members * 100) / 100,
        calculation: 'total_messages / active_members',
        useCase: 'Intensidade de participação individual'
      },
      {
        name: 'participation_rate',
        description: 'Taxa de participação (%)',
        type: 'percentage',
        example: Math.round((SAMPLE_DATA.active_members / SAMPLE_DATA.member_count) * 100),
        calculation: '(active_members / member_count) * 100',
        useCase: 'Porcentagem de membros ativos'
      }
    ]
  },
  {
    category: 'Crescimento',
    icon: TrendingUp,
    color: 'green',
    description: 'Métricas de crescimento e comparação temporal',
    variables: [
      {
        name: 'message_growth_rate',
        description: 'Taxa de crescimento de mensagens (%)',
        type: 'percentage',
        example: Math.round(((SAMPLE_DATA.total_messages - SAMPLE_DATA.prev_total_messages) / SAMPLE_DATA.prev_total_messages) * 100),
        calculation: '((current_messages - prev_messages) / prev_messages) * 100',
        useCase: 'Tendência de atividade do grupo'
      },
      {
        name: 'member_growth_rate',
        description: 'Taxa de crescimento de membros ativos (%)',
        type: 'percentage',
        example: Math.round(((SAMPLE_DATA.active_members - SAMPLE_DATA.prev_active_members) / SAMPLE_DATA.prev_active_members) * 100),
        calculation: '((current_active - prev_active) / prev_active) * 100',
        useCase: 'Crescimento do engajamento'
      },
      {
        name: 'prev_total_messages',
        description: 'Total de mensagens do período anterior',
        type: 'number',
        example: SAMPLE_DATA.prev_total_messages,
        calculation: 'Dados do período anterior para comparação',
        useCase: 'Base para cálculos de crescimento'
      },
      {
        name: 'prev_active_members',
        description: 'Membros ativos do período anterior',
        type: 'number',
        example: SAMPLE_DATA.prev_active_members,
        calculation: 'Dados do período anterior para comparação',
        useCase: 'Base para análise de retenção'
      }
    ]
  },
  {
    category: 'Qualidade',
    icon: MessageSquare,
    color: 'purple',
    description: 'Métricas de qualidade e profundidade das conversas',
    variables: [
      {
        name: 'avg_message_length',
        description: 'Comprimento médio das mensagens (caracteres)',
        type: 'number',
        example: SAMPLE_DATA.avg_message_length,
        calculation: 'SUM(LENGTH(message)) / COUNT(message)',
        useCase: 'Profundidade das conversas'
      },
      {
        name: 'media_ratio',
        description: 'Proporção de mensagens com mídia',
        type: 'percentage',
        example: SAMPLE_DATA.media_ratio,
        calculation: 'messages_with_media / total_messages',
        useCase: 'Riqueza do conteúdo compartilhado'
      },
      {
        name: 'response_rate',
        description: 'Taxa de resposta entre membros',
        type: 'percentage',
        example: SAMPLE_DATA.response_rate,
        calculation: 'messages_in_conversation / total_messages',
        useCase: 'Interatividade do grupo'
      },
      {
        name: 'conversation_depth',
        description: 'Profundidade média das conversas',
        type: 'number',
        example: SAMPLE_DATA.conversation_depth,
        calculation: 'Média de mensagens por thread de conversa',
        useCase: 'Qualidade das discussões'
      }
    ]
  },
  {
    category: 'Distribuição',
    icon: Users,
    color: 'orange',
    description: 'Análise de distribuição de atividade entre membros',
    variables: [
      {
        name: 'concentration_index',
        description: 'Índice de concentração de atividade (0-1)',
        type: 'number',
        example: Math.round((SAMPLE_DATA.top3_members_messages / SAMPLE_DATA.total_messages) * 100) / 100,
        calculation: 'top_members_activity / total_activity',
        useCase: 'Concentração vs distribuição'
      },
      {
        name: 'top3_members_messages',
        description: 'Mensagens dos 3 membros mais ativos',
        type: 'number',
        example: SAMPLE_DATA.top3_members_messages,
        calculation: 'SUM(messages) dos top 3 membros',
        useCase: 'Dominância de poucos membros'
      },
      {
        name: 'top20_percent_activity',
        description: 'Atividade dos 20% mais ativos',
        type: 'percentage',
        example: SAMPLE_DATA.top20_percent_activity,
        calculation: 'Atividade do quintil superior',
        useCase: 'Regra de Pareto no engajamento'
      },
      {
        name: 'participation_diversity_index',
        description: 'Índice de diversidade de participação (0-1)',
        type: 'number',
        example: SAMPLE_DATA.participation_diversity_index,
        calculation: 'Baseado no índice de Shannon',
        useCase: 'Equilíbrio de participação'
      }
    ]
  },
  {
    category: 'Temporal',
    icon: Clock,
    color: 'cyan',
    description: 'Padrões de atividade por horário e período',
    variables: [
      {
        name: 'morning_activity',
        description: 'Atividade manhã (6h-12h)',
        type: 'number',
        example: SAMPLE_DATA.morning_activity,
        calculation: 'COUNT(messages) WHERE hour BETWEEN 6 AND 11',
        useCase: 'Padrão matinal do grupo'
      },
      {
        name: 'afternoon_activity',
        description: 'Atividade tarde (12h-18h)',
        type: 'number',
        example: SAMPLE_DATA.afternoon_activity,
        calculation: 'COUNT(messages) WHERE hour BETWEEN 12 AND 17',
        useCase: 'Atividade vespertina'
      },
      {
        name: 'evening_activity',
        description: 'Atividade noite (18h-23h)',
        type: 'number',
        example: SAMPLE_DATA.evening_activity,
        calculation: 'COUNT(messages) WHERE hour BETWEEN 18 AND 22',
        useCase: 'Pico noturno de atividade'
      },
      {
        name: 'night_activity',
        description: 'Atividade madrugada (23h-6h)',
        type: 'number',
        example: SAMPLE_DATA.night_activity,
        calculation: 'COUNT(messages) WHERE hour BETWEEN 23 OR hour < 6',
        useCase: 'Atividade de madrugada'
      },
      {
        name: 'weekend_activity_ratio',
        description: 'Razão atividade fim de semana/semana',
        type: 'percentage',
        example: Math.round((SAMPLE_DATA.weekend_activity / SAMPLE_DATA.weekday_activity) * 100) / 100,
        calculation: 'weekend_messages / weekday_messages',
        useCase: 'Padrão semanal vs fim de semana'
      },
      {
        name: 'peak_activity_ratio',
        description: 'Razão entre pico e média',
        type: 'number',
        example: SAMPLE_DATA.peak_activity_ratio,
        calculation: 'max_hourly_activity / avg_hourly_activity',
        useCase: 'Intensidade dos picos'
      },
      {
        name: 'peak_duration_hours',
        description: 'Duração do pico em horas',
        type: 'number',
        example: SAMPLE_DATA.peak_duration_hours,
        calculation: 'Duração contínua acima da média',
        useCase: 'Sustentabilidade da alta atividade'
      }
    ]
  },
  {
    category: 'Avançadas',
    icon: Activity,
    color: 'red',
    description: 'Métricas avançadas e scores calculados por IA',
    variables: [
      {
        name: 'consistency_score',
        description: 'Score de consistência de atividade (0-1)',
        type: 'number',
        example: SAMPLE_DATA.consistency_score,
        calculation: '1 - (desvio_padrão / média)',
        useCase: 'Regularidade do grupo'
      },
      {
        name: 'anomaly_score',
        description: 'Score de detecção de anomalias (0-1)',
        type: 'number',
        example: SAMPLE_DATA.anomaly_score,
        calculation: 'Algoritmo de detecção de outliers',
        useCase: 'Eventos anômalos ou spam'
      },
      {
        name: 'engagement_velocity',
        description: 'Velocidade de engajamento',
        type: 'number',
        example: Math.round((SAMPLE_DATA.total_messages / SAMPLE_DATA.active_members / 7) * 100) / 100,
        calculation: 'messages_per_member_per_day',
        useCase: 'Intensidade individual de participação'
      },
      {
        name: 'retention_index',
        description: 'Índice de retenção de membros (0-1)',
        type: 'number',
        example: 0.86,
        calculation: 'membros_ativos_recorrentes / total_membros',
        useCase: 'Fidelidade dos membros'
      }
    ]
  }
];

interface DataAnalyzerProps {
  onSelectVariable?: (variable: string) => void;
}

export function DataAnalyzer({ onSelectVariable }: DataAnalyzerProps) {
  const [selectedCategory, setSelectedCategory] = useState('Básicas');
  const [selectedVariable, setSelectedVariable] = useState<any>(null);

  const currentCategory = VARIABLE_CATEGORIES.find(cat => cat.category === selectedCategory);

  const VariableDetailDialog = ({ variable }: { variable: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-3 w-3 mr-1" />
          Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {variable.name}
          </DialogTitle>
          <DialogDescription>{variable.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Valor Exemplo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {variable.type === 'percentage' ? `${variable.example}%` : variable.example}
                </div>
                <Badge variant="outline" className="mt-2">
                  {variable.type === 'number' ? 'Numérico' : 
                   variable.type === 'percentage' ? 'Percentual' : 'Texto'}
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {variable.calculation}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Caso de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {variable.useCase}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Exemplo de Fórmula</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Insight simples:</strong>
                </p>
                <code className="block p-2 bg-muted rounded text-xs">
                  {variable.name} {variable.type === 'percentage' ? '> 50' : `> ${Math.round(variable.example * 0.8)}`}
                </code>
                
                <p className="text-sm mt-3">
                  <strong>Insight combinado:</strong>
                </p>
                <code className="block p-2 bg-muted rounded text-xs">
                  {variable.name} {variable.type === 'percentage' ? '> 70' : `> ${Math.round(variable.example * 1.2)}`} && active_members {'> 20'}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Analisador de Dados</h2>
        <p className="text-muted-foreground">
          Explore todas as variáveis disponíveis e veja exemplos práticos de cálculo
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {VARIABLE_CATEGORIES.map(category => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={category.category} value={category.category} className="text-xs">
                <IconComponent className="h-3 w-3 mr-1" />
                {category.category}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {VARIABLE_CATEGORIES.map(category => (
          <TabsContent key={category.category} value={category.category}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  <CardTitle>{category.category}</CardTitle>
                  <Badge variant="outline">{category.variables.length} variáveis</Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {category.variables.map(variable => (
                    <Card key={variable.name} className="border-l-4" style={{ borderLeftColor: `var(--${category.color})` }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                {variable.name}
                              </code>
                              <Badge variant={
                                variable.type === 'percentage' ? 'default' : 
                                variable.type === 'number' ? 'secondary' : 'outline'
                              }>
                                {variable.type === 'percentage' ? '%' : 
                                 variable.type === 'number' ? '#' : 'T'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {variable.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <span>
                                <strong>Exemplo:</strong> {' '}
                                {variable.type === 'percentage' ? `${variable.example}%` : variable.example}
                              </span>
                              <span className="text-muted-foreground">
                                {variable.useCase}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <VariableDetailDialog variable={variable} />
                            <Button 
                              size="sm" 
                              onClick={() => onSelectVariable?.(variable.name)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Usar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Resumo estatístico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas do Dataset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-blue-600">
                {VARIABLE_CATEGORIES.reduce((sum, cat) => sum + cat.variables.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total de Variáveis</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-green-600">
                {VARIABLE_CATEGORIES.length}
              </div>
              <div className="text-sm text-muted-foreground">Categorias</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-purple-600">
                {SAMPLE_DATA.total_messages.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Mensagens Exemplo</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-orange-600">
                {SAMPLE_DATA.active_members}
              </div>
              <div className="text-sm text-muted-foreground">Membros Ativos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 