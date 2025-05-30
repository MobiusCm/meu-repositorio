"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Star,
  Eye,
  EyeOff,
  Settings,
  Download,
  Calendar,
  Hash,
  Activity,
  Zap,
  Target,
  Timer,
  Sparkles
} from 'lucide-react';
import { ReportOptions, ReportTemplate, PreviewSection } from '@/lib/reports/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface RealTimePreviewProps {
  template: ReportTemplate;
  options: ReportOptions;
  onOptionsChange: (options: ReportOptions) => void;
  groupName: string;
  period: string;
  stats: any;
}

export function RealTimePreview({ 
  template, 
  options, 
  onOptionsChange, 
  groupName, 
  period, 
  stats 
}: RealTimePreviewProps) {

  // Função para alternar seção
  const toggleSection = (sectionKey: keyof ReportOptions) => {
    onOptionsChange({
      ...options,
      [sectionKey]: !options[sectionKey]
    });
  };

  // Dados de exemplo para preview
  const previewData = {
    totalMessages: stats?.total_messages || 1250,
    activeMembers: stats?.active_members || 45,
    averageDaily: Math.round((stats?.total_messages || 1250) / 30),
    engagementRate: '74%',
    peakHour: '14:00',
    topMember: stats?.member_ranking?.[0]?.name || 'João Silva',
    growthRate: '+12%'
  };

  // Configuração das seções disponíveis
  const sections = [
    {
      id: 'generalStats',
      key: 'includeGeneralStats' as keyof ReportOptions,
      title: 'Estatísticas Gerais',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      enabled: options.includeGeneralStats,
      required: true,
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{previewData.totalMessages.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total de mensagens</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{previewData.activeMembers}</div>
            <div className="text-sm text-gray-600">Membros ativos</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{previewData.averageDaily}</div>
            <div className="text-sm text-gray-600">Média diária</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">{previewData.growthRate}</div>
            <div className="text-sm text-gray-600">Crescimento</div>
          </div>
        </div>
      )
    },
    {
      id: 'dailyActivity',
      key: 'includeDailyActivity' as keyof ReportOptions,
      title: 'Atividade Diária',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      enabled: options.includeDailyActivity,
      content: (
        <div className="space-y-4">
          <div className="h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-end justify-between p-4">
            {[65, 45, 80, 55, 90, 35, 70].map((height, i) => (
              <div 
                key={i} 
                className="bg-green-500 rounded-sm w-6" 
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">Últimos 7 dias de atividade</div>
        </div>
      )
    },
    {
      id: 'memberRanking',
      key: 'includeMemberRanking' as keyof ReportOptions,
      title: 'Ranking de Membros',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      enabled: options.includeMemberRanking,
      content: (
        <div className="space-y-3">
          {[
            { name: previewData.topMember, messages: 124, position: 1 },
            { name: 'Maria Santos', messages: 98, position: 2 },
            { name: 'Carlos Oliveira', messages: 76, position: 3 }
          ].map((member) => (
            <div key={member.position} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
                  {member.position}
                </div>
                <span className="font-medium">{member.name}</span>
              </div>
              <Badge variant="secondary">{member.messages} msgs</Badge>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'hourlyActivity',
      key: 'includeHourlyActivity' as keyof ReportOptions,
      title: 'Atividade por Hora',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      enabled: options.includeHourlyActivity,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Horário de pico</span>
            <Badge variant="outline" className="text-orange-600">{previewData.peakHour}</Badge>
          </div>
          <div className="h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg flex items-end justify-between p-2">
            {Array.from({ length: 24 }, (_, i) => {
              const height = i === 14 ? 90 : Math.random() * 60 + 20;
              return (
                <div 
                  key={i} 
                  className={`rounded-sm w-1 ${i === 14 ? 'bg-orange-600' : 'bg-orange-400'}`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      )
    },
    {
      id: 'insights',
      key: 'includeInsights' as keyof ReportOptions,
      title: 'Insights Principais',
      icon: Sparkles,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      enabled: options.includeInsights,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-pink-50 rounded-lg border-l-4 border-pink-400">
            <div className="text-sm font-medium text-pink-800">📈 Crescimento Acelerado</div>
            <div className="text-xs text-pink-600">Atividade aumentou 12% na última semana</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="text-sm font-medium text-blue-800">⏰ Horário Otimizado</div>
            <div className="text-xs text-blue-600">Melhor engajamento entre 14h-16h</div>
          </div>
        </div>
      )
    },
    {
      id: 'engagementAnalysis',
      key: 'includeEngagementAnalysis' as keyof ReportOptions,
      title: 'Análise de Engajamento',
      icon: Target,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      enabled: options.includeEngagementAnalysis,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Taxa de Engajamento</span>
            <span className="text-lg font-bold text-teal-600">{previewData.engagementRate}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: '74%' }}></div>
          </div>
          <div className="text-xs text-gray-500">Alto nível de interação entre membros</div>
        </div>
      )
    },
    {
      id: 'trendAnalysis',
      key: 'includeTrendAnalysis' as keyof ReportOptions,
      title: 'Análise de Tendências',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      enabled: options.includeTrendAnalysis,
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Tendência Positiva</span>
          </div>
          <div className="text-xs text-gray-600">
            Crescimento consistente nos últimos 30 dias com projeção de continuidade
          </div>
        </div>
      )
    },
    {
      id: 'mediaAnalysis',
      key: 'includeMediaAnalysis' as keyof ReportOptions,
      title: 'Análise de Mídia',
      icon: Hash,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      enabled: options.includeMediaAnalysis,
      content: (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-red-600">89</div>
            <div className="text-xs text-gray-600">Imagens</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">23</div>
            <div className="text-xs text-gray-600">Vídeos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">156</div>
            <div className="text-xs text-gray-600">Stickers</div>
          </div>
        </div>
      )
    }
  ];

  const enabledSections = sections.filter(section => section.enabled);
  const availableSections = sections.filter(section => !section.enabled);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Painel de Configuração de Seções */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurar Seções</h3>
          
          {/* Seções Ativas */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Seções Incluídas ({enabledSections.length})
            </h4>
            
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {enabledSections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${section.bgColor}`}>
                        <section.icon className={`w-4 h-4 ${section.color}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{section.title}</div>
                        {section.required && (
                          <Badge variant="secondary" className="text-xs">Obrigatória</Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={section.enabled}
                      onCheckedChange={() => !section.required && toggleSection(section.key)}
                      disabled={section.required}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Seções Disponíveis */}
          {availableSections.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <EyeOff className="w-4 h-4 mr-2" />
                Seções Disponíveis ({availableSections.length})
              </h4>
              
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {availableSections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${section.bgColor}`}>
                          <section.icon className={`w-4 h-4 ${section.color}`} />
                        </div>
                        <div className="text-sm font-medium text-gray-600">{section.title}</div>
                      </div>
                      <Switch
                        checked={section.enabled}
                        onCheckedChange={() => toggleSection(section.key)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Configurações Rápidas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Configurações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-charts" className="text-sm">Incluir Gráficos</Label>
              <Switch
                id="include-charts"
                checked={options.includeCharts}
                onCheckedChange={(checked) => 
                  onOptionsChange({ ...options, includeCharts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="detailed-metrics" className="text-sm">Métricas Detalhadas</Label>
              <Switch
                id="detailed-metrics"
                checked={options.showDetailedMetrics}
                onCheckedChange={(checked) => 
                  onOptionsChange({ ...options, showDetailedMetrics: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-recommendations" className="text-sm">Recomendações</Label>
              <Switch
                id="include-recommendations"
                checked={options.includeRecommendations}
                onCheckedChange={(checked) => 
                  onOptionsChange({ ...options, includeRecommendations: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview em Tempo Real */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Preview do Relatório</h3>
          <Badge variant="outline" className="text-xs">
            <Timer className="w-3 h-3 mr-1" />
            Atualização em tempo real
          </Badge>
        </div>

        <Card className="border-2 border-dashed border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{groupName}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {period}
                </CardDescription>
              </div>
              <Badge variant="default">{template.charAt(0).toUpperCase() + template.slice(1)}</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <ScrollArea className="h-96">
              <div className="space-y-6">
                {enabledSections.map((section, index) => (
                  <div key={section.id}>
                    <Card className="shadow-sm border-l-4" style={{ borderLeftColor: section.color.replace('text-', '#') }}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <section.icon className={`w-4 h-4 mr-2 ${section.color}`} />
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {section.content}
                      </CardContent>
                    </Card>
                    {index < enabledSections.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}

                {enabledSections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma seção selecionada</p>
                    <p className="text-sm">Ative seções no painel à esquerda para ver o preview</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Informações do Preview */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>{enabledSections.length} seções</span>
                <span>•</span>
                <span>~{Math.max(2, enabledSections.length * 0.5).toFixed(1)} MB</span>
                <span>•</span>
                <span>~{Math.max(1, enabledSections.length * 0.3).toFixed(1)} min</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Preview Live
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 