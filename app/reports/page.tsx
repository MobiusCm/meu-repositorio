"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, Search, Download, FileText, Users, BarChart3, Target, TrendingUp, Brain, GitCompare, Loader2, Check, ChevronLeft, ChevronRight, Eye, Settings, Plus, Sparkles } from 'lucide-react';
import { getStats } from '@/lib/analysis';
import { ReportSystem, ReportOptions, ReportTemplate, ReportFormat, getTemplateById, TEMPLATE_REGISTRY } from '@/lib/reports';
import { RealTimePreview } from '@/components/reports/real-time-preview';
import { Database } from '@/lib/supabase/schema';
import { createClient } from '@/lib/supabase/client';

type Group = Database['public']['Tables']['groups']['Row'];

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
}

interface ReportModalState {
  isOpen: boolean;
  currentStep: number;
  selectedGroup: Group | null;
  selectedPeriod: {
    option: 'all' | '7days' | '15days' | '30days' | '60days' | '90days' | 'custom';
    customRange?: DateRange;
  };
  selectedTemplate: ReportTemplate;
  selectedFormat: ReportFormat;
  reportOptions: ReportOptions;
  isGenerating: boolean;
  stats?: any;
}

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo o período', description: 'Desde o início do grupo' },
  { value: '7days', label: 'Últimos 7 dias', description: 'Uma semana de dados' },
  { value: '15days', label: 'Últimos 15 dias', description: 'Quinze dias de dados' },
  { value: '30days', label: 'Últimos 30 dias', description: 'Um mês de dados' },
  { value: '60days', label: 'Últimos 60 dias', description: 'Dois meses de dados' },
  { value: '90days', label: 'Últimos 90 dias', description: 'Três meses de dados' },
  { value: 'custom', label: 'Período personalizado', description: 'Selecione datas específicas' }
];

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV', description: 'Dados estruturados para análise', icon: FileText, color: 'text-emerald-600' },
  { value: 'pdf', label: 'PDF', description: 'Relatório formatado para impressão', icon: FileText, color: 'text-blue-600' },
  { value: 'png', label: 'PNG', description: 'Imagem do relatório', icon: FileText, color: 'text-purple-600' }
];

