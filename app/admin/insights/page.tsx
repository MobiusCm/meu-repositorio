'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Brain,
  Settings,
  Users,
  BarChart3,
  Bell,
  Filter,
  Search,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Activity,
  Globe,
  MessageSquare,
  X,
  Database,
  Eye
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useInsightPreferences } from '@/hooks/use-insight-preferences';
import { useCustomInsights } from '@/hooks/use-custom-insights';
import { InsightType } from '@/lib/insights-engine';
import { FormulaBuilder } from '@/components/formula-builder';
import { DataAnalyzer } from '@/components/data-analyzer';
import { NativeInsightConfigurator } from '@/components/native-insight-configurator';
import { InsightWizard } from '@/components/insight-wizard';
import Link from 'next/link';

// Tipos de insights disponíveis com metadados
const AVAILABLE_INSIGHTS: Array<{
  type: InsightType;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  defaultEnabled: boolean;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}> = [
  {
    type: 'participation_excellence',
    name: 'Excelência de Participação',
    description: 'Detecta grupos com alta participação dos membros',
    category: 'Engajamento',
    icon: CheckCircle,
    defaultEnabled: true,
    difficulty: 'basic'
  },
  {
    type: 'participation_decline',
    name: 'Declínio de Participação',
    description: 'Alerta quando a participação está diminuindo',
    category: 'Engajamento',
    icon: AlertTriangle,
    defaultEnabled: true,
    difficulty: 'basic'
  },
  {
    type: 'activity_peak',
    name: 'Picos de Atividade',
    description: 'Identifica dias com atividade excepcionalmente alta',
    category: 'Atividade',
    icon: TrendingUp,
    defaultEnabled: true,
    difficulty: 'basic'
  },
  {
    type: 'growth_trend',
    name: 'Tendência de Crescimento',
    description: 'Analisa tendências de crescimento do grupo',
    category: 'Crescimento',
    icon: BarChart3,
    defaultEnabled: true,
    difficulty: 'intermediate'
  },
  {
    type: 'engagement_pattern',
    name: 'Padrões de Engajamento',
    description: 'Analisa como os membros interagem',
    category: 'Engajamento',
    icon: Users,
    defaultEnabled: false,
    difficulty: 'intermediate'
  },
  {
    type: 'member_concentration',
    name: 'Concentração de Membros',
    description: 'Verifica se poucos membros dominam as conversas',
    category: 'Distribuição',
    icon: Target,
    defaultEnabled: false,
    difficulty: 'intermediate'
  },
  {
    type: 'time_pattern',
    name: 'Padrões Temporais',
    description: 'Analisa horários de maior atividade',
    category: 'Temporal',
    icon: Clock,
    defaultEnabled: false,
    difficulty: 'advanced'
  },
  {
    type: 'content_quality',
    name: 'Qualidade do Conteúdo',
    description: 'Avalia a qualidade das mensagens',
    category: 'Qualidade',
    icon: MessageSquare,
    defaultEnabled: false,
    difficulty: 'advanced'
  },
  {
    type: 'anomaly_detection',
    name: 'Detecção de Anomalias',
    description: 'Detecta comportamentos anômalos',
    category: 'Anomalias',
    icon: Zap,
    defaultEnabled: false,
    difficulty: 'advanced'
  }
];

interface Group {
  id: string;
  name: string;
  member_count?: number;
}

