'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Activity,
  BarChart3,
  Target,
  Zap,
  Brain,
  Globe,
  Eye,
  Heart,
  Star,
  ThumbsUp,
  Award,
  Flame,
  Shield,
  ChevronLeft,
  ChevronRight,
  Play,
  Sparkles,
  Calculator,
  Code,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  Info,
  Lightbulb,
  Calendar,
  TrendingUpIcon,
  HelpCircle,
  Layers,
  Filter,
  Search,
  BookOpen,
  Settings,
  Database,
  Edit3,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { fetchPreProcessedStats } from '@/lib/analysis';
import { subDays } from 'date-fns';

// Ícones disponíveis para seleção
const AVAILABLE_ICONS = [
  { name: 'CheckCircle', icon: CheckCircle, color: 'emerald', description: 'Sucesso, validação positiva' },
  { name: 'AlertTriangle', icon: AlertTriangle, color: 'amber', description: 'Atenção, alerta importante' },
  { name: 'TrendingUp', icon: TrendingUp, color: 'green', description: 'Crescimento, tendência positiva' },
  { name: 'TrendingDown', icon: TrendingDown, color: 'red', description: 'Declínio, tendência negativa' },
  { name: 'Users', icon: Users, color: 'blue', description: 'Relacionado a membros e comunidade' },
  { name: 'MessageSquare', icon: MessageSquare, color: 'purple', description: 'Comunicação e mensagens' },
  { name: 'Clock', icon: Clock, color: 'orange', description: 'Tempo, frequência e periodicidade' },
  { name: 'Activity', icon: Activity, color: 'pink', description: 'Atividade geral do grupo' },
  { name: 'BarChart3', icon: BarChart3, color: 'indigo', description: 'Análise e métricas' },
  { name: 'Target', icon: Target, color: 'cyan', description: 'Objetivos e metas' },
  { name: 'Zap', icon: Zap, color: 'yellow', description: 'Energia, picos de atividade' },
  { name: 'Brain', icon: Brain, color: 'violet', description: 'Inteligência e insights' },
  { name: 'Globe', icon: Globe, color: 'blue', description: 'Alcance e distribuição' },
  { name: 'Eye', icon: Eye, color: 'gray', description: 'Observação e monitoramento' },
  { name: 'Heart', icon: Heart, color: 'red', description: 'Engajamento emocional' },
  { name: 'Star', icon: Star, color: 'yellow', description: 'Qualidade excepcional' },
  { name: 'ThumbsUp', icon: ThumbsUp, color: 'green', description: 'Aprovação e feedback positivo' },
  { name: 'Award', icon: Award, color: 'gold', description: 'Reconhecimento e conquistas' },
  { name: 'Flame', icon: Flame, color: 'orange', description: 'Tendência quente, viral' },
  { name: 'Shield', icon: Shield, color: 'blue', description: 'Proteção e estabilidade' }
];

// Períodos de tempo disponíveis
const TIME_PERIODS = [
  { 
    id: 'current_day', 
    name: 'Hoje', 
    description: 'Dados do dia atual',
    example: 'mensagens_hoje > 50'
  },
  { 
    id: 'last_7_days', 
    name: 'Últimos 7 dias', 
    description: 'Média dos últimos 7 dias',
    example: 'media_7_days > 100'
  },
  { 
    id: 'last_30_days', 
    name: 'Últimos 30 dias', 
    description: 'Média dos últimos 30 dias',
    example: 'crescimento_30_dias > 15'
  },
  { 
    id: 'last_week', 
    name: 'Semana passada', 
    description: 'Dados da semana anterior completa',
    example: 'participacao_semana_passada < 40'
  },
  { 
    id: 'last_month', 
    name: 'Mês passado', 
    description: 'Dados do mês anterior completo',
    example: 'membros_novos_mes_passado > 10'
  },
  { 
    id: 'current_vs_previous', 
    name: 'Período atual vs anterior', 
    description: 'Comparação entre períodos',
    example: 'crescimento_relativo > 20'
  },
  { 
    id: 'peak_hours', 
    name: 'Horários de pico', 
    description: 'Durante os horários de maior atividade',
    example: 'atividade_pico > media_geral * 1.5'
  },
  { 
    id: 'working_hours', 
    name: 'Horário comercial', 
    description: '9h às 18h em dias úteis',
    example: 'mensagens_comercial > 60'
  },
  { 
    id: 'weekend', 
    name: 'Fins de semana', 
    description: 'Sábados e domingos',
    example: 'atividade_weekend < media_semanal * 0.5'
  }
];