// Função auxiliar para criar opções completas de relatório
const createCompleteReportOptions = (template: ReportTemplate): ReportOptions => {
  const templateConfig = getTemplateById(template);
  const defaultOptions = templateConfig.defaultOptions;
  
  return {
    includeGeneralStats: defaultOptions.includeGeneralStats ?? true,
    includeDailyActivity: defaultOptions.includeDailyActivity ?? false,
    includeMemberRanking: defaultOptions.includeMemberRanking ?? true,
    includeHourlyActivity: defaultOptions.includeHourlyActivity ?? false,
    includeInsights: defaultOptions.includeInsights ?? true,
    includeActivityPatterns: defaultOptions.includeActivityPatterns ?? false,
    includeEngagementAnalysis: defaultOptions.includeEngagementAnalysis ?? true,
    includeTimeDistribution: defaultOptions.includeTimeDistribution ?? false,
    includeWordStatistics: defaultOptions.includeWordStatistics ?? true,
    includeMediaAnalysis: defaultOptions.includeMediaAnalysis ?? true,
    includePeakHours: defaultOptions.includePeakHours ?? false,
    includeConsistencyAnalysis: defaultOptions.includeConsistencyAnalysis ?? false,
    includeMemberEvolution: defaultOptions.includeMemberEvolution ?? true,
    includeTrendAnalysis: defaultOptions.includeTrendAnalysis ?? false,
    includeParticipationDecline: defaultOptions.includeParticipationDecline ?? false,
    includeParticipationTrends: defaultOptions.includeParticipationTrends ?? true,
    includeMemberGrowth: defaultOptions.includeMemberGrowth ?? true,
    includeEngagementRates: defaultOptions.includeEngagementRates ?? true,
    includeBehaviorPatterns: defaultOptions.includeBehaviorPatterns ?? false,
    includeActivityPeaks: defaultOptions.includeActivityPeaks ?? false,
    includeMemberConcentration: defaultOptions.includeMemberConcentration ?? true,
    includeLeadershipEmergence: defaultOptions.includeLeadershipEmergence ?? false,
    includeInfluencerAnalysis: defaultOptions.includeInfluencerAnalysis ?? true,
    includeSeasonalPatterns: defaultOptions.includeSeasonalPatterns ?? false,
    includeWeekdayWeekendComparison: defaultOptions.includeWeekdayWeekendComparison ?? false,
    includeTimeZoneAnalysis: defaultOptions.includeTimeZoneAnalysis ?? false,
    includePeakActivityAnalysis: defaultOptions.includePeakActivityAnalysis ?? false,
    includeContentQuality: defaultOptions.includeContentQuality ?? false,
    includeTopicDistribution: defaultOptions.includeTopicDistribution ?? false,
    includeMediaPatterns: defaultOptions.includeMediaPatterns ?? true,
    includeResponseAnalysis: defaultOptions.includeResponseAnalysis ?? false,
    includeConversationDepth: defaultOptions.includeConversationDepth ?? false,
    includePeriodComparison: defaultOptions.includePeriodComparison ?? false,
    includeBenchmarkAnalysis: defaultOptions.includeBenchmarkAnalysis ?? false,
    includeGrowthProjections: defaultOptions.includeGrowthProjections ?? false,
    includeAnomalyDetection: defaultOptions.includeAnomalyDetection ?? false,
    includeNetworkAnalysis: defaultOptions.includeNetworkAnalysis ?? false,
    includeCommunityDetection: defaultOptions.includeCommunityDetection ?? false,
    includeInfluenceMapping: defaultOptions.includeInfluenceMapping ?? false,
    includeMentionAnalysis: defaultOptions.includeMentionAnalysis ?? false,
    maxMembersInRanking: defaultOptions.maxMembersInRanking ?? 20,
    colorTheme: defaultOptions.colorTheme ?? 'blue',
    rankingDisplay: defaultOptions.rankingDisplay ?? 'table',
    showMemberStats: defaultOptions.showMemberStats ?? true,
    showActivityTrends: defaultOptions.showActivityTrends ?? true,
    showDetailedMetrics: defaultOptions.showDetailedMetrics ?? true,
    includeCharts: defaultOptions.includeCharts ?? true,
    includePredictions: defaultOptions.includePredictions ?? false,
    reportStyle: defaultOptions.reportStyle ?? 'standard',
    chartStyle: defaultOptions.chartStyle ?? 'modern',
    showGridLines: defaultOptions.showGridLines ?? true,
    showDataLabels: defaultOptions.showDataLabels ?? true,
    useGradients: defaultOptions.useGradients ?? true,
    animatedCharts: defaultOptions.animatedCharts ?? false,
    enablePeriodComparison: defaultOptions.enablePeriodComparison ?? false,
    comparisonPeriods: defaultOptions.comparisonPeriods ?? [],
    baselineCalculation: defaultOptions.baselineCalculation ?? 'average',
    insightDepth: defaultOptions.insightDepth ?? 'basic',
    includeRecommendations: defaultOptions.includeRecommendations ?? true,
    includeActionItems: defaultOptions.includeActionItems ?? true,
    includeRiskAssessment: defaultOptions.includeRiskAssessment ?? false,
    memberDisplayMode: defaultOptions.memberDisplayMode ?? 'ranking',
    includeMemberInsights: defaultOptions.includeMemberInsights ?? true,
    showMemberActivity: defaultOptions.showMemberActivity ?? true,
    showMemberComparison: defaultOptions.showMemberComparison ?? true,
    includeMemberProfiles: defaultOptions.includeMemberProfiles ?? true,
    showMemberNetworks: defaultOptions.showMemberNetworks ?? false,
    includeMemberJourney: defaultOptions.includeMemberJourney ?? true,
    includeRawData: defaultOptions.includeRawData ?? false,
    includeMetadata: defaultOptions.includeMetadata ?? true,
    includeDataDictionary: defaultOptions.includeDataDictionary ?? false,
    watermark: defaultOptions.watermark ?? true,
    logoInclude: defaultOptions.logoInclude ?? true
  };
};