export default function AdminInsightsPage() {
  const { toast } = useToast();
  const {
    preferences,
    loading: preferencesLoading,
    toggleInsight,
    updateThreshold,
    updateNotifications,
    isInsightEnabled,
    bulkToggle
  } = useInsightPreferences();

  const {
    insights: customInsights,
    loading: customInsightsLoading,
    saveCustomInsight
  } = useCustomInsights();

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para configuração
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [selectedInsightForConfig, setSelectedInsightForConfig] = useState<{
    type: InsightType;
    groupId: string;
  } | null>(null);

  // Novos estados para controlar a exibição dos configuradores e do analisador de dados
  const [showCustomInsightForm, setShowCustomInsightForm] = useState(false);
  const [editingInsight, setEditingInsight] = useState<any>(null);
  const [showDataAnalyzer, setShowDataAnalyzer] = useState(false);
  const [configuringNativeInsight, setConfiguringNativeInsight] = useState<string | null>(null);

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

  // Filtrar insights baseado nos filtros
  const filteredInsights = AVAILABLE_INSIGHTS.filter(insight => {
    const matchesSearch = insight.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Categorias únicas
  const categories = Array.from(new Set(AVAILABLE_INSIGHTS.map(i => i.category)));

  // Estatísticas
  const totalInsights = AVAILABLE_INSIGHTS.length;
  const enabledInsights = AVAILABLE_INSIGHTS.reduce((count, insight) => {
    if (selectedGroup === 'all') {
      // Contar quantos grupos têm este insight ativado
      return count + groups.filter(group => isInsightEnabled(insight.type, group.id)).length;
    } else {
      return count + (isInsightEnabled(insight.type, selectedGroup) ? 1 : 0);
    }
  }, 0);

  // Toggle para todos os insights de uma categoria
  const toggleCategory = async (category: string, enabled: boolean) => {
    const categoryInsights = filteredInsights.filter(i => i.category === category);
    const targetGroups = selectedGroup === 'all' ? groups : groups.filter(g => g.id === selectedGroup);
    
    const updates = [];
    for (const insight of categoryInsights) {
      for (const group of targetGroups) {
        updates.push({
          insightType: insight.type,
          groupId: group.id,
          enabled
        });
      }
    }

    const success = await bulkToggle(updates);
    if (success) {
      toast({
        title: enabled ? 'Categoria ativada' : 'Categoria desativada',
        description: `Todos os insights da categoria "${category}" foram ${enabled ? 'ativados' : 'desativados'}.`,
      });
    }
  };

  // Componente para card de insight configurável
  const InsightCard = ({ insight, groupId }: { insight: typeof AVAILABLE_INSIGHTS[0], groupId: string }) => {
    const enabled = isInsightEnabled(insight.type, groupId);
    const IconComponent = insight.icon;
    const group = groups.find(g => g.id === groupId);

    return (
      <Card className={`transition-all duration-200 ${enabled ? 'ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20' : 'opacity-70'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${enabled ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <IconComponent className={`h-5 w-5 ${enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">{insight.name}</CardTitle>
                <CardDescription className="text-xs">{insight.description}</CardDescription>
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => toggleInsight(insight.type, groupId, checked)}
              disabled={preferencesLoading}
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <Badge variant="outline" className="text-xs">
              {insight.category}
            </Badge>
            <Badge variant={insight.difficulty === 'basic' ? 'default' : insight.difficulty === 'intermediate' ? 'secondary' : 'destructive'} className="text-xs">
              {insight.difficulty === 'basic' ? 'Básico' : insight.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
            </Badge>
          </div>
          
          {selectedGroup !== 'all' && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSelectedInsightForConfig({ type: insight.type, groupId });
                  setThresholdDialogOpen(true);
                }}
                disabled={!enabled}
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
            </div>
          )}
          
          {selectedGroup === 'all' && group && (
            <div className="text-xs text-muted-foreground mt-2">
              Grupo: {group.name}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Badge 
                variant={insight.difficulty === 'basic' ? 'default' : insight.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {insight.difficulty === 'basic' ? 'Básico' : insight.difficulty === 'intermediate' ? 'Inter.' : 'Avançado'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {insight.category}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setConfiguringNativeInsight(insight.type)}
                title="Configurar parâmetros"
              >
                <Settings className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setSelectedInsightForConfig({ type: insight.type, groupId })}
                title="Configurar thresholds"
              >
                <Target className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || preferencesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Carregando painel administrativo...</h3>
          <p className="text-muted-foreground">Aguarde enquanto carregamos suas configurações</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração de Insights</h1>
          <p className="text-muted-foreground">
            Configure e personalize os insights inteligentes para seus grupos
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCustomInsightForm(true)}>
          <Plus className="h-4 w-4" />
          Criar Insight Customizado
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInsights}</div>
            <p className="text-xs text-muted-foreground">Tipos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{enabledInsights}</div>
            <p className="text-xs text-muted-foreground">
              {selectedGroup === 'all' ? 'Ativações totais' : 'Ativados neste grupo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">Grupos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categorias de insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Adoção</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((enabledInsights / (totalInsights * (selectedGroup === 'all' ? groups.length : 1))) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Taxa de Adoção</div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação Rápida */}
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => setShowDataAnalyzer(true)}
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Database className="h-4 w-4 mr-2" />
            Explorar Dados
          </Button>
          
          <Button 
            onClick={() => setShowCustomInsightForm(true)}
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Insight
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Link href="/admin/insights/custom">
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="group-filter">Grupo</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os grupos</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-filter">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ações em lote</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedCategory !== 'all') {
                      toggleCategory(selectedCategory, true);
                    }
                  }}
                  disabled={selectedCategory === 'all'}
                >
                  Ativar categoria
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedCategory !== 'all') {
                      toggleCategory(selectedCategory, false);
                    }
                  }}
                  disabled={selectedCategory === 'all'}
                >
                  Desativar categoria
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Insights Disponíveis ({filteredInsights.length})
          </h2>
        </div>

        {selectedGroup === 'all' ? (
          // Visualização por grupo quando "todos" está selecionado
          <div className="space-y-6">
            {groups.map(group => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>
                    {group.member_count ? `${group.member_count} membros` : 'Grupo'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredInsights.map(insight => (
                      <InsightCard
                        key={`${insight.type}-${group.id}`}
                        insight={insight}
                        groupId={group.id}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Visualização por insight quando um grupo específico está selecionado
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInsights.map(insight => (
              <InsightCard
                key={insight.type}
                insight={insight}
                groupId={selectedGroup}
              />
            ))}
          </div>
        )}

        {filteredInsights.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum insight encontrado</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Não foram encontrados insights com os filtros selecionados. 
                Tente ajustar os filtros ou busca.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de configuração de threshold */}
      <Dialog open={thresholdDialogOpen} onOpenChange={setThresholdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Insight</DialogTitle>
            <DialogDescription>
              Personalize os parâmetros deste insight para este grupo específico.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInsightForConfig && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Insight: {AVAILABLE_INSIGHTS.find(i => i.type === selectedInsightForConfig.type)?.name}</Label>
                <Label>Grupo: {groups.find(g => g.id === selectedInsightForConfig.groupId)?.name}</Label>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Configurações de Threshold</h4>
                <p className="text-sm text-muted-foreground">
                  Configure os valores que determinam quando este insight será ativado.
                </p>
                
                {/* Aqui seria implementada a configuração específica de cada tipo de insight */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor mínimo</Label>
                      <Input type="number" placeholder="Ex: 50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor máximo</Label>
                      <Input type="number" placeholder="Ex: 100" />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Configurações de Notificação</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Notificação in-app</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notificação por email</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notificação push</Label>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Salvar configurações</Button>
                <Button variant="outline" onClick={() => setThresholdDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Exibir DataAnalyzer quando solicitado */}
      {showDataAnalyzer && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>📊 Análise de Dados</CardTitle>
                <CardDescription>
                  Explore todas as variáveis disponíveis e veja exemplos de como construir fórmulas
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowDataAnalyzer(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataAnalyzer />
          </CardContent>
        </Card>
      )}

      {/* Exibir Configurador de Insight Nativo quando solicitado */}
      {configuringNativeInsight && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>⚙️ Configurar Insight Nativo</CardTitle>
                <CardDescription>
                  Ajuste os parâmetros para personalizar quando este insight deve ser ativado
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setConfiguringNativeInsight(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <NativeInsightConfigurator
              insightType={configuringNativeInsight as any}
              groupId={selectedGroup === 'all' ? '' : selectedGroup}
              onSave={(config) => {
                // Implementar salvamento das configurações
                console.log('Salvando configuração:', config);
                setConfiguringNativeInsight(null);
              }}
              onCancel={() => setConfiguringNativeInsight(null)}
            />
          </CardContent>
        </Card>
      )}

      {/* Wizard para Criação de Insight Customizado */}
      <InsightWizard
        open={showCustomInsightForm}
        onClose={() => setShowCustomInsightForm(false)}
        onSave={async (formula) => {
          console.log('Insight customizado criado:', formula);
          const success = await saveCustomInsight(formula, selectedGroup === 'all' ? '' : selectedGroup);
          if (success) {
            toast({
              title: 'Insight Criado!',
              description: 'Seu insight customizado foi criado com sucesso.',
            });
          }
          return success;
        }}
      />

      {/* Seção de Insights Nativos */}
    </div>
  );
} 