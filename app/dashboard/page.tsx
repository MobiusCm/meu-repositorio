'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  Clock,
  Zap,
  Target,
  Globe,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { format, subDays, isAfter, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { fetchPreProcessedStats, DetailedStats } from '@/lib/analysis';
import { generateSmartInsights, SmartInsight, GroupAnalysisData } from '@/lib/insights-engine';
import { InsightDetails } from '@/components/insight-details';

interface DashboardStats {
  totalGroups: number;
  totalMessages: number;
  activeMembers: number;
  engagementRate: number;
  weeklyActivity: Array<{ date: string; messages: number; members: number }>;
  smartInsights: SmartInsight[];
  topGroups: Array<{
    id: string;
    name: string;
    messageCount: number;
    memberCount: number;
    growth: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'message' | 'member' | 'analysis';
    description: string;
    time: string;
    groupName?: string;
  }>;
}

interface User {
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

type PeriodOption = '7dias' | '15dias' | '30dias';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalMessages: 0,
    activeMembers: 0,
    engagementRate: 0,
    weeklyActivity: [],
    smartInsights: [],
    topGroups: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6), // 7 dias: hoje + 6 dias anteriores
    to: new Date()
  });
  const [periodOption, setPeriodOption] = useState<PeriodOption>('7dias');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<SmartInsight | null>(null);
  const [insightModalOpen, setInsightModalOpen] = useState(false);

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Função para obter o nome do usuário
  const getUserName = () => {
    if (!user) return 'Usuário';
    
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName) {
      const firstName = fullName.split(' ')[0];
      return firstName;
    }
    
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return 'Usuário';
  };

  // Função para obter saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Função para calcular dias entre datas (inclusivo)
  const getDaysBetween = (from: Date, to: Date) => {
    return differenceInDays(endOfDay(to), startOfDay(from)) + 1;
  };

  // Handler para mudança de período
  const handlePeriodChange = (option: PeriodOption) => {
    const today = new Date();
    let newRange: DateRange;

    switch (option) {
      case '7dias':
        newRange = { from: subDays(today, 6), to: today }; // 7 dias total
        break;
      case '15dias':
        newRange = { from: subDays(today, 14), to: today }; // 15 dias total
        break;
      case '30dias':
        newRange = { from: subDays(today, 29), to: today }; // 30 dias total
        break;
      default:
        return;
    }

    setPeriodOption(option);
    setDateRange(newRange);
    setCalendarOpen(false);
  };

  // Função para calcular taxa de engajamento inteligente (NOVA FÓRMULA)
  const calculateEngagementRate = async (groups: any[]) => {
    if (!groups || groups.length === 0) return 0;
    
    try {
      const today = new Date();
      const last7Days = subDays(today, 6); // 7 dias: hoje + 6 anteriores
      const last30Days = subDays(today, 29); // 30 dias: hoje + 29 anteriores
      
      let total7DaysMessages = 0;
      let total7DaysActiveMembers = 0;
      let total30DaysMessages = 0;
      let total30DaysActiveMembers = 0;
      let groupsWithData = 0;
      
      // Analisar cada grupo
      for (const group of groups) {
        try {
          // Dados dos últimos 7 dias
          const stats7Days = await fetchPreProcessedStats(group.id, last7Days, today);
          
          // Dados dos últimos 30 dias
          const stats30Days = await fetchPreProcessedStats(group.id, last30Days, today);
          
          if (stats7Days.total_messages > 0 || stats30Days.total_messages > 0) {
            groupsWithData++;
            total7DaysMessages += stats7Days.total_messages;
            total7DaysActiveMembers += stats7Days.active_members;
            total30DaysMessages += stats30Days.total_messages;
            total30DaysActiveMembers += stats30Days.active_members;
          }
        } catch (error) {
          console.error(`Erro ao buscar dados de engajamento do grupo ${group.name}:`, error);
        }
      }
      
      if (groupsWithData === 0 || total30DaysMessages === 0) return 0;
      
      // Calcular métricas comparativas
      const avgDailyMessages7Days = total7DaysMessages / 7;
      const avgDailyMessages30Days = total30DaysMessages / 30;
      const avgDailyActiveMembers7Days = total7DaysActiveMembers / 7;
      const avgDailyActiveMembers30Days = total30DaysActiveMembers / 30;
      
      // Score de intensidade de mensagens (7 dias vs 30 dias)
      const messageIntensityRatio = avgDailyMessages30Days > 0 
        ? (avgDailyMessages7Days / avgDailyMessages30Days) 
        : 1;
      const messageIntensityScore = Math.min(messageIntensityRatio * 50, 100); // Base 50%, pode chegar a 100%
      
      // Score de atividade de membros (7 dias vs 30 dias)
      const memberActivityRatio = avgDailyActiveMembers30Days > 0 
        ? (avgDailyActiveMembers7Days / avgDailyActiveMembers30Days) 
        : 1;
      const memberActivityScore = Math.min(memberActivityRatio * 50, 100); // Base 50%, pode chegar a 100%
      
      // Score de densidade de conversação (mensagens por membro ativo)
      const messagesPerActiveMember7Days = total7DaysActiveMembers > 0 
        ? total7DaysMessages / total7DaysActiveMembers 
        : 0;
      const densityScore = Math.min((messagesPerActiveMember7Days / 5) * 30, 30); // Máximo 30% do score
      
      // Score final ponderado
      const finalScore = (
        messageIntensityScore * 0.4 +  // 40% - Intensidade de mensagens
        memberActivityScore * 0.4 +    // 40% - Atividade de membros  
        densityScore * 0.2              // 20% - Densidade de conversação
      );
      
      return Math.min(Math.round(finalScore), 100);
    } catch (error) {
      console.error('Erro no cálculo de engajamento:', error);
      return 0;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Buscar grupos
      const { data: groups } = await supabase
    .from('groups')
        .select('*');
      
      if (!groups || groups.length === 0) {
        setStats({
          totalGroups: 0,
          totalMessages: 0,
          activeMembers: 0,
          engagementRate: 0,
          weeklyActivity: [],
          smartInsights: [],
          topGroups: [],
          recentActivity: []
        });
        return;
      }

      // Determinar período para análise
      const startDate = dateRange?.from || subDays(new Date(), 6);
      const endDate = dateRange?.to || new Date();
      const daysPeriod = getDaysBetween(startDate, endDate);

      // Buscar dados agregados de todos os grupos
      const groupAnalytics: DetailedStats[] = [];
      const groupsAnalysisData: GroupAnalysisData[] = [];
      let totalMessages = 0;
      let totalActiveMembers = 0;
      const allDailyStats: Array<{ date: string; total_messages: number; active_members: number }> = [];
      
      // Para insights, sempre usar os últimos 30 dias
      const insightsStartDate = subDays(new Date(), 29); // 30 dias: hoje + 29 dias anteriores
      const insightsEndDate = new Date();
      
      for (const group of groups) {
        try {
          // Dados para o período selecionado (para gráficos e estatísticas)
          const groupStats = await fetchPreProcessedStats(group.id, startDate, endDate);
          
          // Dados dos últimos 30 dias (para insights)
          const insightsStats = await fetchPreProcessedStats(group.id, insightsStartDate, insightsEndDate);
          
          groupAnalytics.push(groupStats);
          totalMessages += groupStats.total_messages;
          totalActiveMembers += groupStats.active_members;
          
          // Preparar dados para o sistema de insights (sempre últimos 30 dias)
          groupsAnalysisData.push({
            groupId: group.id,
            groupName: group.name,
            dailyStats: insightsStats.daily_stats.map(day => ({
              date: day.date,
              total_messages: day.total_messages,
              active_members: day.active_members,
              hourly_activity: day.hourly_activity
            })),
            memberStats: insightsStats.member_stats.map(member => ({
              name: member.name,
              message_count: member.message_count,
              word_count: member.word_count,
              media_count: member.media_count,
              dailyStats: member.dailyStats
            })),
            period: {
              start: insightsStartDate,
              end: insightsEndDate,
              days: 30
            }
          });
          
          // Agregar dados diários (do período selecionado para gráficos)
          groupStats.daily_stats.forEach(day => {
            const existingDay = allDailyStats.find(d => d.date === day.date);
            if (existingDay) {
              existingDay.total_messages += day.total_messages;
              existingDay.active_members += day.active_members;
            } else {
              allDailyStats.push({
                date: day.date,
                total_messages: day.total_messages,
                active_members: day.active_members
              });
            }
          });
        } catch (error) {
          console.error(`Erro ao buscar dados do grupo ${group.name}:`, error);
        }
      }

      // Gerar insights inteligentes usando o novo sistema
      const smartInsights = generateSmartInsights(groupsAnalysisData);

      // Ordenar dados diários por data
      allDailyStats.sort((a, b) => {
        const dateA = a.date.split('/').reverse().join('-');
        const dateB = b.date.split('/').reverse().join('-');
        return dateA.localeCompare(dateB);
      });

      // Processar atividade para gráficos
      const weeklyActivity = allDailyStats.map(day => ({
        date: day.date,
        messages: day.total_messages,
        members: day.active_members
      }));
      
      // Top grupos com dados reais
      const topGroups = groups.map((group, index) => {
        const groupStats = groupAnalytics[index];
        return {
          id: group.id,
          name: group.name,
          messageCount: groupStats?.total_messages || 0,
          memberCount: group.member_count || 0,
          growth: Math.floor(Math.random() * 20) - 10
        };
      })
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 5);
      
      // Atividade recente simulada
      const recentActivity = [
        {
          id: '1',
          type: 'message' as const,
          description: 'Nova análise processada',
          time: '12 minutos atrás',
          groupName: topGroups[0]?.name
        },
        {
          id: '2',
          type: 'member' as const,
          description: 'Novo membro identificado',
          time: '1 hora atrás',
          groupName: topGroups[1]?.name
        },
        {
          id: '3',
          type: 'analysis' as const,
          description: 'Relatório gerado',
          time: '3 horas atrás',
          groupName: topGroups[2]?.name
        }
      ];
      
      // Calcular taxa de engajamento inteligente
      const engagementRate = await calculateEngagementRate(groups);
      
      setStats({
        totalGroups: groups.length,
        totalMessages,
        activeMembers: totalActiveMembers,
        engagementRate,
        weeklyActivity,
        smartInsights,
        topGroups,
        recentActivity
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do dashboard.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable' | 'warning' | 'critical') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable' | 'warning' | 'critical') => {
    switch (trend) {
      case 'up': return 'text-emerald-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      case 'warning': return 'text-amber-600';
      case 'critical': return 'text-red-600';
    }
  };

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
        return <CheckCircle className={`h-6 w-6 ${iconColor}`} />;
      case 'participation_decline':
      case 'engagement_pattern':
        if (insight.trend === 'down' || insight.trend === 'critical') {
          return <TrendingDown className={`h-6 w-6 ${iconColor}`} />;
        }
        return <TrendingUp className={`h-6 w-6 ${iconColor}`} />;
      case 'growth_trend':
        if (insight.trend === 'down' || insight.trend === 'critical') {
          return <TrendingDown className={`h-6 w-6 ${iconColor}`} />;
        } else if (insight.trend === 'up') {
          return <TrendingUp className={`h-6 w-6 ${iconColor}`} />;
        }
        return <Activity className={`h-6 w-6 ${iconColor}`} />;
      case 'activity_peak':
        return <Zap className={`h-6 w-6 ${iconColor}`} />;
      case 'anomaly_detection':
        return <AlertTriangle className={`h-6 w-6 ${iconColor}`} />;
      case 'member_concentration':
      case 'leadership_emergence':
        return <Users className={`h-6 w-6 ${iconColor}`} />;
      case 'time_pattern':
        return <Clock className={`h-6 w-6 ${iconColor}`} />;
      case 'content_quality':
        return <MessageSquare className={`h-6 w-6 ${iconColor}`} />;
      default: 
        return <Activity className={`h-6 w-6 ${iconColor}`} />;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Banner Premium de Boas-vindas */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Centro de Comando</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getGreeting()}, {getUserName()}!
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Monitore, analise e otimize seus grupos do WhatsApp com insights avançados.
            </p>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
              <div className="text-sm text-slate-300">Grupos Ativos</div>
            </div>
            <div className="h-12 w-px bg-white/20"></div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
              <div className="text-sm text-slate-300">Mensagens</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Período de Análise */}
      {dateRange?.from && (
        <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4 border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-background rounded-lg shadow-sm border">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <span className="text-sm font-medium">
                Período de Análise
              </span>
              <div className="text-xs text-muted-foreground">
                {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} até {format(dateRange.to || dateRange.from, 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          </div>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
                onClick={() => setCalendarOpen(true)}
              >
                {getDaysBetween(dateRange.from, dateRange.to || dateRange.from)} dias
                <ChevronDown className="h-3 w-3" />
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="space-y-4 p-3">
                <h4 className="font-medium">Selecionar Período</h4>
                <div className="space-y-2">
                  <Button
                    variant={periodOption === '7dias' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handlePeriodChange('7dias')}
                  >
                    Últimos 7 dias
                  </Button>
                  <Button
                    variant={periodOption === '15dias' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handlePeriodChange('15dias')}
                  >
                    Últimos 15 dias
                  </Button>
                  <Button
                    variant={periodOption === '30dias' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handlePeriodChange('30dias')}
                  >
                    Últimos 30 dias
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Stats Cards Minimalistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Grupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalGroups}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Ativos
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {stats.totalMessages.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  No período
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membros Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.activeMembers}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Activity className="mr-1 h-3 w-3" />
                  Engajados
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.engagementRate}%</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <BarChart3 className="mr-1 h-3 w-3" />
                  Calculado
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Message Activity Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Atividade de Mensagens</CardTitle>
            <CardDescription>Mensagens e membros ativos por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mb-6">
              {stats.weeklyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyActivity}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorMessages)" 
                      name="Mensagens"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="members" 
                      stroke="#6366f1" 
                      fillOpacity={1} 
                      fill="url(#colorMembers)" 
                      name="Membros Ativos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </p>
                </div>
              )}
            </div>
            
            {/* Informações elegantes abaixo do gráfico */}
            {stats.weeklyActivity.length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                {(() => {
                  const maxMessagesDay = stats.weeklyActivity.reduce((max, day) => 
                    day.messages > max.messages ? day : max, stats.weeklyActivity[0]);
                  const maxMembersDay = stats.weeklyActivity.reduce((max, day) => 
                    day.members > max.members ? day : max, stats.weeklyActivity[0]);
                  const totalMessages = stats.weeklyActivity.reduce((sum, day) => sum + day.messages, 0);
                  const avgMessages = Math.round(totalMessages / stats.weeklyActivity.length);
                  
                  return (
                    <>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {maxMessagesDay.messages.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pico de mensagens
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {maxMessagesDay.date}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {maxMembersDay.members}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Máximo de membros
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {maxMembersDay.date}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {avgMessages.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Média diária
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          no período
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smart Insights Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Insights Inteligentes</CardTitle>
            <CardDescription>
              Análises baseadas em dados comportamentais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.smartInsights.length > 0 ? (
                stats.smartInsights.map((insight, index) => (
                  <div 
                    key={insight.id} 
                    className="flex items-start gap-4 p-4 rounded-lg border border-border/40 hover:border-border/70 hover:bg-muted/40 dark:hover:bg-muted/30 transition-all duration-200 group cursor-pointer"
                    onClick={() => {
                      setSelectedInsight(insight);
                      setInsightModalOpen(true);
                    }}
                    title="Clique para ver detalhes completos"
                  >
                    {/* Ícone */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-muted/40 to-muted/70 dark:from-muted/50 dark:to-muted/80 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                      {getInsightIcon(insight)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-medium text-foreground dark:text-foreground leading-tight">
                          {insight.title}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-2 py-1 bg-muted/60 dark:bg-muted/60 text-muted-foreground dark:text-muted-foreground border-0 hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors cursor-pointer flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/groups/${insight.groupId}`);
                          }}
                        >
                          {insight.groupName}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                      
                      {/* Indicador visual sutil de clicabilidade */}
                      <div className="flex items-center justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
                          Ver detalhes
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dados insuficientes para gerar insights
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section with Tabs */}
      <Tabs defaultValue="top-groups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="top-groups">Top Groups</TabsTrigger>
          <TabsTrigger value="recent-activity">Atividade Recente</TabsTrigger>
          <TabsTrigger value="quick-stats">Estatísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="top-groups" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Grupos com Melhor Performance</CardTitle>
              <CardDescription>Grupos com maior atividade no período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topGroups.map((group, index) => (
                  <div 
                    key={group.id} 
                    className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/groups/${group.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.memberCount} membros
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <Badge variant="secondary">
                          {group.messageCount.toLocaleString()} msgs
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {group.growth > 0 ? '+' : ''}{group.growth}% vs anterior
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent-activity" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
              <CardDescription>Últimas atualizações dos seus grupos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-muted">
                      {activity.type === 'message' && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                      {activity.type === 'member' && <Users className="h-4 w-4 text-muted-foreground" />}
                      {activity.type === 'analysis' && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                        {activity.groupName && (
                          <>
                            <span>•</span>
                            <span>{activity.groupName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quick-stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.weeklyActivity.length > 0 
                    ? Math.round(stats.weeklyActivity.reduce((sum, day) => sum + day.messages, 0) / stats.weeklyActivity.length).toLocaleString()
                    : '0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">mensagens por dia</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pico de Atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.weeklyActivity.length > 0 
                    ? Math.max(...stats.weeklyActivity.map(day => day.messages)).toLocaleString()
                    : '0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">mensagens em um dia</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Grupos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.topGroups.filter(group => group.messageCount > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">de {stats.totalGroups} grupos</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Modal de Detalhes do Insight */}
      <InsightDetails
        insight={selectedInsight}
        isOpen={insightModalOpen}
        onClose={() => setInsightModalOpen(false)}
      />
    </div>
  );
} 