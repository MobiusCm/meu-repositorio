'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Play,
  Brain,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Zap,
  ArrowLeft,
  Eye,
  Settings
} from 'lucide-react';
import { useCustomInsights } from '@/hooks/use-custom-insights';
import { useToast } from '@/components/ui/use-toast';
import { InsightWizard } from '@/components/insight-wizard';
import Link from 'next/link';

// Mapa de ícones disponíveis
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Zap,
  Brain
};

// Cores dos ícones
const ICON_COLORS: Record<string, string> = {
  CheckCircle: 'text-green-600',
  AlertTriangle: 'text-yellow-600',
  TrendingUp: 'text-emerald-600',
  Users: 'text-blue-600',
  Clock: 'text-orange-600',
  BarChart3: 'text-indigo-600',
  Zap: 'text-yellow-600',
  Brain: 'text-purple-600'
};

export default function CustomInsightsPage() {
  const { toast } = useToast();
  const {
    insights,
    loading,
    error,
    createInsight,
    updateInsight,
    deleteInsight,
    toggleInsight,
    testInsight,
    getInsightStats
  } = useCustomInsights();

  // Estados da interface
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [editingInsight, setEditingInsight] = useState<any>(null);

  // Filtrar insights
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || insight.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Estatísticas
  const stats = getInsightStats();

  // Categorias únicas
  const categories = Array.from(new Set(insights.map(i => i.category)));

  // Testar insight
  const handleTestInsight = async (insight: any) => {
    try {
      const testData = {
        total_messages: 1547,
        active_members: 28,
        member_count: 45,
        participation_rate: 62,
        message_growth_rate: 15,
        member_growth_rate: 12,
        prev_total_messages: 1320,
        avg_message_length: 15.4,
        media_ratio: 20,
        conversation_depth: 3.2
      };

      const result = await testInsight(insight, testData);
      
      toast({
        title: result.triggered ? '✅ Insight seria ativado!' : '❌ Insight não seria ativado',
        description: `Resultado: ${result.result} - ${result.triggered ? 'Condições atendidas' : 'Condições não atendidas'}`,
        variant: result.triggered ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Erro ao testar o insight. Verifique a fórmula.',
        variant: 'destructive'
      });
    }
  };

  // Duplicar insight
  const handleDuplicateInsight = async (insight: any) => {
    const duplicatedInsight = {
      name: `${insight.name} (Cópia)`,
      description: insight.description,
      formula: insight.formula,
      variables: insight.variables,
      conditions: insight.conditions,
      priority: insight.priority,
      category: insight.category
    };

    const success = await createInsight(duplicatedInsight);
    if (success) {
      toast({
        title: 'Insight duplicado',
        description: 'O insight foi duplicado com sucesso.'
      });
    }
  };

  // Editar insight
  const handleEditInsight = (insight: any) => {
    setEditingInsight(insight);
    setShowWizard(true);
  };

  // Salvar insight (criar ou editar)
  const handleSaveInsight = async (insightData: any) => {
    try {
      let success = false;
      
      if (editingInsight) {
        success = await updateInsight(editingInsight.id, insightData);
      } else {
        success = await createInsight(insightData);
      }

      if (success) {
        setShowWizard(false);
        setEditingInsight(null);
      }
      
      return success;
    } catch (error) {
      return false;
    }
  };

  // Fechar wizard
  const handleCloseWizard = () => {
    setShowWizard(false);
    setEditingInsight(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Carregando insights customizados...</h3>
          <p className="text-muted-foreground">Aguarde enquanto carregamos seus insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/insights">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insights Customizados</h1>
            <p className="text-muted-foreground">
              Gerencie seus insights personalizados criados com fórmulas próprias
            </p>
          </div>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Insight
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Insights criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.enabled}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.enabled / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
            <p className="text-xs text-muted-foreground">Categorias diferentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(stats.byPriority.high || 0) + (stats.byPriority.critical || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Insights prioritários</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
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
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
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
              <Label>Prioridade</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resultados</Label>
              <div className="text-sm text-muted-foreground pt-2">
                {filteredInsights.length} de {insights.length} insights
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Insights */}
      <div className="space-y-4">
        {filteredInsights.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInsights.map(insight => {
              const insightAny = insight as any; // Type assertion para acessar propriedades extras
              const IconComponent = ICON_MAP[insightAny.icon] || Brain;
              const iconColor = ICON_COLORS[insightAny.icon] || 'text-purple-600';
              
              return (
                <Card 
                  key={insight.id} 
                  className={`transition-all duration-200 ${insight.enabled ? 'ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20' : 'opacity-70'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${insight.enabled ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <IconComponent className={`h-5 w-5 ${insight.enabled ? iconColor : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">{insight.name}</CardTitle>
                          <CardDescription className="text-xs line-clamp-2">{insight.description}</CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={insight.enabled}
                        onCheckedChange={(checked) => toggleInsight(insight.id, checked)}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                        <Badge 
                          variant={
                            insight.priority === 'critical' ? 'destructive' :
                            insight.priority === 'high' ? 'default' :
                            insight.priority === 'medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {insight.priority === 'low' ? 'Baixa' :
                           insight.priority === 'medium' ? 'Média' :
                           insight.priority === 'high' ? 'Alta' : 'Crítica'}
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Fórmula:</Label>
                        <code className="block p-2 bg-muted rounded text-xs font-mono mt-1 line-clamp-2">
                          {insight.formula.expression}
                        </code>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Variáveis:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {insight.variables.slice(0, 3).map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                          {insight.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{insight.variables.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestInsight(insight)}
                        className="flex-1 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Testar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditInsight(insight)}
                        className="flex-1 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateInsight(insight)}
                        className="flex-1 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o insight "{insight.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteInsight(insight.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {insights.length === 0 ? 'Nenhum insight customizado' : 'Nenhum insight encontrado'}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {insights.length === 0 
                  ? 'Você ainda não criou nenhum insight customizado. Crie seu primeiro insight usando o construtor de fórmulas!'
                  : 'Não foram encontrados insights com os filtros selecionados. Tente ajustar os filtros de busca.'
                }
              </p>
              {insights.length === 0 && (
                <Button onClick={() => setShowWizard(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Insight
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Wizard para criação/edição */}
      <InsightWizard
        open={showWizard}
        onClose={handleCloseWizard}
        onSave={handleSaveInsight}
        editingInsight={editingInsight}
      />
    </div>
  );
} 