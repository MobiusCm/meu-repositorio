'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/components/ui/use-toast';
import { fetchPreProcessedStats } from '@/lib/analysis';
import { generateSmartInsights, SmartInsight, GroupAnalysisData } from '@/lib/insights-engine';
import { SmartInsightCard } from '@/components/smart-insight-card';
import { BUSINESS_CATEGORIES } from '@/lib/insights-cards-catalog';

interface Group {
  id: string;
  name: string;
  member_count?: number;
}

type SortOption = 'weight' | 'priority' | 'category' | 'group';
type FilterOption = 'all' | 'critical' | 'high' | 'medium' | 'low';

export default function InsightsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<SmartInsight[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [dateRange] = useState<DateRange>({
    from: subDays(new Date(), 6),
    to: new Date()
  });
  const [sortBy, setSortBy] = useState<SortOption>('weight');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Buscar dados e gerar insights
  const fetchInsights = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Buscar grupos
      const { data: groupsData } = await supabase
        .from('groups')
        .select('*');
      
      if (!groupsData || groupsData.length === 0) {
        setInsights([]);
        setFilteredInsights([]);
        return;
      }

      setGroups(groupsData);

      const startDate = dateRange?.from || subDays(new Date(), 6);
      const endDate = dateRange?.to || new Date();
      const daysPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Preparar dados para análise
      const groupsAnalysisData: GroupAnalysisData[] = [];
      
      for (const group of groupsData) {
        try {
          const groupStats = await fetchPreProcessedStats(group.id, startDate, endDate);
          
          groupsAnalysisData.push({
            groupId: group.id,
            groupName: group.name,
            dailyStats: groupStats.daily_stats.map(day => ({
              date: day.date,
              total_messages: day.total_messages,
              active_members: day.active_members,
              hourly_activity: day.hourly_activity
            })),
            memberStats: groupStats.member_stats.map(member => ({
              name: member.name,
              message_count: member.message_count,
              word_count: member.word_count,
              media_count: member.media_count,
              dailyStats: member.dailyStats
            })),
            period: {
              start: startDate,
              end: endDate,
              days: daysPeriod
            }
          });
        } catch (error) {
          console.error(`Erro ao buscar dados do grupo ${group.name}:`, error);
        }
      }

      // Gerar todos os insights (não apenas top 3)
      const allInsights = generateSmartInsights(groupsAnalysisData);
      setInsights(allInsights);
      setFilteredInsights(allInsights);
      
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
      toast({
        title: 'Erro ao carregar insights',
        description: 'Não foi possível carregar os insights.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros e ordenação
  const applyFiltersAndSort = () => {
    let filtered = [...insights];

    // Filtrar por prioridade
    if (filterBy !== 'all') {
      filtered = filtered.filter(insight => insight.priority === filterBy);
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(insight => insight.metadata.category === selectedCategory);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'weight':
          comparison = a.weight - b.weight;
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                      priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'category':
          comparison = a.metadata.category.localeCompare(b.metadata.category);
          break;
        case 'group':
          comparison = a.groupName.localeCompare(b.groupName);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredInsights(filtered);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [insights, sortBy, sortOrder, filterBy, selectedCategory]);

  // Estatísticas dos insights
  const insightStats = {
    total: insights.length,
    critical: insights.filter(i => i.priority === 'critical').length,
    high: insights.filter(i => i.priority === 'high').length,
    medium: insights.filter(i => i.priority === 'medium').length,
    low: insights.filter(i => i.priority === 'low').length,
    actionable: insights.filter(i => i.actionable).length
  };

  // Categorias únicas
  const categories = ['all', ...Array.from(new Set(insights.map(i => i.metadata.category)))];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Engajamento': return <Users className="h-4 w-4" />;
      case 'Atividade': return <BarChart3 className="h-4 w-4" />;
      case 'Crescimento': return <TrendingUp className="h-4 w-4" />;
      case 'Temporal': return <Clock className="h-4 w-4" />;
      case 'Saúde': return <Target className="h-4 w-4" />;
      case 'Anomalias': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <Info className="h-4 w-4 text-orange-600" />;
      case 'medium': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Insights Inteligentes</h1>
              <p className="text-muted-foreground">Carregando análises...</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Insights Inteligentes</h1>
              <p className="text-muted-foreground">
                Análise profunda dos seus grupos do WhatsApp
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              <Calendar className="mr-1 h-3 w-3" />
              {format(dateRange.from!, 'dd/MM', { locale: ptBR })} - {format(dateRange.to!, 'dd/MM', { locale: ptBR })}
            </Badge>
            <Button onClick={fetchInsights} variant="outline" size="sm">
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{insightStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{insightStats.critical}</div>
                  <div className="text-xs text-muted-foreground">Críticos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{insightStats.high}</div>
                  <div className="text-xs text-muted-foreground">Alta</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{insightStats.medium}</div>
                  <div className="text-xs text-muted-foreground">Média</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="text-2xl font-bold">{insightStats.low}</div>
                  <div className="text-xs text-muted-foreground">Baixa</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{insightStats.actionable}</div>
                  <div className="text-xs text-muted-foreground">Acionáveis</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sort */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros e Ordenação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {/* Filtro por Prioridade */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Prioridade:</span>
                <div className="flex space-x-1">
                  {(['all', 'critical', 'high', 'medium', 'low'] as FilterOption[]).map((priority) => (
                    <Button
                      key={priority}
                      variant={filterBy === priority ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterBy(priority)}
                      className="h-8 text-xs"
                    >
                      {priority === 'all' ? 'Todas' : priority}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filtro por Categoria */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Categoria:</span>
                <div className="flex space-x-1">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="h-8 text-xs flex items-center space-x-1"
                    >
                      {getCategoryIcon(category)}
                      <span>{category === 'all' ? 'Todas' : category}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Ordenação */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Ordenar por:</span>
                <div className="flex space-x-1">
                  {(['weight', 'priority', 'category', 'group'] as SortOption[]).map((option) => (
                    <Button
                      key={option}
                      variant={sortBy === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(option)}
                      className="h-8 text-xs"
                    >
                      {option === 'weight' ? 'Peso' : 
                       option === 'priority' ? 'Prioridade' :
                       option === 'category' ? 'Categoria' : 'Grupo'}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-8"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Insights Encontrados ({filteredInsights.length})
            </h2>
          </div>
          
          {filteredInsights.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {filteredInsights.map((insight, index) => (
                <SmartInsightCard
                  key={insight.id}
                  insight={insight}
                  rank={index + 1}
                  showGroupName={true}
                  compact={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum insight encontrado</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Não foram encontrados insights para os filtros selecionados. 
                  Tente ajustar os filtros ou aguarde mais dados serem coletados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 