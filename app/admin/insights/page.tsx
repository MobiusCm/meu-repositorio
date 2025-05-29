'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Settings,
  Users,
  BarChart3,
  Plus,
  Search,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Zap,
  Activity,
  Filter,
  Eye,
  ArrowRight,
  Shield,
  Brain,
  Sparkles,
  Clock,
  TrendingDown,
  Edit3,
  Trash2,
  Play,
  Pause,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useCustomInsights } from '@/hooks/use-custom-insights';
import { InsightWizardV2 } from '@/components/insight-wizard-v2';
import { useRouter } from 'next/navigation';
import { 
  InsightRegistry, 
  VerifiedInsightData,
  VerifiedInsight 
} from '@/components/insights/types/InsightRegistry';
import { useVerifiedInsights } from '@/hooks/use-verified-insights';
import { fetchPreProcessedStats } from '@/lib/analysis';
import { DataProcessor } from '@/components/insights/utils/DataProcessor';
import { subDays } from 'date-fns';
import { VerifiedInsightConfig } from '@/components/insights/types/VerifiedInsightConfig';

interface Group {
  id: string;
  name: string;
  member_count?: number;
}

// Categorias de insights com design Apple-level
const INSIGHT_CATEGORIES = [
  {
    id: 'all',
    name: 'Todos',
    description: 'Todos os insights disponíveis',
    icon: Eye,
    color: 'bg-gray-500',
    lightColor: 'bg-gray-50 border-gray-200',
    darkColor: 'dark:bg-gray-800/50 dark:border-gray-700'
  },
  {
    id: 'engagement',
    name: 'Engajamento',
    description: 'Participação e interação',
    icon: Users,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 border-blue-200',
    darkColor: 'dark:bg-blue-950/20 dark:border-blue-800'
  },
  {
    id: 'activity',
    name: 'Atividade',
    description: 'Volume e padrões de atividade',
    icon: Activity,
    color: 'bg-green-500',
    lightColor: 'bg-green-50 border-green-200',
    darkColor: 'dark:bg-green-950/20 dark:border-green-800'
  },
  {
    id: 'growth',
    name: 'Crescimento',
    description: 'Tendências e evolução',
    icon: TrendingUp,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50 border-purple-200',
    darkColor: 'dark:bg-purple-950/20 dark:border-purple-800'
  },
  {
    id: 'quality',
    name: 'Qualidade',
    description: 'Qualidade do conteúdo',
    icon: Target,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50 border-orange-200',
    darkColor: 'dark:bg-orange-950/20 dark:border-orange-800'
  }
];