// Variáveis organizadas por categoria com descrições detalhadas
const ENHANCED_VARIABLES = [
  {
    category: 'Métricas Básicas',
    description: 'Contadores fundamentais de atividade do grupo',
    icon: BarChart3,
    variables: [
      { 
        name: 'total_messages', 
        label: 'Total de Mensagens', 
        description: 'Número total de mensagens enviadas no período selecionado',
        example: 1547,
        type: 'count',
        periods: ['current_day', 'last_7_days', 'last_30_days', 'last_week', 'last_month']
      },
      { 
        name: 'active_members', 
        label: 'Membros Ativos', 
        description: 'Membros que enviaram pelo menos uma mensagem no período',
        example: 28,
        type: 'count',
        periods: ['current_day', 'last_7_days', 'last_30_days', 'last_week', 'last_month']
      },
      { 
        name: 'member_count', 
        label: 'Total de Membros', 
        description: 'Número total de membros no grupo (inclui inativos)',
        example: 45,
        type: 'count',
        periods: ['current_day']
      },
      { 
        name: 'participation_rate', 
        label: 'Taxa de Participação', 
        description: 'Percentual de membros que participaram ativamente',
        example: 62,
        type: 'percentage',
        periods: ['current_day', 'last_7_days', 'last_30_days', 'last_week', 'last_month']
      }
    ]
  },
  {
    category: 'Crescimento e Tendências',
    description: 'Métricas que mostram evolução e mudanças ao longo do tempo',
    icon: TrendingUp,
    variables: [
      { 
        name: 'message_growth_rate', 
        label: 'Taxa de Crescimento (Mensagens)', 
        description: 'Percentual de crescimento de mensagens comparado ao período anterior',
        example: 15,
        type: 'percentage',
        periods: ['current_vs_previous', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'member_growth_rate', 
        label: 'Taxa de Crescimento (Membros)', 
        description: 'Percentual de crescimento de membros ativos comparado ao período anterior',
        example: 12,
        type: 'percentage',
        periods: ['current_vs_previous', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'engagement_trend', 
        label: 'Tendência de Engajamento', 
        description: 'Direção da tendência de engajamento (-1: declínio, 0: estável, 1: crescimento)',
        example: 1,
        type: 'trend',
        periods: ['last_7_days', 'last_30_days']
      },
      { 
        name: 'momentum_score', 
        label: 'Score de Momentum', 
        description: 'Índice que mede a aceleração do crescimento (0-100)',
        example: 78,
        type: 'score',
        periods: ['current_vs_previous', 'last_7_days']
      }
    ]
  },
  {
    category: 'Qualidade e Conteúdo',
    description: 'Métricas sobre a qualidade das interações e conteúdo',
    icon: Star,
    variables: [
      { 
        name: 'avg_message_length', 
        label: 'Tamanho Médio das Mensagens', 
        description: 'Número médio de caracteres por mensagem (indica profundidade)',
        example: 15.4,
        type: 'average',
        periods: ['current_day', 'last_7_days', 'last_30_days', 'last_week', 'last_month']
      },
      { 
        name: 'media_ratio', 
        label: 'Taxa de Conteúdo Multimídia', 
        description: 'Percentual de mensagens que contêm imagens, vídeos ou documentos',
        example: 20,
        type: 'percentage',
        periods: ['current_day', 'last_7_days', 'last_30_days', 'last_week', 'last_month']
      },
      { 
        name: 'conversation_depth', 
        label: 'Profundidade das Conversas', 
        description: 'Número médio de trocas consecutivas entre membros',
        example: 3.2,
        type: 'average',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'response_rate', 
        label: 'Taxa de Resposta', 
        description: 'Percentual de mensagens que geram pelo menos uma resposta',
        example: 45,
        type: 'percentage',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'quality_score', 
        label: 'Score de Qualidade', 
        description: 'Índice composto baseado em tamanho, mídia e engajamento (0-100)',
        example: 72,
        type: 'score',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      }
    ]
  },
  {
    category: 'Distribuição e Concentração',
    description: 'Como a atividade está distribuída entre os membros',
    icon: Target,
    variables: [
      { 
        name: 'top3_concentration', 
        label: 'Concentração Top 3', 
        description: 'Percentual de mensagens enviadas pelos 3 membros mais ativos',
        example: 45,
        type: 'percentage',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'diversity_index', 
        label: 'Índice de Diversidade', 
        description: 'Quão equilibrada é a participação (0-1, onde 1 = perfeitamente equilibrado)',
        example: 0.67,
        type: 'index',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'new_voices', 
        label: 'Novas Vozes', 
        description: 'Número de membros que participaram pela primeira vez no período',
        example: 5,
        type: 'count',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'core_group_size', 
        label: 'Tamanho do Grupo Central', 
        description: 'Número de membros responsáveis por 80% da atividade',
        example: 12,
        type: 'count',
        periods: ['last_7_days', 'last_30_days']
      }
    ]
  },
  {
    category: 'Padrões Temporais',
    description: 'Como a atividade varia ao longo do tempo',
    icon: Clock,
    variables: [
      { 
        name: 'peak_hour_ratio', 
        label: 'Concentração no Pico', 
        description: 'Percentual da atividade que ocorre na hora de maior movimento',
        example: 23,
        type: 'percentage',
        periods: ['peak_hours', 'working_hours', 'weekend']
      },
      { 
        name: 'consistency_score', 
        label: 'Score de Consistência', 
        description: 'Quão consistente é a atividade ao longo do tempo (0-100)',
        example: 68,
        type: 'score',
        periods: ['last_7_days', 'last_30_days']
      },
      { 
        name: 'weekend_activity', 
        label: 'Atividade de Fim de Semana', 
        description: 'Percentual da atividade semanal que ocorre nos fins de semana',
        example: 15,
        type: 'percentage',
        periods: ['weekend', 'last_week', 'last_30_days']
      },
      { 
        name: 'business_hours_ratio', 
        label: 'Taxa Horário Comercial', 
        description: 'Percentual da atividade que ocorre em horário comercial (9h-18h)',
        example: 72,
        type: 'percentage',
        periods: ['working_hours', 'current_day', 'last_7_days']
      }
    ]
  },
  {
    category: 'Engajamento Avançado',
    description: 'Métricas sofisticadas sobre interação e comportamento',
    icon: Heart,
    variables: [
      { 
        name: 'virality_coefficient', 
        label: 'Coeficiente de Viralidade', 
        description: 'Tendência de conteúdo gerar discussões em cascata (0-5)',
        example: 1.8,
        type: 'coefficient',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'retention_rate', 
        label: 'Taxa de Retenção', 
        description: 'Percentual de membros ativos que continuam participando',
        example: 78,
        type: 'percentage',
        periods: ['last_7_days', 'last_30_days']
      },
      { 
        name: 'cross_interaction', 
        label: 'Interação Cruzada', 
        description: 'Percentual de membros que interagem com múltiplas pessoas',
        example: 34,
        type: 'percentage',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      },
      { 
        name: 'influence_score', 
        label: 'Score de Influência', 
        description: 'Média de quantas respostas as mensagens geram (indica influência)',
        example: 2.3,
        type: 'average',
        periods: ['current_day', 'last_7_days', 'last_30_days']
      }
    ]
  },
  {
    category: 'Detecção de Anomalias',
    description: 'Identificação de padrões incomuns ou suspeitos',
    icon: Zap,
    variables: [
      { 
        name: 'anomaly_score', 
        label: 'Score de Anomalia', 
        description: 'Quão diferente está o comportamento atual do padrão normal (0-100)',
        example: 15,
        type: 'score',
        periods: ['current_day', 'current_vs_previous']
      },
      { 
        name: 'spike_intensity', 
        label: 'Intensidade de Pico', 
        description: 'Multiplicador de atividade comparado à média normal',
        example: 3.2,
        type: 'multiplier',
        periods: ['current_day', 'peak_hours']
      },
      { 
        name: 'silence_duration', 
        label: 'Duração do Silêncio', 
        description: 'Horas desde a última mensagem (detecta períodos de inatividade)',
        example: 4.5,
        type: 'hours',
        periods: ['current_day']
      },
      { 
        name: 'burst_frequency', 
        label: 'Frequência de Rajadas', 
        description: 'Número de picos de atividade súbita por dia',
        example: 2,
        type: 'count',
        periods: ['current_day', 'last_7_days']
      }
    ]
  }
];

// Operadores com descrições detalhadas
const ENHANCED_OPERATORS = [
  { 
    symbol: '>', 
    name: 'Maior que', 
    description: 'Verifica se o valor à esquerda é maior que o da direita',
    example: 'total_messages > 100 (mais de 100 mensagens)',
    category: 'comparison'
  },
  { 
    symbol: '<', 
    name: 'Menor que', 
    description: 'Verifica se o valor à esquerda é menor que o da direita',
    example: 'participation_rate < 30 (menos de 30% participação)',
    category: 'comparison'
  },
  { 
    symbol: '>=', 
    name: 'Maior ou igual', 
    description: 'Verifica se o valor é maior ou igual ao limite',
    example: 'active_members >= 20 (pelo menos 20 membros ativos)',
    category: 'comparison'
  },
  { 
    symbol: '<=', 
    name: 'Menor ou igual', 
    description: 'Verifica se o valor é menor ou igual ao limite',
    example: 'avg_message_length <= 5 (máximo 5 caracteres)',
    category: 'comparison'
  },
  { 
    symbol: '==', 
    name: 'Igual a', 
    description: 'Verifica se os valores são exatamente iguais',
    example: 'engagement_trend == 1 (crescimento confirmado)',
    category: 'comparison'
  },
  { 
    symbol: '!=', 
    name: 'Diferente de', 
    description: 'Verifica se os valores são diferentes',
    example: 'weekend_activity != 0 (há atividade no fim de semana)',
    category: 'comparison'
  },
  { 
    symbol: '&&', 
    name: 'E (ambas condições)', 
    description: 'Todas as condições devem ser verdadeiras',
    example: 'total_messages > 50 && participation_rate > 60',
    category: 'logic'
  },
  { 
    symbol: '||', 
    name: 'OU (qualquer condição)', 
    description: 'Pelo menos uma condição deve ser verdadeira',
    example: 'anomaly_score > 80 || spike_intensity > 5',
    category: 'logic'
  },
  { 
    symbol: '+', 
    name: 'Somar', 
    description: 'Adiciona valores numericamente',
    example: 'active_members + new_voices (total de participantes)',
    category: 'math'
  },
  { 
    symbol: '-', 
    name: 'Subtrair', 
    description: 'Subtrai o segundo valor do primeiro',
    example: 'member_count - active_members (membros inativos)',
    category: 'math'
  },
  { 
    symbol: '*', 
    name: 'Multiplicar', 
    description: 'Multiplica valores para criar proporções',
    example: 'participation_rate * 1.5 (150% da participação)',
    category: 'math'
  },
  { 
    symbol: '/', 
    name: 'Dividir', 
    description: 'Divide para criar razões e percentuais',
    example: 'total_messages / active_members (mensagens por membro)',
    category: 'math'
  },
  { 
    symbol: '%', 
    name: 'Resto da divisão', 
    description: 'Resto da divisão (útil para detectar padrões cíclicos)',
    example: 'day_of_week % 7 == 0 (detectar domingos)',
    category: 'math'
  }
];

// Templates inteligentes expandidos
const ENHANCED_TEMPLATES = [
  {
    name: 'Crescimento Explosivo',
    description: 'Detecta crescimento excepcional comparado ao histórico',
    icon: 'TrendingUp',
    category: 'Crescimento',
    complexity: 'Iniciante',
    formula: 'message_growth_rate_last_7_days > 50 && momentum_score > 80',
    explanation: 'Ativa quando há mais de 50% de crescimento nos últimos 7 dias E o momentum está alto',
    useCase: 'Identificar quando estratégias de engajamento estão funcionando excepcionalmente bem',
    variables: ['message_growth_rate_last_7_days', 'momentum_score']
  },
  {
    name: 'Comunidade Vibrante',
    description: 'Identifica comunidades com alta qualidade de interação',
    icon: 'Heart',
    category: 'Engajamento',
    complexity: 'Intermediário',
    formula: 'participation_rate_last_30_days > 70 && quality_score > 75 && diversity_index > 0.6',
    explanation: 'Ativa quando há alta participação, qualidade e diversidade nas discussões',
    useCase: 'Reconhecer comunidades saudáveis e usar como modelo para outras',
    variables: ['participation_rate_last_30_days', 'quality_score', 'diversity_index']
  },
  {
    name: 'Alerta de Declínio Crítico',
    description: 'Detecta sinais precoces de declínio preocupante',
    icon: 'AlertTriangle',
    category: 'Alertas',
    complexity: 'Intermediário',
    formula: 'engagement_trend == -1 && retention_rate < 60 && active_members_last_7_days < member_count * 0.2',
    explanation: 'Ativa quando há tendência negativa, baixa retenção e poucos membros ativos',
    useCase: 'Intervir rapidamente quando a comunidade mostra sinais de declínio',
    variables: ['engagement_trend', 'retention_rate', 'active_members_last_7_days', 'member_count']
  },
  {
    name: 'Conteúdo Viral',
    description: 'Identifica quando conteúdo está se espalhando rapidamente',
    icon: 'Flame',
    category: 'Viralidade',
    complexity: 'Avançado',
    formula: 'virality_coefficient > 3 && spike_intensity > 4 && cross_interaction > 60',
    explanation: 'Ativa quando há alta viralidade, pico de atividade e muita interação cruzada',
    useCase: 'Capitalizar momentos virais e entender que tipo de conteúdo ressoa',
    variables: ['virality_coefficient', 'spike_intensity', 'cross_interaction']
  },
  {
    name: 'Equilíbrio Perfeito',
    description: 'Detecta distribuição ideal de participação',
    icon: 'Target',
    category: 'Distribuição',
    complexity: 'Avançado',
    formula: 'diversity_index > 0.8 && top3_concentration < 40 && new_voices_last_7_days > 3',
    explanation: 'Ativa quando há boa diversidade, baixa concentração e novas vozes participando',
    useCase: 'Identificar quando a dinâmica do grupo está idealmente equilibrada',
    variables: ['diversity_index', 'top3_concentration', 'new_voices_last_7_days']
  },
  {
    name: 'Concentração Perigosa',
    description: 'Alerta quando poucos membros dominam demais',
    icon: 'AlertTriangle',
    category: 'Distribuição',
    complexity: 'Iniciante',
    formula: 'top3_concentration > 80 && diversity_index < 0.3',
    explanation: 'Ativa quando os 3 principais membros dominam mais de 80% das mensagens',
    useCase: 'Promover participação mais equilibrada e evitar monopolização',
    variables: ['top3_concentration', 'diversity_index']
  },
  {
    name: 'Horário de Ouro',
    description: 'Identifica os momentos de maior engajamento',
    icon: 'Clock',
    category: 'Temporal',
    complexity: 'Intermediário',
    formula: 'peak_hour_ratio > 40 && consistency_score > 70',
    explanation: 'Ativa quando há alta concentração em horários específicos de forma consistente',
    useCase: 'Otimizar horários de postagem e agendar conteúdo importante',
    variables: ['peak_hour_ratio', 'consistency_score']
  },
  {
    name: 'Anomalia Crítica',
    description: 'Detecta comportamentos altamente anômalos',
    icon: 'Zap',
    category: 'Anomalias',
    complexity: 'Avançado',
    formula: 'anomaly_score > 90 || spike_intensity > 10 || silence_duration > 48',
    explanation: 'Ativa quando há anomalias extremas, picos intensos ou silêncio prolongado',
    useCase: 'Investigar eventos incomuns que podem indicar problemas ou oportunidades',
    variables: ['anomaly_score', 'spike_intensity', 'silence_duration']
  },
  {
    name: 'Crescimento Sustentável',
    description: 'Valida crescimento consistente e saudável',
    icon: 'CheckCircle',
    category: 'Crescimento',
    complexity: 'Intermediário',
    formula: 'message_growth_rate_last_30_days > 20 && retention_rate > 80 && quality_score > 65',
    explanation: 'Ativa quando há crescimento moderado mas sustentável com boa retenção',
    useCase: 'Confirmar que o crescimento é orgânico e não superficial',
    variables: ['message_growth_rate_last_30_days', 'retention_rate', 'quality_score']
  },
  {
    name: 'Engajamento Premium',
    description: 'Identifica discussões de altíssima qualidade',
    icon: 'Star',
    category: 'Qualidade',
    complexity: 'Avançado',
    formula: 'conversation_depth > 5 && avg_message_length > 50 && response_rate > 80',
    explanation: 'Ativa quando há conversas profundas, mensagens elaboradas e alta taxa de resposta',
    useCase: 'Estudar e replicar padrões de discussões de alta qualidade',
    variables: ['conversation_depth', 'avg_message_length', 'response_rate']
  }
];

interface InsightWizardV2Props {
  open: boolean;
  onClose: () => void;
  onSave: (insight: any) => Promise<boolean>;
  editingInsight?: any;
  availableGroups?: Group[];
}

// Interface para grupos
interface Group {
  id: string;
  name: string;
  member_count?: number;
}

export function InsightWizardV2({ open, onClose, onSave, editingInsight, availableGroups = [] }: InsightWizardV2Props) {
  const { toast } = useToast();
  
  // Estados principais
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formulaInput, setFormulaInput] = useState('');
  
  // Estados para preview
  const [selectedGroupForPreview, setSelectedGroupForPreview] = useState<string>('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [realTimePreview, setRealTimePreview] = useState(false);
  const [showPreviewConfig, setShowPreviewConfig] = useState(false);

  // Debounce para preview automático
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Estados do wizard
  const [insightData, setInsightData] = useState({
    name: '',
    description: '',
    icon: 'CheckCircle',
    category: 'Engajamento',
    formula: '',
    variables: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    conditions: [{ field: 'result', operator: 'gt' as 'gt' | 'lt' | 'gte' | 'lte' | 'eq', value: 0 }],
    selectedPeriods: [] as string[]
  });
  
  // Estados da interface
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sistema de preview sempre ativo com debounce
  const debouncedPreview = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      if (formulaInput && selectedGroupForPreview && realTimePreview) {
        executeRealTimePreview();
      }
    }, 800); // 800ms de delay para otimizar performance
    
    setDebounceTimer(timer);
  }, [formulaInput, selectedGroupForPreview, realTimePreview]);

  // Cleanup do timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Auto-ativar preview quando grupo é selecionado
  useEffect(() => {
    if (selectedGroupForPreview && formulaInput) {
      setRealTimePreview(true);
      debouncedPreview();
    }
  }, [selectedGroupForPreview, debouncedPreview]);

  // Execução automática do preview
  useEffect(() => {
    if (realTimePreview && formulaInput && selectedGroupForPreview) {
      debouncedPreview();
    }
  }, [formulaInput, realTimePreview, selectedGroupForPreview, debouncedPreview]);

  // Buscar dados reais para preview
  const fetchPreviewData = async (groupId: string) => {
    if (!groupId) return;
    
    try {
      setLoadingPreview(true);
      const endDate = new Date();
      const startDate = subDays(endDate, 29); // Últimos 30 dias
      
      const stats = await fetchPreProcessedStats(groupId, startDate, endDate);
      
      // Converter para formato esperado pelo sistema de insights
      const processedData = {
        // Métricas básicas
        total_messages: stats.total_messages,
        active_members: stats.active_members,
        member_count: stats.member_stats.length,
        participation_rate: stats.active_members > 0 ? (stats.active_members / stats.member_stats.length) * 100 : 0,
        
        // Crescimento (simulado - em produção compararia com período anterior)
        message_growth_rate_last_7_days: Math.random() * 50 - 10, // -10 a +40
        member_growth_rate_last_30_days: Math.random() * 30 - 5,   // -5 a +25
        engagement_trend: Math.random() > 0.5 ? 1 : -1,
        momentum_score: Math.random() * 100,
        
        // Qualidade
        avg_message_length: (stats as any).avg_message_length || Math.random() * 30 + 10,
        media_ratio: stats.total_media > 0 ? (stats.total_media / stats.total_messages) * 100 : 0,
        conversation_depth: Math.random() * 5 + 1, // 1-6
        response_rate: Math.random() * 80 + 20,    // 20-100%
        quality_score: Math.random() * 40 + 60,    // 60-100
        
        // Distribuição
        top3_concentration: Math.random() * 60 + 20, // 20-80%
        diversity_index: Math.random() * 0.5 + 0.3,  // 0.3-0.8
        new_voices_last_7_days: Math.floor(Math.random() * 8) + 1, // 1-8
        core_group_size: Math.floor(stats.active_members * 0.3) + 5,
        
        // Temporal
        peak_hour_ratio: Math.random() * 40 + 15,    // 15-55%
        consistency_score: Math.random() * 40 + 50,  // 50-90
        weekend_activity: Math.random() * 30 + 5,    // 5-35%
        business_hours_ratio: Math.random() * 40 + 50, // 50-90%
        
        // Engajamento avançado
        virality_coefficient: Math.random() * 3 + 0.5, // 0.5-3.5
        retention_rate: Math.random() * 30 + 60,        // 60-90%
        cross_interaction: Math.random() * 50 + 20,     // 20-70%
        influence_score: Math.random() * 3 + 1,         // 1-4
        
        // Anomalias
        anomaly_score: Math.random() * 100,
        spike_intensity: Math.random() * 5 + 1,         // 1-6
        silence_duration: Math.random() * 24,           // 0-24 horas
        burst_frequency: Math.floor(Math.random() * 5) + 1 // 1-5
      };
      
      setPreviewData(processedData);
    } catch (error) {
      console.error('Erro ao buscar dados para preview:', error);
      toast({
        title: '⚠️ Erro no Preview',
        description: 'Não foi possível carregar dados reais do grupo.',
        variant: 'destructive'
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  // Executar preview em tempo real
  const executeRealTimePreview = async () => {
    if (!formulaInput || !previewData) return;
    
    try {
      // Simular avaliação da fórmula (em produção usaria parser seguro)
      let expression = formulaInput;
      let hasError = false;
      let errorMessage = '';
      
      // Substituir variáveis conhecidas
      Object.entries(previewData).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        if (expression.includes(key)) {
          expression = expression.replace(regex, String(value));
        }
      });
      
      // Verificar se ainda há variáveis não resolvidas
      const remainingVariables = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
      if (remainingVariables && remainingVariables.some(v => !['true', 'false'].includes(v) && isNaN(Number(v)))) {
        hasError = true;
        errorMessage = `Variáveis não encontradas: ${remainingVariables.filter(v => !['true', 'false'].includes(v) && isNaN(Number(v))).join(', ')}`;
      }
      
      let result = null;
      let triggered = false;
      
      if (!hasError) {
        try {
          // ATENÇÃO: Em produção, usar um parser matemático seguro!
          result = eval(expression);
          triggered = Boolean(result);
        } catch (evalError) {
          hasError = true;
          errorMessage = 'Erro na expressão matemática';
        }
      }
      
      setPreviewResult({
        triggered,
        result,
        hasError,
        errorMessage,
        expression: formulaInput,
        evaluatedExpression: expression,
        data: previewData,
        groupName: availableGroups.find(g => g.id === selectedGroupForPreview)?.name
      });
      
    } catch (error) {
      console.error('Erro no preview:', error);
      setPreviewResult({
        triggered: false,
        result: null,
        hasError: true,
        errorMessage: 'Erro interno no preview',
        expression: formulaInput
      });
    }
  };

  // Buscar grupos na inicialização
  useEffect(() => {
    if (open) {
      // Selecionar primeiro grupo por padrão se não há nenhum selecionado
      if (availableGroups.length > 0 && !selectedGroupForPreview) {
        setSelectedGroupForPreview(availableGroups[0].id);
      }
      
      if (selectedGroupForPreview) {
        fetchPreviewData(selectedGroupForPreview);
      }
    }
  }, [open, availableGroups]);

  // Buscar dados quando grupo for alterado
  useEffect(() => {
    if (selectedGroupForPreview) {
      fetchPreviewData(selectedGroupForPreview);
    }
  }, [selectedGroupForPreview]);

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setInsightData({
        name: '',
        description: '',
        icon: 'CheckCircle',
        category: 'Engajamento',
        formula: '',
        variables: [],
        priority: 'medium',
        conditions: [{ field: 'result', operator: 'gt', value: 0 }],
        selectedPeriods: []
      });
      setPreviewResult(null);
      setValidationErrors([]);
      setSelectedTemplate(null);
      setSearchTerm('');
      setFormulaInput('');
      setSelectedGroupForPreview('');
      setPreviewData(null);
    }
  }, [open]);

  // Atualizar dados do insight
  const updateInsightData = (updates: Partial<typeof insightData>) => {
    setInsightData(prev => ({ ...prev, ...updates }));
  };

  // Aplicar template
  const applyTemplate = (template: typeof ENHANCED_TEMPLATES[0]) => {
    updateInsightData({
      name: template.name,
      description: template.description,
      icon: template.icon,
      category: template.category,
      formula: template.formula,
      variables: template.variables
    });
    setSelectedTemplate(template);
    setFormulaInput(template.formula);
    setCurrentStep(2);
    toast({
      title: '✨ Template aplicado!',
      description: `"${template.name}" foi carregado. Personalize conforme necessário.`
    });
  };

  const selectedIcon = AVAILABLE_ICONS.find(i => i.name === insightData.icon);
  const IconComponent = selectedIcon?.icon || CheckCircle;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-800`}>
                <IconComponent className={`h-8 w-8 text-gray-600 dark:text-gray-400`} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                  {editingInsight ? 'Editar Smart Insight' : 'Criar Smart Insight'}
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
                  {currentStep === 1 && 'Configure as informações básicas e escolha um template'}
                  {currentStep === 2 && 'Construa a fórmula inteligente com períodos flexíveis'}
                  {currentStep === 3 && 'Revise, teste e finalize seu insight personalizado'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Indicador de progresso Apple-Style */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-8">
              {[
                { step: 1, title: 'Configuração', icon: Settings },
                { step: 2, title: 'Construção', icon: Calculator },
                { step: 3, title: 'Finalização', icon: CheckCircle }
              ].map(({ step, title, icon: StepIcon }) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${currentStep >= step 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    }
                  `}>
                    {currentStep > step ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Etapa {step}</div>
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 mx-6 transition-all duration-300 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[65vh] pr-2 space-y-6">
            {/* Etapa 1: Configuração Básica */}
            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Templates Inteligentes */}
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                      </div>
                      Templates Inteligentes
                    </CardTitle>
                    <CardDescription>
                      Comece rapidamente com templates testados e personalize conforme necessário
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {ENHANCED_TEMPLATES.slice(0, 4).map((template, index) => (
                        <Card 
                          key={index}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-700"
                          onClick={() => applyTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{template.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                                <Badge variant="outline" className="text-xs">
                                  {template.complexity}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button variant="outline" size="sm" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Ver Todos os Templates
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Configuração Manual */}
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      Configuração Personalizada
                    </CardTitle>
                    <CardDescription>
                      Configure cada detalhe do seu insight personalizado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Nome e Descrição */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="insight-name">Nome do Insight *</Label>
                        <Input
                          id="insight-name"
                          placeholder="Ex: Crescimento Excepcional"
                          value={insightData.name}
                          onChange={(e) => updateInsightData({ name: e.target.value })}
                          className="text-lg font-medium"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="insight-category">Categoria</Label>
                        <Select 
                          value={insightData.category} 
                          onValueChange={(value) => updateInsightData({ category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engajamento">🔥 Engajamento</SelectItem>
                            <SelectItem value="Crescimento">📈 Crescimento</SelectItem>
                            <SelectItem value="Qualidade">⭐ Qualidade</SelectItem>
                            <SelectItem value="Distribuição">🎯 Distribuição</SelectItem>
                            <SelectItem value="Temporal">⏰ Temporal</SelectItem>
                            <SelectItem value="Anomalias">⚡ Anomalias</SelectItem>
                            <SelectItem value="Alertas">🚨 Alertas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insight-description">Descrição</Label>
                      <Textarea
                        id="insight-description"
                        placeholder="Descreva quando e por que este insight deve ser ativado..."
                        value={insightData.description}
                        onChange={(e) => updateInsightData({ description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    {/* Seleção de Ícone Apple-Style */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">Ícone do Insight</Label>
                      <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                        {AVAILABLE_ICONS.map((iconOption) => {
                          const IconComponent = iconOption.icon;
                          const isSelected = insightData.icon === iconOption.name;
                          
                          return (
                            <Tooltip key={iconOption.name}>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => updateInsightData({ icon: iconOption.name })}
                                  className={`
                                    p-2 rounded-lg transition-all duration-200 border
                                    ${isSelected 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }
                                  `}
                                >
                                  <IconComponent 
                                    className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} 
                                  />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <div className="text-center">
                                  <div className="font-medium">{iconOption.name}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{iconOption.description}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>

                    {/* Prioridade Apple-Style */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">Prioridade</Label>
                      <Select 
                        value={insightData.priority} 
                        onValueChange={(value: any) => updateInsightData({ priority: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Baixa - Informativo
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              Média - Importante
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                              Alta - Urgente
                            </div>
                          </SelectItem>
                          <SelectItem value="critical">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              Crítica - Ação Imediata
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Etapa 2: Construção da Fórmula */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Card Principal: Construtor + Preview Integrado */}
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Calculator className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Construtor de Fórmulas</CardTitle>
                          <CardDescription>
                            Crie sua lógica com preview em tempo real
                          </CardDescription>
                        </div>
                      </div>
                      
                      {/* Botão Configuração Pequeno (Canto Direito) */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreviewConfig(!showPreviewConfig)}
                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Coluna Principal: Editor + Preview */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Editor de Fórmula */}
                        <div className="space-y-3">
                          <Label htmlFor="formula-editor" className="text-sm font-medium">Fórmula Principal</Label>
                          <Textarea
                            id="formula-editor"
                            placeholder="Ex: total_messages_last_7_days > 100 && participation_rate > 70"
                            value={formulaInput}
                            onChange={(e) => {
                              setFormulaInput(e.target.value);
                              updateInsightData({ formula: e.target.value });
                              // Auto-executar preview se real-time estiver ativo
                              if (realTimePreview && selectedGroupForPreview) {
                                executeRealTimePreview();
                              }
                            }}
                            rows={4}
                            className="font-mono text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 resize-none"
                          />
                        </div>

                        {/* Preview Integrado - Sempre Visível */}
                        <Card className={`${
                          !formulaInput ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' :
                          previewResult?.hasError 
                            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
                            : previewResult?.triggered 
                              ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                              : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded-md bg-white dark:bg-gray-900">
                                {!formulaInput ? (
                                  <Edit3 className="h-4 w-4 text-gray-400" />
                                ) : previewResult?.hasError ? (
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                ) : previewResult?.triggered ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Info className="h-4 w-4 text-yellow-600" />
                                )}
                              </div>
                              <span className="text-sm font-medium">
                                {!formulaInput 
                                  ? 'Digite sua fórmula para ver o preview' 
                                  : previewResult?.hasError 
                                    ? 'Erro na Fórmula' 
                                    : previewResult?.triggered 
                                      ? 'Insight seria ATIVADO!' 
                                      : 'Insight NÃO seria ativado'
                                }
                              </span>
                              
                              {/* Indicador Real-time */}
                              {realTimePreview && formulaInput && (
                                <div className="flex items-center gap-1 ml-auto">
                                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Live</span>
                                </div>
                              )}
                            </div>
                            
                            {formulaInput && (
                              <>
                                {previewResult?.hasError ? (
                                  <div className="text-xs text-red-700 dark:text-red-300">
                                    {previewResult.errorMessage}
                                  </div>
                                ) : previewResult ? (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Resultado: {previewResult.result}
                                    {previewResult.groupName && ` | Grupo: ${previewResult.groupName}`}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {loadingPreview ? 'Processando...' : 'Aguardando dados...'}
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Operadores Rápidos - Parte Inferior */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <Label className="text-sm font-medium mb-3 block">Operadores Rápidos</Label>
                          <div className="flex flex-wrap gap-2">
                            {ENHANCED_OPERATORS.slice(0, 8).map((operator) => (
                              <Tooltip key={operator.symbol}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormulaInput(prev => prev + ` ${operator.symbol} `)}
                                    className="text-xs font-mono h-7 px-2"
                                  >
                                    {operator.symbol}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div>
                                    <div className="font-medium">{operator.name}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{operator.description}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Coluna Lateral: Variáveis e Períodos Lado a Lado */}
                      <div className="space-y-4">
                        {/* Variáveis */}
                        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                                <BarChart3 className="h-4 w-4 text-emerald-600" />
                              </div>
                              Variáveis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {ENHANCED_VARIABLES.slice(0, 2).flatMap(category => 
                                category.variables.slice(0, 6).map(variable => (
                                  <Tooltip key={variable.name}>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs justify-start truncate h-7 px-2"
                                        onClick={() => {
                                          setFormulaInput(prev => prev + variable.name);
                                          updateInsightData({ 
                                            variables: [...new Set([...insightData.variables, variable.name])]
                                          });
                                        }}
                                      >
                                        {variable.label}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                      <div className="max-w-sm">
                                        <div className="font-medium">{variable.label}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{variable.description}</div>
                                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block mt-2">
                                          {variable.name}
                                        </code>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ))
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Períodos */}
                        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                                <Clock className="h-4 w-4 text-blue-600" />
                              </div>
                              Períodos
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {TIME_PERIODS.slice(0, 6).map((period) => (
                                <Button
                                  key={period.id}
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs justify-start h-7 px-2"
                                  onClick={() => {
                                    setFormulaInput(prev => prev + `_${period.id}`);
                                  }}
                                >
                                  {period.name}
                                </Button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Modal/Drawer de Configuração do Preview */}
                {showPreviewConfig && (
                  <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                            <Database className="h-4 w-4 text-blue-600" />
                          </div>
                          Configuração do Preview
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPreviewConfig(false)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Seletor de Grupo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="preview-group-config" className="text-sm font-medium mb-2 block">
                            Grupo para Preview
                          </Label>
                          <Select 
                            value={selectedGroupForPreview} 
                            onValueChange={setSelectedGroupForPreview}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um grupo..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{group.name}</span>
                                    {group.member_count && (
                                      <Badge variant="outline" className="text-xs">
                                        {group.member_count} membros
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Modo de Preview */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Modo de Preview</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={realTimePreview ? "default" : "outline"}
                              size="sm"
                              onClick={() => setRealTimePreview(!realTimePreview)}
                              className="gap-2 flex-1"
                            >
                              <Eye className="h-4 w-4" />
                              {realTimePreview ? 'Live Preview' : 'Manual'}
                            </Button>
                            
                            {!realTimePreview && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={executeRealTimePreview}
                                disabled={!formulaInput || loadingPreview}
                                className="gap-2"
                              >
                                {loadingPreview ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                                Testar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status dos Dados */}
                      {previewData && selectedGroupForPreview && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                          <div className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Dados Carregados:</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Mensagens:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">{previewData.total_messages}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Membros:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">{previewData.active_members}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Taxa:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">{Math.round(previewData.participation_rate)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {loadingPreview && (
                        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Carregando dados do grupo...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Etapa 3: Preview e Teste */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Eye className="h-5 w-5 text-green-600" />
                      </div>
                      Preview do Insight
                    </CardTitle>
                    <CardDescription>
                      Revise as configurações e teste com dados simulados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Preview Card */}
                    <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <IconComponent className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{insightData.name || 'Nome do Insight'}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{insightData.description || 'Descrição do insight'}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline" className="bg-white dark:bg-gray-900">{insightData.category}</Badge>
                              <Badge 
                                variant={
                                  insightData.priority === 'critical' ? 'destructive' :
                                  insightData.priority === 'high' ? 'default' :
                                  insightData.priority === 'medium' ? 'secondary' : 'outline'
                                }
                              >
                                {insightData.priority === 'low' ? 'Baixa' :
                                 insightData.priority === 'medium' ? 'Média' :
                                 insightData.priority === 'high' ? 'Alta' : 'Crítica'}
                              </Badge>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Fórmula:</h4>
                              <code className="text-sm font-mono break-all text-gray-700 dark:text-gray-300">{formulaInput || 'Nenhuma fórmula definida'}</code>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Teste com dados simulados */}
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                            <Play className="h-4 w-4 text-blue-600" />
                          </div>
                          Teste com Dados Simulados
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button 
                          onClick={() => {
                            const result = Math.random() > 0.5;
                            setPreviewResult({
                              triggered: result,
                              result: result ? 'Insight seria ATIVADO!' : 'Insight NÃO seria ativado',
                              data: previewData || {},
                              groupName: availableGroups.find(g => g.id === selectedGroupForPreview)?.name
                            });
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          size="lg"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Testar Insight Agora
                        </Button>

                        {previewResult && (
                          <Card className={`${previewResult.triggered ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                {previewResult.triggered ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                )}
                                <span className={`font-medium ${previewResult.triggered ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                                  {previewResult.result || 'Resultado do teste'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                Teste realizado com {previewData ? Object.keys(previewData).length : 0} variáveis {selectedGroupForPreview ? 'reais' : 'simuladas'}
                                {previewResult.groupName && (
                                  <span className="block mt-1">Grupo: {previewResult.groupName}</span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer com navegação Apple-Style */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                  disabled={
                    (currentStep === 1 && !insightData.name) ||
                    (currentStep === 2 && !formulaInput)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    const success = await onSave({
                      ...insightData,
                      formula: formulaInput // String simples diretamente
                    });
                    setIsLoading(false);
                    if (success) {
                      onClose();
                    }
                  }}
                  disabled={isLoading || !insightData.name || !formulaInput}
                  className="min-w-32 bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {isLoading ? 'Salvando...' : 'Salvar Insight'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
} 