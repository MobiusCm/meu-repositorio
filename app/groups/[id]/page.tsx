'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format, subDays, parseISO, addDays, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, Users, MessageSquare, Calendar as CalendarIcon, Upload, BarChart2, User, Filter, ChevronDown, Search, Bot, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { use } from 'react';
import { analyzeWhatsAppChat, fetchPreProcessedStats, fetchAvailableDates, DetailedStats, MemberStats } from '@/lib/analysis';
import { DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MemberProfileCard } from '@/components/member-profile-card';
import { isMemberProfiled, getMemberProfile } from '@/lib/member-profiler';
import { PeriodSelector } from '@/components/period-selector';

interface GroupPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Group {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  created_at?: string;
  last_updated_at?: string;
  member_count?: number;
  user_id?: string;
  created_by?: string;
}

interface ChartDataPoint {
  date: string;
  messages: number;
  activeMembers: number;
}

interface MemberChartDataPoint {
  date: string;
  [key: string]: string | number;
}

// Componente personalizado para formatar a data no tooltip corretamente
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    // Garantir que o formato da data seja consistente
    let formattedDate = label;
    
    // Verificar se o label é uma data no formato DD/MM/YYYY
    if (typeof label === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(label)) {
      try {
        // Se for, vamos manter o formato
        formattedDate = label;
      } catch (error) {
        console.error("Erro ao formatar data:", error);
      }
    }
    
    return (
      <div className="custom-tooltip bg-popover text-popover-foreground p-2 rounded-md shadow-md border border-border">
        <p className="font-medium">Data: {formattedDate}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default function GroupPage({ params }: GroupPageProps) {
  // Desempacotar params usando React.use()
  const { id } = use(params);
  
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [memberChartData, setMemberChartData] = useState<MemberChartDataPoint[]>([]);
  const [topMembersList, setTopMembersList] = useState<MemberStats[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  
  // Estado para o chat do Oráculo
  const [oracleMessage, setOracleMessage] = useState('');
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  
  // Estado para gerenciar o membro selecionado para fichamento
  const [selectedMember, setSelectedMember] = useState<MemberStats | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profiledMembers, setProfiledMembers] = useState<Set<string>>(new Set());
  
  // Estado para datas disponíveis
  const [availableDates, setAvailableDates] = useState<{
    minDate: Date | null;
    maxDate: Date | null;
    availableDates: Date[];
  }>({ minDate: null, maxDate: null, availableDates: [] });
  
  // Buscar dados do grupo
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Buscar dados do grupo
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .single();
        
        if (groupError) throw groupError;
        setGroup(groupData);
        
        // Buscar datas disponíveis para este grupo
        console.log('🔍 Buscando datas disponíveis...');
        const datesData = await fetchAvailableDates(id);
        setAvailableDates(datesData);
        
        console.log('📅 Datas encontradas:', {
          minDate: datesData.minDate?.toISOString(),
          maxDate: datesData.maxDate?.toISOString(),
          totalDates: datesData.availableDates.length
        });
        
        // Configurar período inicial baseado nas datas disponíveis
        if (datesData.minDate && datesData.maxDate && datesData.availableDates.length > 0) {
          // Usar os últimos 7 dias disponíveis como padrão
          const last7Days = datesData.availableDates.slice(-7);
          const actualStartDate = last7Days[0];
          const actualEndDate = last7Days[last7Days.length - 1];
          
          console.log('🎯 Configurando período inicial:', {
            startDate: actualStartDate.toISOString(),
            endDate: actualEndDate.toISOString(),
            daysCount: last7Days.length
          });
          
          // Definir o período inicial
          const initialRange = { from: actualStartDate, to: actualEndDate };
          setDateRange(initialRange);
          
          // Analisar mensagens com o período inicial
          await updatePeriodWithDates(actualStartDate, actualEndDate);
        } else {
          console.log('⚠️ Nenhuma data disponível encontrada');
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados do grupo:', error);
        toast({
          title: 'Erro ao carregar grupo',
          description: 'Não foi possível carregar os dados do grupo.',
          variant: 'destructive'
        });
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchGroupData();
  }, [id, toast]);
  
  // Monitorar mudanças no estado availableDates
  useEffect(() => {
    console.log('🔄 availableDates state changed:', {
      minDate: availableDates.minDate?.toISOString(),
      maxDate: availableDates.maxDate?.toISOString(),
      totalDates: availableDates.availableDates.length,
      firstFewDates: availableDates.availableDates.slice(0, 5).map(d => d.toISOString())
    });
  }, [availableDates]);
  
  // Monitorar mudanças no dateRange
  useEffect(() => {
    console.log('🔄 dateRange state changed:', {
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString()
    });
  }, [dateRange]);
  
  // Função para atualizar período com datas específicas
  const updatePeriodWithDates = async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    setIsAnalyzing(true);
    
    try {
      console.log('🔍 updatePeriodWithDates chamado com:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateFormatted: format(startDate, 'dd/MM/yyyy'),
        endDateFormatted: format(endDate, 'dd/MM/yyyy')
      });
      
      const results = await fetchPreProcessedStats(id, startDate, endDate);

      if (results.days_analyzed === 0) {
        toast({
          title: 'Informação',
          description: 'Não foram encontrados dados para o período selecionado.',
          variant: 'default'
        });
      }
      
      setStats(results);
      
      // Preparar dados para os gráficos
      const dailyData: ChartDataPoint[] = results.daily_stats.map((day) => ({
        date: day.date,
        messages: day.total_messages,
        activeMembers: day.active_members,
      }));
      setChartData(dailyData);
      
      // Processar dados de membros
      if (!results.member_stats || results.member_stats.length === 0) {
        setMemberChartData([]);
        setTopMembersList([]);
      } else {
        const topMembers = results.member_stats.slice(0, 5);
        const memberData: MemberChartDataPoint[] = [];
        
        results.daily_stats.forEach((day) => {
          const dataPoint: MemberChartDataPoint = { date: day.date };
          
          topMembers.forEach((member) => {
            const memberDailyStat = member.dailyStats.find((stat) => stat.date === day.date);
            dataPoint[member.name] = memberDailyStat ? memberDailyStat.message_count : 0;
          });
          
          memberData.push(dataPoint);
        });
        
        setMemberChartData(memberData);
        setTopMembersList(results.member_stats);
      }
    } catch (error) {
      console.error('Erro ao atualizar período:', error);
      
      let errorMessage = 'Não foi possível analisar os dados para o período selecionado.';
      
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('não encontrado')) {
          errorMessage = 'Não há dados disponíveis para o período selecionado.';
        } else if (error.message.includes('permission denied') || error.message.includes('access')) {
          errorMessage = 'Você não tem permissão para acessar estes dados.';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'Erro de conexão ao tentar buscar os dados. Verifique sua internet.';
        } else if (error.message.includes('parse') || error.message.includes('JSON')) {
          errorMessage = 'Erro ao processar os dados de membros. Formato inválido.';
        }
      }
      
      toast({
        title: 'Erro ao carregar estatísticas',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setStats({
        daily_stats: [],
        member_stats: [],
        total_messages: 0,
        total_words: 0,
        total_media: 0,
        active_members: 0,
        hourly_activity: {},
        avg_words_per_message: 0,
        days_analyzed: 0
      });
      setChartData([]);
      setMemberChartData([]);
      setTopMembersList([]);
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };

  // Handler para mudança de período
  const handlePeriodChange = async (range: DateRange | undefined) => {
    if (!range?.from) return;
    
    setDateRange(range);
    const startDate = range.from;
    const endDate = range.to || range.from;
    
    console.log('🔄 Período alterado:', {
      from: startDate.toISOString(),
      to: endDate.toISOString()
    });
    
    await updatePeriodWithDates(startDate, endDate);
  };
  
  // Cores para os gráficos de membros
  const memberColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
    '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
  ];
  
  // Filtrar os membros com base na busca
  const filteredMembers = useMemo(() => {
    if (!memberSearchTerm || !topMembersList) return topMembersList;
    
    const searchTermLower = memberSearchTerm.toLowerCase().replace(/[^a-z0-9\s]/gi, '');
    
    return topMembersList.filter(member => {
      // Remover caracteres especiais para comparação
      const normalizedName = member.name.toLowerCase().replace(/[^a-z0-9\s]/gi, '');
      return normalizedName.includes(searchTermLower);
    });
  }, [topMembersList, memberSearchTerm]);
  
  // Verificar quais membros já foram fichados
  const checkProfiledMembers = async () => {
    if (!topMembersList || topMembersList.length === 0) return;
    
    try {
      const supabase = createClient();
      
      // Obter todos os membros fichados de uma vez
      const { data, error } = await supabase
        .from('member_profiles')
        .select('member_name')
        .eq('group_id', id)
        .in('member_name', topMembersList.map(member => member.name));
      
      if (error) throw error;
      
      // Criar um novo Set com os nomes dos membros fichados
      const newProfiledMembers = new Set<string>(
        data?.map(profile => profile.member_name) || []
      );
      
      setProfiledMembers(newProfiledMembers);
    } catch (error) {
      console.error('Erro ao verificar membros fichados:', error);
    }
  };
  
  // Atualizar lista de membros fichados quando a lista de membros mudar
  useEffect(() => {
    if (topMembersList && topMembersList.length > 0) {
      checkProfiledMembers();
    }
  }, [topMembersList]);
  
  // Função para abrir o diálogo de perfil de membro
  const handleOpenMemberProfile = (member: MemberStats) => {
    setSelectedMember(member);
    setProfileDialogOpen(true);
  };
  
  // Função para fechar o diálogo de perfil
  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    // Esperar a animação de fechamento antes de limpar o membro selecionado
    setTimeout(() => setSelectedMember(null), 300);
  };
  
  // Função para enviar mensagem para o Oráculo (chat de IA)
  const handleOracleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oracleMessage.trim()) return;
    
    setIsOracleLoading(true);
    
    try {
      // Aqui você implementaria a chamada real para a API de IA
      // Por enquanto vamos simular uma resposta
      setTimeout(() => {
        setOracleResponse(`Análise do grupo ${group?.name}: Com base nos dados disponíveis para o período selecionado, este grupo tem uma atividade ${stats?.total_messages && stats.total_messages > 1000 ? 'alta' : 'moderada'} com ${stats?.active_members || 0} membros ativos e um total de ${stats?.total_messages || 0} mensagens.`);
        setIsOracleLoading(false);
        setOracleMessage('');
      }, 1500);
    } catch (error) {
      console.error('Erro ao consultar o Oráculo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua solicitação.',
        variant: 'destructive',
      });
      setIsOracleLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Se não há dados disponíveis para o grupo
  if (!availableDates.minDate || !availableDates.maxDate) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col space-y-8">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <span className="font-semibold">{group?.name || 'Carregando...'}</span>
            </div>
          </div>

          {/* Estado vazio */}
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Nenhum dado disponível</h3>
              <p className="text-muted-foreground max-w-md">
                Este grupo ainda não possui dados de mensagens processados. 
                Faça o upload de um arquivo de chat para começar a análise.
              </p>
            </div>
            <Button asChild>
              <Link href={`/groups/${id}/update`}>
                <Upload className="mr-2 h-4 w-4" />
                Fazer Upload do Chat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    // Remover o container principal para permitir integração com o layout do dashboard
    <div className="flex-1 overflow-auto p-6">
      <div className="flex flex-col space-y-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <span className="font-semibold">{group?.name || 'Carregando...'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Novo seletor de período */}
            <PeriodSelector
              availableDates={availableDates.availableDates}
              minDate={availableDates.minDate}
              maxDate={availableDates.maxDate}
              selectedRange={dateRange}
              onRangeChange={handlePeriodChange}
              daysAnalyzed={stats?.days_analyzed || 0}
            />
            
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span>Analisando...</span>
              </div>
            )}
            
            <Button asChild size="sm" className="h-8">
              <Link href={`/groups/${id}/update`}>
                <Upload className="mr-1.5 h-3 w-3" />
                Atualizar
              </Link>
            </Button>
          </div>
        </div>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="text-center space-y-2">
              <p className="font-medium">Analisando mensagens</p>
              <p className="text-sm text-muted-foreground">
                Processando dados para o período selecionado...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de resumo - métricas mais relevantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Mensagens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {stats?.total_messages.toLocaleString('pt-BR') || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats && stats.days_analyzed > 0 
                          ? `${Math.round(stats.total_messages / stats.days_analyzed)} por dia`
                          : 'Sem dados'
                        }
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Membros Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {stats?.active_members || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.member_stats?.length || 0} participantes únicos
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Membro Mais Ativo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-bold truncate">
                        {stats?.member_stats?.[0]?.name || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.member_stats?.[0]?.message_count || 0} mensagens
                        {stats?.member_stats?.[0] && stats?.member_stats?.[1] && (
                          <span className="ml-1">
                            (+{stats.member_stats[0].message_count - stats.member_stats[1].message_count} vs 2º)
                          </span>
                        )}
                      </p>
                    </div>
                    <User className="h-8 w-8 text-orange-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Horário de Pico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {stats?.hourly_activity && Object.keys(stats.hourly_activity).length > 0
                          ? `${Object.entries(stats.hourly_activity).reduce((max, [hour, count]) => 
                              count > max.count ? { hour, count } : max, { hour: '00', count: 0 }).hour}h`
                          : 'N/A'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.hourly_activity && Object.keys(stats.hourly_activity).length > 0
                          ? `${Object.entries(stats.hourly_activity).reduce((max, [hour, count]) => 
                              count > max.count ? { hour, count } : max, { hour: '00', count: 0 }).count} mensagens`
                          : 'Sem dados'
                        }
                      </p>
                    </div>
                    <BarChart2 className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Tabs de conteúdo */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="members">Membros</TabsTrigger>
                <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
                <TabsTrigger value="oracle">Oráculo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Atividade Diária</CardTitle>
                      <CardDescription>
                        Mensagens enviadas por dia no grupo
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip content={<CustomTooltip />} />
                                                      <Area 
                            type="monotone" 
                            dataKey="messages" 
                            stroke="#8884d8" 
                            fillOpacity={1} 
                            fill="url(#colorMessages)" 
                            name="Mensagens"
                          />
                        </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center space-y-3">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <BarChart2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-muted-foreground">
                              Nenhum dado disponível
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Não há mensagens para o período selecionado
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Membros Ativos</CardTitle>
                      <CardDescription>
                        Quantidade de membros ativos por dia
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="activeMembers" 
                              fill="#82ca9d" 
                              name="Membros Ativos"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center space-y-3">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-muted-foreground">
                              Nenhum dado disponível
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Não há atividade de membros para mostrar
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {stats?.hourly_activity && Object.keys(stats.hourly_activity).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Atividade por Hora do Dia</CardTitle>
                      <CardDescription>
                        Distribuição de mensagens ao longo do dia
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(stats.hourly_activity).map(([hour, count]) => ({
                            hour: `${hour}h`,
                            count
                          }))}
                        >
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="count"
                            fill="#0088fe"
                            name="Mensagens"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="members" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Membros Ativos</CardTitle>
                    <CardDescription>
                      Lista de participantes que enviaram mensagens
                    </CardDescription>
                    <div className="mt-2 relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome..."
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stats?.member_stats && stats.member_stats.length > 0 ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {filteredMembers.map((member, index) => (
                            <div 
                              key={member.id} 
                              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium text-muted-foreground">
                                  {index + 1}
                                </div>
                                
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                                    {member.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-sm truncate" title={member.name}>
                                      {member.name}
                                    </h4>
                                    {profiledMembers.has(member.name) && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {member.message_count.toLocaleString('pt-BR')} mensagens
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="text-right">
                                  <div className="font-medium">{Math.round(member.avg_words_per_message * 10) / 10}</div>
                                  <div className="text-xs">palavras/msg</div>
                                </div>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleOpenMemberProfile(member)}
                                >
                                  {profiledMembers.has(member.name) ? 'Ver Ficha' : 'Detalhes'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {memberChartData.length > 0 && (
                          <Card className="mt-8">
                            <CardHeader>
                              <CardTitle className="text-sm">Atividade por Membro</CardTitle>
                              <CardDescription>
                                Mensagens por dia dos 5 membros mais ativos
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={memberChartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  {topMembersList.slice(0, 5).map((member, index) => (
                                    <Bar 
                                      key={member.id}
                                      dataKey={member.name} 
                                      stackId="a" 
                                      fill={memberColors[index % memberColors.length]} 
                                    />
                                  ))}
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Nenhum membro ativo encontrado no período selecionado
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="statistics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Mensagens</CardTitle>
                      <CardDescription>
                        Comparação de atividade entre membros
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {stats?.member_stats && stats.member_stats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.member_stats.slice(0, 10).map(member => ({
                              name: member.name.length > 12 
                                ? `${member.name.substring(0, 12)}...` 
                                : member.name,
                              messages: member.message_count
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="messages" 
                              fill="#8884d8" 
                              name="Mensagens"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                                              ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center space-y-3">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <BarChart2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-muted-foreground">
                              Nenhum dado disponível
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Não há dados de membros para comparar
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Estatísticas Gerais</CardTitle>
                      <CardDescription>
                        Resumo da análise do grupo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Total de Mensagens</p>
                            <p className="text-2xl font-bold">{stats?.total_messages.toLocaleString('pt-BR') || 0}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Média Diária</p>
                            <p className="text-2xl font-bold">
                              {stats && stats.days_analyzed > 0 
                                ? Math.round(stats.total_messages / stats.days_analyzed).toLocaleString('pt-BR') 
                                : '0'}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Membros Ativos</p>
                            <p className="text-2xl font-bold">{stats?.active_members || 0}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Dias Analisados</p>
                            <p className="text-2xl font-bold">{stats?.days_analyzed || 0}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Total de Palavras</p>
                            <p className="text-2xl font-bold">{stats?.total_words?.toLocaleString('pt-BR') || 0}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Total de Mídias</p>
                            <p className="text-2xl font-bold">{stats?.total_media.toLocaleString('pt-BR') || 0}</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Período de Análise</h4>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <p className="text-muted-foreground">Início</p>
                              <p>{format(dateRange?.from || new Date(), 'dd/MM/yyyy')}</p>
                            </div>
                            <div className="text-sm text-right">
                              <p className="text-muted-foreground">Fim</p>
                              <p>{format(dateRange?.to || new Date(), 'dd/MM/yyyy')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {stats?.total_words && stats.total_words > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Palavras por Mensagem</CardTitle>
                      <CardDescription>
                        Média de palavras por mensagem enviada
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.member_stats?.slice(0, 10).map(member => ({
                            name: member.name.length > 12 
                              ? `${member.name.substring(0, 12)}...` 
                              : member.name,
                            avg: Math.round(member.avg_words_per_message * 100) / 100
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="avg" 
                            fill="#00C49F" 
                            name="Média de palavras"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Nova aba Oráculo */}
              <TabsContent value="oracle" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Oráculo de Análise</CardTitle>
                    <CardDescription>
                      Faça perguntas sobre os dados do grupo e receba insights com IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {oracleResponse && (
                      <div className="bg-muted p-4 rounded-lg mb-4">
                        <p className="text-sm whitespace-pre-line">{oracleResponse}</p>
                      </div>
                    )}
                    
                    <form onSubmit={handleOracleSubmit} className="space-y-4">
                      <Textarea
                        placeholder="Faça uma pergunta sobre os dados do seu grupo..."
                        value={oracleMessage}
                        onChange={(e) => setOracleMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isOracleLoading || !oracleMessage.trim()}
                      >
                        {isOracleLoading ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Processando...
                          </>
                        ) : (
                          <>
                            <Bot className="mr-2 h-4 w-4" />
                            Consultar Oráculo
                          </>
                        )}
                      </Button>
                    </form>
                    
                    <div className="text-xs text-muted-foreground pt-4">
                      <p>Exemplos de perguntas que você pode fazer:</p>
                      <ul className="list-disc pl-4 space-y-1 mt-2">
                        <li>Quem são os membros mais ativos do grupo?</li>
                        <li>Em quais horários o grupo está mais ativo?</li>
                        <li>Há algum padrão de comportamento no grupo?</li>
                        <li>Qual a média de palavras por mensagem dos membros?</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Modal de perfil do membro */}
            {selectedMember && profileDialogOpen && (
              <MemberProfileCard
                groupId={id}
                memberName={selectedMember.name}
                memberColor={memberColors[topMembersList.findIndex(m => m.id === selectedMember.id) % memberColors.length]}
                messageCount={selectedMember.message_count}
                wordCount={selectedMember.word_count}
                mediaCount={selectedMember.media_count}
                isProfiled={profiledMembers.has(selectedMember.name)}
                onClose={handleCloseProfile}
                onRefresh={checkProfiledMembers}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
} 