// Componente para card de insight verificado
const VerifiedInsightCard = ({ insight, onConfigure }: { 
  insight: VerifiedInsight;
  onConfigure: (insight: VerifiedInsight) => void;
}) => {
  const getInsightIcon = (id: string) => {
    switch (id) {
      case 'participation_decline':
        return TrendingDown;
      case 'activity_peak':
        return Zap;
      case 'member_concentration':
        return Users;
      case 'growth_acceleration':
        return TrendingUp;
      default:
        return Activity;
    }
  };

  const getStatusColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const IconComponent = getInsightIcon(insight.id);

  return (
    <Card className="group border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center relative">
              <IconComponent className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight">
                {insight.title}
              </h3>
              <Badge variant="secondary" className="mt-1 gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50">
                <Shield className="h-3 w-3" />
                Verificado
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(insight.priority)}`} />
            <Badge variant="outline" className="text-xs">
              {insight.priority === 'critical' ? 'Crítico' : 
               insight.priority === 'high' ? 'Alto' : 
               insight.priority === 'medium' ? 'Médio' : 'Baixo'}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {insight.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {insight.category}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {(insight.metadata.accuracy)}% precisão
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onConfigure(insight)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para card de insight customizado
const CustomInsightCard = ({ insight, onEdit, onToggle, onDelete }: { 
  insight: any;
  onEdit: (insight: any) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) => {
  const getStatusColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`group border-0 shadow-sm hover:shadow-md transition-all duration-200 ${
      insight.enabled ? 'bg-card' : 'bg-muted/30 opacity-75'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              insight.enabled ? 'bg-purple-500' : 'bg-gray-400'
            }`}>
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight">
                {insight.name}
              </h3>
              <Badge variant="secondary" className="mt-1 gap-1">
                <Sparkles className="h-3 w-3" />
                Customizado
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(insight.priority)}`} />
            <Switch
              checked={insight.enabled}
              onCheckedChange={(checked) => onToggle(insight.id, checked)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {insight.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {insight.category}
            </Badge>
            <Badge variant={insight.enabled ? "default" : "secondary"} className="text-xs">
              {insight.enabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(insight)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(insight.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminInsightsPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  // Hooks
  const {
    insights: customInsights,
    loading: customInsightsLoading,
    createInsight,
    updateInsight,
    deleteInsight,
    toggleInsight,
    getInsightStats
  } = useCustomInsights();
  
  const { getActiveInsightsForGroup } = useVerifiedInsights();

  // Estados
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCustomInsightForm, setShowCustomInsightForm] = useState(false);
  const [editingInsight, setEditingInsight] = useState<any>(null);
  const [verifiedInsightsData, setVerifiedInsightsData] = useState<VerifiedInsightData[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [verifiedConfigOpen, setVerifiedConfigOpen] = useState(false);
  const [selectedVerifiedInsight, setSelectedVerifiedInsight] = useState<VerifiedInsight | null>(null);

  // Buscar grupos
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('groups')
          .select('id, name, member_count')
          .order('name');

        if (error) throw error;
        setGroups(data || []);
      } catch (err) {
        console.error('Erro ao buscar grupos:', err);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar grupos.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [toast]);

  // Buscar insights verificados
  useEffect(() => {
    const fetchVerifiedInsights = async () => {
      if (groups.length === 0) return;
      
      setInsightsLoading(true);
      try {
        const allInsights: VerifiedInsightData[] = [];
        
        // Analisar cada grupo para insights verificados
        for (const group of groups.slice(0, 10)) { // Limitar para performance
          try {
            const endDate = new Date();
            const startDate = subDays(endDate, 29); // 30 dias
            
            const stats = await fetchPreProcessedStats(group.id, startDate, endDate);
            
            const groupData = DataProcessor.convertToGroupAnalysisData(
              group.id,
              group.name,
              stats,
              { start: startDate, end: endDate, days: 30 }
            );
            
            const activeInsights = getActiveInsightsForGroup(groupData);
            allInsights.push(...activeInsights);
          } catch (error) {
            console.error(`Erro ao processar grupo ${group.name}:`, error);
          }
        }
        
        setVerifiedInsightsData(allInsights);
      } catch (error) {
        console.error('Erro ao buscar insights verificados:', error);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchVerifiedInsights();
  }, [groups, getActiveInsightsForGroup]);

  // Estatísticas
  const customStats = getInsightStats();
  const verifiedInsights = InsightRegistry.getVerifiedInsights();
  const totalVerifiedActive = verifiedInsightsData.length;

  // Handlers
  const handleSaveCustomInsight = async (insightData: any) => {
    try {
      if (editingInsight) {
        const success = await updateInsight(editingInsight.id, insightData);
        if (success) {
          setEditingInsight(null);
          setShowCustomInsightForm(false);
        }
        return success;
      } else {
        const success = await createInsight(insightData);
        if (success) {
          setShowCustomInsightForm(false);
        }
        return success;
      }
    } catch (error) {
      console.error('Erro ao salvar insight:', error);
      return false;
    }
  };

  const handleEditInsight = (insight: any) => {
    setEditingInsight(insight);
    setShowCustomInsightForm(true);
  };

  const handleDeleteInsight = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este insight?')) {
      await deleteInsight(id);
    }
  };

  const handleToggleCustomInsight = async (id: string, enabled: boolean) => {
    const success = await toggleInsight(id, enabled);
    if (!success) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do insight.',
        variant: 'destructive',
      });
    }
  };

  // Função para configurar insight verificado
  const handleConfigureVerifiedInsight = (insight: VerifiedInsight) => {
    setSelectedVerifiedInsight(insight);
    setVerifiedConfigOpen(true);
  };

  // Função para salvar configuração de insight verificado
  const handleSaveVerifiedConfig = async (insightId: string, config: any): Promise<boolean> => {
    try {
      // Aqui você pode implementar a lógica para salvar as configurações no Supabase
      // Por enquanto, vamos simular o sucesso
      console.log('Salvando configuração do insight:', insightId, config);
      
      // Em uma implementação real, você salvaria na tabela insight_preferences
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Salvar preferências do usuário para este insight
      const { error } = await supabase
        .from('insight_preferences')
        .upsert({
          user_id: user.id,
          group_id: 'all', // Para insights verificados, pode ser 'all' ou específico
          insight_type: insightId,
          enabled: config.enabled,
          custom_threshold: { threshold: config.threshold },
          notification_settings: config.notifications
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Filtros
  const filteredCustomInsights = customInsights.filter(insight => {
    const matchesSearch = insight.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredVerifiedInsights = verifiedInsights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <Brain className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Carregando Smart Insights</h3>
              <p className="text-muted-foreground text-sm">Preparando sua experiência...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Apple-Style */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Smart Insights
            </h1>
            <p className="mt-2 text-muted-foreground">
              Configure e monitore insights inteligentes para seus grupos
            </p>
          </div>
          
          <Button 
            onClick={() => {
              setEditingInsight(null);
              setShowCustomInsightForm(true);
            }}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Insight
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Insights Verificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{verifiedInsights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalVerifiedActive} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Insights Customizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {customStats.enabled} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupos Monitorados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              grupos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Insights Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVerifiedActive + customStats.enabled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              total ativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {INSIGHT_CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Insights Customizados
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Insights Verificados */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Insights Verificados
                </h2>
                <p className="text-sm text-muted-foreground">
                  Insights profissionais com alta precisão
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {filteredVerifiedInsights.length} disponíveis
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVerifiedInsights.map((insight) => (
                <VerifiedInsightCard
                  key={insight.id}
                  insight={insight}
                  onConfigure={handleConfigureVerifiedInsight}
                />
              ))}
            </div>
          </div>

          {/* Insights Customizados Recentes */}
          {customInsights.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Insights Customizados Recentes
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Seus insights personalizados mais recentes
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const tab = document.querySelector('[value="custom"]') as HTMLElement;
                    tab?.click();
                  }}
                  className="flex items-center gap-2"
                >
                  Ver todos
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customInsights.slice(0, 6).map((insight) => (
                  <CustomInsightCard
                    key={insight.id}
                    insight={insight}
                    onEdit={handleEditInsight}
                    onToggle={handleToggleCustomInsight}
                    onDelete={handleDeleteInsight}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Insights Customizados */}
        <TabsContent value="custom" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Insights Customizados
              </h2>
              <p className="text-sm text-muted-foreground">
                Crie e gerencie seus insights personalizados
              </p>
            </div>
            <Button 
              onClick={() => {
                setEditingInsight(null);
                setShowCustomInsightForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Insight
            </Button>
          </div>

          {customInsightsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Brain className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Carregando insights...</p>
              </div>
            </div>
          ) : filteredCustomInsights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCustomInsights.map((insight) => (
                <CustomInsightCard
                  key={insight.id}
                  insight={insight}
                  onEdit={handleEditInsight}
                  onToggle={handleToggleCustomInsight}
                  onDelete={handleDeleteInsight}
                />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum insight customizado</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md">
                  Crie seu primeiro insight personalizado para monitorar métricas específicas dos seus grupos.
                </p>
                <Button 
                  onClick={() => setShowCustomInsightForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Insight
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-gray-600" />
              Configurações
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Configurações de Notificação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notificações</CardTitle>
                  <CardDescription>
                    Configure como receber alertas dos insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Notificações Email</Label>
                      <p className="text-xs text-muted-foreground">Receber alertas por email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Alertas Críticos</Label>
                      <p className="text-xs text-muted-foreground">Notificações imediatas para insights críticos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance</CardTitle>
                  <CardDescription>
                    Otimize o desempenho do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Frequência de Análise</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Período de Análise</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                        <SelectItem value="90">Últimos 90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal para Criar/Editar Insight */}
      <InsightWizardV2
        open={showCustomInsightForm}
        onClose={() => {
          setShowCustomInsightForm(false);
          setEditingInsight(null);
        }}
        onSave={handleSaveCustomInsight}
        editingInsight={editingInsight}
        availableGroups={groups}
      />

      {/* Modal para Configurar Insight Verificado */}
      <VerifiedInsightConfig
        open={verifiedConfigOpen}
        onClose={() => setVerifiedConfigOpen(false)}
        insight={selectedVerifiedInsight}
        onSave={handleSaveVerifiedConfig}
      />
    </div>
  );
} 