export default function ReportsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<ReportModalState>({
    isOpen: false,
    currentStep: 1,
    selectedGroup: null,
    selectedPeriod: { option: '30days' },
    selectedTemplate: 'complete',
    selectedFormat: 'pdf',
    reportOptions: createCompleteReportOptions('complete'),
    isGenerating: false
  });

  // Debug: Adicionar log do estado dos grupos
  useEffect(() => {
    console.log('Estado dos grupos atualizado:', {
      groupsCount: groups.length,
      groupsLoading,
      groups: groups.map(g => ({ id: g.id, name: g.name, member_count: g.member_count }))
    });
  }, [groups, groupsLoading]);

  // Buscar grupos do usuário
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setGroupsLoading(true);
        const supabase = createClient();
        
        // Verificar se o usuário está autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Erro de autenticação:', authError);
          throw new Error('Erro de autenticação');
        }
        
        if (!user) {
          console.log('Usuário não autenticado');
          setGroups([]);
          return;
        }

        console.log('Buscando grupos para usuário:', user.id);

        // SEGURANÇA: Buscar apenas grupos do usuário autenticado
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Erro ao buscar grupos:', error);
          throw error;
        }
        
        console.log('Grupos encontrados:', data?.length || 0, data);
        setGroups(data || []);
      } catch (err) {
        console.error('Erro ao buscar grupos:', err);
        setGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Filtrar grupos por busca
  const filteredGroups = groups.filter((group: Group) => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Log do filtro
  useEffect(() => {
    console.log('Grupos filtrados:', {
      searchTerm,
      filteredCount: filteredGroups.length,
      totalCount: groups.length
    });
  }, [searchTerm, filteredGroups.length, groups.length]);

  // Calcular datas do período
  const calculatePeriodDates = (option: string, customRange?: DateRange) => {
    const endDate = new Date();
    let startDate: Date;

    switch (option) {
      case '7days':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '15days':
        startDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60days':
        startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (customRange?.from && customRange?.to) {
          return { startDate: customRange.from, endDate: customRange.to };
        }
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 'all'
        startDate = new Date('2020-01-01');
        break;
    }

    return { startDate, endDate };
  };

  // Carregar estatísticas quando grupo e período são selecionados
  const loadStats = async (groupId: string, period: any) => {
    const { startDate, endDate } = calculatePeriodDates(period.option, period.customRange);
    const stats = await getStats(groupId, startDate.toISOString(), endDate.toISOString());
    return stats;
  };

  // Handlers do modal
  const openModal = () => {
    console.log('Tentando abrir modal...');
    setModalState(prev => ({ 
      ...prev, 
      isOpen: true, 
      currentStep: 1,
      selectedGroup: null,
      stats: undefined,
      isGenerating: false 
    }));
  };

  const closeModal = () => {
    setModalState(prev => ({ 
      ...prev, 
      isOpen: false, 
      currentStep: 1,
      selectedGroup: null,
      stats: undefined,
      isGenerating: false 
    }));
  };

  const nextStep = async () => {
    if (modalState.currentStep === 2 && modalState.selectedGroup) {
      try {
        const stats = await loadStats(modalState.selectedGroup.id, modalState.selectedPeriod);
        setModalState(prev => ({ 
          ...prev, 
          currentStep: prev.currentStep + 1, 
          stats 
        }));
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setModalState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
      }
    } else {
      setModalState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    setModalState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
  };

  const selectGroup = (group: Group) => {
    setModalState(prev => ({ ...prev, selectedGroup: group }));
  };

  const selectPeriod = (option: any, customRange?: DateRange) => {
    setModalState(prev => ({ 
      ...prev, 
      selectedPeriod: { option, customRange } 
    }));
  };

  const selectTemplate = (template: ReportTemplate) => {
    const completeOptions = createCompleteReportOptions(template);
    setModalState(prev => ({ 
      ...prev, 
      selectedTemplate: template,
      reportOptions: completeOptions
    }));
  };

  const selectFormat = (format: ReportFormat) => {
    setModalState(prev => ({ ...prev, selectedFormat: format }));
  };

  const updateOptions = (options: ReportOptions) => {
    setModalState(prev => ({ ...prev, reportOptions: options }));
  };

  const generateReport = async () => {
    if (!modalState.selectedGroup || !modalState.stats) return;

    setModalState(prev => ({ ...prev, isGenerating: true }));

    try {
      const { startDate, endDate } = calculatePeriodDates(
        modalState.selectedPeriod.option, 
        modalState.selectedPeriod.customRange
      );

      const dateStr = modalState.selectedPeriod.option === 'custom' && modalState.selectedPeriod.customRange?.from && modalState.selectedPeriod.customRange?.to
        ? `${format(modalState.selectedPeriod.customRange.from, 'dd-MM-yyyy')}_${format(modalState.selectedPeriod.customRange.to, 'dd-MM-yyyy')}`
        : modalState.selectedPeriod.option;

      const blob = await ReportSystem.generateReport(
        modalState.stats,
        modalState.reportOptions,
        modalState.selectedFormat,
        modalState.selectedGroup.name,
        startDate.toISOString(),
        endDate.toISOString()
      );

      const fileName = ReportSystem.generateFilename(
        modalState.selectedTemplate,
        modalState.selectedGroup.name,
        modalState.selectedFormat,
        dateStr
      );

      await ReportSystem.downloadReport(blob, fileName, modalState.selectedFormat);

      closeModal();
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setModalState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const canProceed = () => {
    switch (modalState.currentStep) {
      case 1:
        return modalState.selectedGroup !== null;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const getPeriodLabel = () => {
    const option = PERIOD_OPTIONS.find(p => p.value === modalState.selectedPeriod.option);
    if (modalState.selectedPeriod.option === 'custom' && modalState.selectedPeriod.customRange?.from && modalState.selectedPeriod.customRange?.to) {
      return `${format(modalState.selectedPeriod.customRange.from, 'dd/MM/yyyy', { locale: pt })} - ${format(modalState.selectedPeriod.customRange.to, 'dd/MM/yyyy', { locale: pt })}`;
    }
    return option?.label || 'Período selecionado';
  };

  const isDateDisabled = (date: Date): boolean => {
    return date > new Date() || date < new Date("1900-01-01");
  };

  const isCustomEndDateDisabled = (date: Date): boolean => {
    return (
      date > new Date() || 
      date < new Date("1900-01-01") ||
      (modalState.selectedPeriod.customRange?.from ? date < modalState.selectedPeriod.customRange.from : false)
    );
  };

  const getAvailableFormats = (templateId: ReportTemplate) => {
    const template = getTemplateById(templateId);
    return FORMAT_OPTIONS.filter(format => template.formats.includes(format.value as any));
  };

  return (
    <div className="space-y-8">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>
        
        <div className="relative">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="h-5 w-5 text-purple-300" />
            <span className="text-sm font-medium text-purple-200">Sistema de Relatórios</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Relatórios Avançados</h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Gere relatórios detalhados com análises avançadas dos seus grupos do WhatsApp
          </p>
        </div>
      </div>
      
      {/* Templates Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(TEMPLATE_REGISTRY).slice(0, 3).map((template) => {
          const IconComponent = template.id === 'complete' ? BarChart3 :
                               template.id === 'members' ? Users :
                               template.id === 'executive' ? Target :
                               template.id === 'analytics' ? BarChart3 :
                               template.id === 'trends' ? TrendingUp :
                               template.id === 'insights' ? Brain :
                               GitCompare;

          return (
            <Card key={template.id} className="border-0 shadow-sm bg-card hover:shadow-lg transition-all duration-200 group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${
                    template.id === 'complete' ? 'bg-blue-500/10 text-blue-600' :
                    template.id === 'members' ? 'bg-green-500/10 text-green-600' :
                    'bg-purple-500/10 text-purple-600'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs border-0">
                    {template.complexity === 'basic' ? 'Básico' :
                     template.complexity === 'intermediate' ? 'Intermediário' :
                     'Avançado'}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold">
                  {template.name}
            </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{template.sections.length} seções</span>
                    <span>{template.estimatedTime}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.formats.map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format.toUpperCase()}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    onClick={() => {
                      console.log('Clicou no template:', template.id);
                      selectTemplate(template.id);
                      openModal();
                    }}
                    className="w-full group-hover:shadow-md transition-all"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Dialog open={modalState.isOpen} onOpenChange={(open) => {
        console.log('Modal state changed:', open);
        if (!open) {
          closeModal();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Gerar Relatório - Etapa {modalState.currentStep} de 5</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      step <= modalState.currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </DialogTitle>
            <DialogDescription>
              {modalState.currentStep === 1 && 'Selecione o grupo para análise'}
              {modalState.currentStep === 2 && 'Defina o período de análise'}
              {modalState.currentStep === 3 && 'Escolha o formato do relatório'}
              {modalState.currentStep === 4 && 'Configure as seções do relatório'}
              {modalState.currentStep === 5 && 'Preview e download do relatório'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {/* Etapa 1: Seleção de Grupo */}
            {modalState.currentStep === 1 && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar grupos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {groupsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Carregando grupos...</span>
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      {searchTerm 
                        ? `Nenhum grupo encontrado para "${searchTerm}". Tente outro termo.`
                        : 'Você ainda não possui grupos cadastrados. Adicione um grupo primeiro.'
                      }
                    </p>
                    {!searchTerm && (
                      <Button 
                        onClick={() => {
                          closeModal();
                          window.location.href = '/groups';
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Grupo
            </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {filteredGroups.map((group: Group) => (
                      <Card
                        key={group.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-0 shadow-sm ${
                          modalState.selectedGroup?.id === group.id
                            ? 'ring-2 ring-primary bg-accent'
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => selectGroup(group)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            {group.icon_url ? (
                              <img
                                src={group.icon_url}
                                alt={group.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                                {group.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{group.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {group.member_count || 0} membros
                              </p>
                            </div>
                            {modalState.selectedGroup?.id === group.id && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Etapa 2: Seleção de Período */}
            {modalState.currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERIOD_OPTIONS.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-0 shadow-sm ${
                        modalState.selectedPeriod.option === option.value
                          ? 'ring-2 ring-primary bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => selectPeriod(option.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{option.label}</h3>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                          {modalState.selectedPeriod.option === option.value && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
          </CardContent>
        </Card>
                  ))}
                </div>

                {modalState.selectedPeriod.option === 'custom' && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Período Personalizado</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-2">Data de início</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !modalState.selectedPeriod.customRange?.from && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {modalState.selectedPeriod.customRange?.from ? (
                                  format(modalState.selectedPeriod.customRange.from, "dd/MM/yyyy", { locale: pt })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={modalState.selectedPeriod.customRange?.from}
                                onSelect={(date) => 
                                  selectPeriod('custom', {
                                    from: date,
                                    to: modalState.selectedPeriod.customRange?.to
                                  })
                                }
                                disabled={isDateDisabled}
                                initialFocus
                                locale={pt}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-2">Data de fim</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !modalState.selectedPeriod.customRange?.to && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {modalState.selectedPeriod.customRange?.to ? (
                                  format(modalState.selectedPeriod.customRange.to, "dd/MM/yyyy", { locale: pt })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={modalState.selectedPeriod.customRange?.to}
                                onSelect={(date) => 
                                  selectPeriod('custom', {
                                    from: modalState.selectedPeriod.customRange?.from,
                                    to: date
                                  })
                                }
                                disabled={isCustomEndDateDisabled}
                                initialFocus
                                locale={pt}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Etapa 3: Seleção de Formato */}
            {modalState.currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Escolha o Formato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getAvailableFormats(modalState.selectedTemplate).map((format) => {
                      const IconComponent = format.icon;
                      return (
                        <Card
                          key={format.value}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md border-0 shadow-sm ${
                            modalState.selectedFormat === format.value
                              ? 'ring-2 ring-primary bg-accent'
                              : 'hover:bg-accent/50'
                          }`}
                          onClick={() => selectFormat(format.value as ReportFormat)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="flex flex-col items-center space-y-3">
                              <div className="p-3 rounded-xl bg-muted">
                                <IconComponent className={`w-6 h-6 ${format.color}`} />
                              </div>
                              <h4 className="font-semibold">{format.label}</h4>
                              <p className="text-sm text-muted-foreground">{format.description}</p>
                              {modalState.selectedFormat === format.value && (
                                <Check className="w-5 h-5 text-primary" />
                              )}
                            </div>
          </CardContent>
        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 4: Configuração */}
            {modalState.currentStep === 4 && modalState.selectedGroup && modalState.stats && (
              <div className="h-full overflow-hidden">
                <RealTimePreview
                  template={modalState.selectedTemplate}
                  options={modalState.reportOptions}
                  onOptionsChange={updateOptions}
                  groupName={modalState.selectedGroup.name}
                  period={getPeriodLabel()}
                  stats={modalState.stats}
                />
              </div>
            )}

            {/* Etapa 5: Preview Final */}
            {modalState.currentStep === 5 && modalState.selectedGroup && (
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
          <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Resumo do Relatório
            </CardTitle>
          </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Grupo Selecionado</h4>
                        <p className="text-muted-foreground">{modalState.selectedGroup.name}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Período</h4>
                        <p className="text-muted-foreground">{getPeriodLabel()}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Template</h4>
                        <p className="text-muted-foreground">{getTemplateById(modalState.selectedTemplate).name}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Formato</h4>
                        <p className="text-muted-foreground">{modalState.selectedFormat.toUpperCase()}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Seções Incluídas</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(modalState.reportOptions)
                          .filter(([key, value]) => key.startsWith('include') && value === true)
                          .map(([key]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key.replace('include', '').replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        <p>Tamanho estimado: ~3.2 MB</p>
                        <p>Tempo estimado: ~2 minutos</p>
                      </div>
                      <Button
                        onClick={generateReport}
                        disabled={modalState.isGenerating}
                        className="min-w-32"
                      >
                        {modalState.isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Gerar Relatório
                          </>
                        )}
            </Button>
                    </div>
          </CardContent>
        </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={modalState.currentStep === 1}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Etapa {modalState.currentStep} de 5
      </div>

            <div className="flex items-center space-x-2">
              {modalState.currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button variant="outline" onClick={closeModal}>
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 