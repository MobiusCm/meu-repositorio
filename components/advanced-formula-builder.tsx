'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  BarChart3,
  TrendingUp,
  Star,
  Target,
  Clock,
  Heart,
  Zap,
  Calculator,
  Plus,
  Trash2,
  Play,
  Info,
  Lightbulb,
  Calendar,
  HelpCircle,
  Search,
  Filter,
  MousePointer,
  Code,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Variáveis expandidas com tooltips e períodos
const ENHANCED_VARIABLES = [
  {
    category: 'Métricas Básicas',
    description: 'Contadores fundamentais de atividade',
    icon: BarChart3,
    color: 'blue',
    variables: [
      {
        id: 'total_messages',
        name: 'total_messages',
        label: 'Total de Mensagens',
        description: 'Número total de mensagens enviadas no período selecionado',
        tooltip: 'Conta todas as mensagens de texto, mídia e documentos enviados pelos membros',
        example: 1547,
        type: 'count',
        unit: 'mensagens',
        periods: ['today', 'last_7_days', 'last_30_days', 'last_week', 'last_month'],
        calculation: 'SUM(messages) WHERE period = selected_period'
      },
      {
        id: 'active_members',
        name: 'active_members',
        label: 'Membros Ativos',
        description: 'Membros que enviaram pelo menos uma mensagem no período',
        tooltip: 'Um membro é considerado ativo se enviou pelo menos 1 mensagem no período selecionado',
        example: 28,
        type: 'count',
        unit: 'membros',
        periods: ['today', 'last_7_days', 'last_30_days', 'last_week', 'last_month'],
        calculation: 'COUNT(DISTINCT user_id) WHERE messages > 0 AND period = selected_period'
      },
      {
        id: 'participation_rate',
        name: 'participation_rate',
        label: 'Taxa de Participação',
        description: 'Percentual de membros que participaram ativamente',
        tooltip: 'Calculado como: (membros ativos / total de membros) × 100',
        example: 62,
        type: 'percentage',
        unit: '%',
        periods: ['today', 'last_7_days', 'last_30_days', 'last_week', 'last_month'],
        calculation: '(active_members / total_members) * 100'
      }
    ]
  },
  {
    category: 'Crescimento e Tendências',
    description: 'Métricas de evolução temporal',
    icon: TrendingUp,
    color: 'green',
    variables: [
      {
        id: 'message_growth_rate',
        name: 'message_growth_rate',
        label: 'Taxa de Crescimento (Mensagens)',
        description: 'Percentual de crescimento comparado ao período anterior',
        tooltip: 'Fórmula: ((período_atual - período_anterior) / período_anterior) × 100',
        example: 15,
        type: 'percentage',
        unit: '%',
        periods: ['last_7_days', 'last_30_days', 'current_vs_previous'],
        calculation: '((current_period - previous_period) / previous_period) * 100'
      },
      {
        id: 'momentum_score',
        name: 'momentum_score',
        label: 'Score de Momentum',
        description: 'Índice que mede a aceleração do crescimento (0-100)',
        tooltip: 'Combina velocidade de crescimento com consistência. 100 = crescimento máximo e consistente',
        example: 78,
        type: 'score',
        unit: 'pontos',
        periods: ['current_vs_previous', 'last_7_days'],
        calculation: 'WEIGHTED_AVERAGE(growth_rate, consistency_factor) normalized to 0-100'
      }
    ]
  },
  {
    category: 'Qualidade e Conteúdo',
    description: 'Métricas sobre qualidade das interações',
    icon: Star,
    color: 'amber',
    variables: [
      {
        id: 'avg_message_length',
        name: 'avg_message_length',
        label: 'Tamanho Médio das Mensagens',
        description: 'Número médio de caracteres por mensagem',
        tooltip: 'Mensagens mais longas geralmente indicam discussões mais profundas e engajamento',
        example: 15.4,
        type: 'average',
        unit: 'caracteres',
        periods: ['today', 'last_7_days', 'last_30_days'],
        calculation: 'AVG(LENGTH(message_text)) WHERE period = selected_period'
      },
      {
        id: 'quality_score',
        name: 'quality_score',
        label: 'Score de Qualidade',
        description: 'Índice composto baseado em tamanho, mídia e engajamento (0-100)',
        tooltip: 'Combina: tamanho médio das mensagens + taxa de mídia + profundidade de conversas',
        example: 72,
        type: 'score',
        unit: 'pontos',
        periods: ['today', 'last_7_days', 'last_30_days'],
        calculation: 'WEIGHTED_SCORE(msg_length:40%, media_ratio:30%, conversation_depth:30%)'
      }
    ]
  }
];

// Operadores com tooltips detalhados
const ENHANCED_OPERATORS = [
  {
    symbol: '>',
    name: 'Maior que',
    description: 'Verifica se o valor à esquerda é maior que o da direita',
    tooltip: 'Use para detectar quando uma métrica supera um threshold específico',
    example: 'total_messages > 100',
    category: 'comparison',
    usage: 'Ideal para alertas de crescimento e limites mínimos'
  },
  {
    symbol: '<',
    name: 'Menor que', 
    description: 'Verifica se o valor à esquerda é menor que o da direita',
    tooltip: 'Use para detectar quando uma métrica está abaixo do esperado',
    example: 'participation_rate < 30',
    category: 'comparison',
    usage: 'Perfeito para alertas de declínio e problemas'
  },
  {
    symbol: '>=',
    name: 'Maior ou igual',
    description: 'Verifica se o valor é maior ou igual ao limite',
    tooltip: 'Inclui o valor exato no resultado, além dos maiores',
    example: 'active_members >= 20',
    category: 'comparison',
    usage: 'Use quando o valor limite também é aceitável'
  },
  {
    symbol: '&&',
    name: 'E (ambas condições)',
    description: 'Todas as condições devem ser verdadeiras',
    tooltip: 'Combina múltiplas condições - todas precisam ser atendidas simultaneamente',
    example: 'growth > 20 && quality > 70',
    category: 'logic',
    usage: 'Para insights que exigem múltiplos critérios'
  },
  {
    symbol: '||',
    name: 'OU (qualquer condição)',
    description: 'Pelo menos uma condição deve ser verdadeira',
    tooltip: 'Ativa se qualquer uma das condições for atendida',
    example: 'anomaly > 80 || spike > 5',
    category: 'logic',
    usage: 'Para alertas que podem ter múltiplas causas'
  }
];

// Períodos de tempo com descrições
const TIME_PERIODS = [
  {
    id: 'today',
    name: 'Hoje',
    description: 'Dados do dia atual (últimas 24h)',
    icon: '📅',
    tooltip: 'Perfeito para monitoramento em tempo real e detecção de picos'
  },
  {
    id: 'last_7_days',
    name: 'Últimos 7 dias',
    description: 'Média semanal dos últimos 7 dias',
    icon: '📊',
    tooltip: 'Ideal para análises de tendência semanal e padrões recentes'
  },
  {
    id: 'last_30_days',
    name: 'Últimos 30 dias',
    description: 'Média mensal dos últimos 30 dias',
    icon: '📈',
    tooltip: 'Melhor para tendências de longo prazo e comparações mensais'
  },
  {
    id: 'current_vs_previous',
    name: 'Atual vs Anterior',
    description: 'Comparação entre períodos equivalentes',
    icon: '⚖️',
    tooltip: 'Compara período atual com período anterior de mesma duração'
  }
];

interface FormulaComponent {
  id: string;
  type: 'variable' | 'operator' | 'value' | 'parenthesis';
  content: string;
  metadata?: {
    period?: string;
    variableData?: any;
    operatorData?: any;
  };
}

interface AdvancedFormulaBuilderProps {
  formula: string;
  onFormulaChange: (formula: string, variables: string[]) => void;
  onTest?: () => void;
  testResult?: any;
}

export function AdvancedFormulaBuilder({
  formula,
  onFormulaChange,
  onTest,
  testResult
}: AdvancedFormulaBuilderProps) {
  const [formulaComponents, setFormulaComponents] = useState<FormulaComponent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('last_7_days');
  const [activeTab, setActiveTab] = useState('variables');
  const [showHelp, setShowHelp] = useState(false);

  // Filtrar variáveis baseado na busca e categoria
  const filteredCategories = ENHANCED_VARIABLES.filter(category => {
    if (selectedCategory !== 'all' && category.category !== selectedCategory) return false;
    
    return category.variables.some(variable =>
      variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Adicionar componente à fórmula
  const addComponent = useCallback((component: FormulaComponent) => {
    setFormulaComponents(prev => [...prev, component]);
    updateFormula([...formulaComponents, component]);
  }, [formulaComponents]);

  // Remover componente da fórmula
  const removeComponent = useCallback((index: number) => {
    const newComponents = formulaComponents.filter((_, i) => i !== index);
    setFormulaComponents(newComponents);
    updateFormula(newComponents);
  }, [formulaComponents]);

  // Atualizar fórmula baseada nos componentes
  const updateFormula = useCallback((components: FormulaComponent[]) => {
    const formulaString = components.map(comp => comp.content).join(' ');
    const variables = components
      .filter(comp => comp.type === 'variable')
      .map(comp => comp.content);
    
    onFormulaChange(formulaString, Array.from(new Set(variables)));
  }, [onFormulaChange]);

  // Adicionar variável
  const addVariable = (variable: any) => {
    const variableName = selectedPeriod !== 'today' ? 
      `${variable.name}_${selectedPeriod}` : 
      variable.name;

    addComponent({
      id: Date.now().toString(),
      type: 'variable',
      content: variableName,
      metadata: {
        period: selectedPeriod,
        variableData: variable
      }
    });
  };

  // Adicionar operador
  const addOperator = (operator: any) => {
    addComponent({
      id: Date.now().toString(),
      type: 'operator',
      content: operator.symbol,
      metadata: {
        operatorData: operator
      }
    });
  };

  // Adicionar valor
  const addValue = (value: string) => {
    if (value.trim()) {
      addComponent({
        id: Date.now().toString(),
        type: 'value',
        content: value.trim()
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-12 gap-6 h-[600px]">
        {/* Painel esquerdo - Componentes */}
        <div className="col-span-4 space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Componentes da Fórmula
              </CardTitle>
              <CardDescription>
                Arraste ou clique para adicionar à sua fórmula
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Busca e filtros */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar variáveis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {ENHANCED_VARIABLES.map(cat => (
                        <SelectItem key={cat.category} value={cat.category}>
                          {cat.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_PERIODS.map(period => (
                        <SelectItem key={period.id} value={period.id}>
                          <span className="flex items-center gap-2">
                            <span>{period.icon}</span>
                            {period.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="variables" className="text-xs">Variáveis</TabsTrigger>
                  <TabsTrigger value="operators" className="text-xs">Operadores</TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="variables" className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredCategories.map(category => {
                    const CategoryIcon = category.icon;
                    return (
                      <div key={category.category}>
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className={`h-4 w-4 text-${category.color}-600`} />
                          <span className="text-sm font-medium">{category.category}</span>
                        </div>
                        
                        <div className="space-y-1 ml-6">
                          {category.variables
                            .filter(variable =>
                              variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              variable.label.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(variable => (
                              <Tooltip key={variable.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => addVariable(variable)}
                                    className="w-full p-2 text-left text-xs bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 rounded-lg border transition-all duration-200 group"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-mono font-medium text-blue-700 dark:text-blue-300">
                                        {variable.name}
                                      </span>
                                      <Badge variant="secondary" className="text-xs">
                                        {variable.type}
                                      </Badge>
                                    </div>
                                    <div className="text-muted-foreground text-xs">{variable.label}</div>
                                    <div className="text-blue-600 dark:text-blue-400 font-medium text-xs mt-1">
                                      Ex: {variable.example} {variable.unit}
                                    </div>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <div className="space-y-2">
                                    <h4 className="font-semibold">{variable.label}</h4>
                                    <p className="text-sm">{variable.tooltip}</p>
                                    <div className="text-xs text-muted-foreground">
                                      <strong>Cálculo:</strong> {variable.calculation}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {variable.periods.map(period => (
                                        <Badge key={period} variant="outline" className="text-xs">
                                          {TIME_PERIODS.find(p => p.id === period)?.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="operators" className="space-y-2 max-h-80 overflow-y-auto">
                  {ENHANCED_OPERATORS.map(operator => (
                    <Tooltip key={operator.symbol}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => addOperator(operator)}
                          className="w-full p-3 text-left text-xs bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 dark:hover:from-purple-800/30 dark:hover:to-indigo-800/30 rounded-lg border transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-lg">
                              {operator.symbol}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {operator.category}
                            </Badge>
                          </div>
                          <div className="font-medium text-sm">{operator.name}</div>
                          <div className="text-muted-foreground text-xs mt-1">{operator.example}</div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{operator.name}</h4>
                          <p className="text-sm">{operator.tooltip}</p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Uso ideal:</strong> {operator.usage}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Painel central - Editor de fórmula */}
        <div className="col-span-5 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Construtor Visual de Fórmula
              </CardTitle>
              <CardDescription>
                Sua fórmula será construída aqui conforme você adiciona componentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Área de construção da fórmula */}
              <div className="min-h-32 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                {formulaComponents.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Sua fórmula aparecerá aqui</p>
                    <p className="text-xs">Adicione variáveis e operadores do painel à esquerda</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formulaComponents.map((component, index) => (
                      <div
                        key={component.id}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg border group transition-all duration-200
                          ${component.type === 'variable' ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200' :
                            component.type === 'operator' ? 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-200' :
                            'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200'
                          }
                        `}
                      >
                        <span className="font-mono text-sm">{component.content}</span>
                        <button
                          onClick={() => removeComponent(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input manual de valor */}
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar valor numérico..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addValue(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Adicionar valor numérico..."]') as HTMLInputElement;
                    if (input?.value) {
                      addValue(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button 
                  onClick={onTest} 
                  className="flex-1"
                  disabled={formulaComponents.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Testar Fórmula
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFormulaComponents([]);
                    onFormulaChange('', []);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel direito - Preview e ajuda */}
        <div className="col-span-3 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview & Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Período selecionado */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  📅 Período Atual
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {TIME_PERIODS.find(p => p.id === selectedPeriod)?.name}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {TIME_PERIODS.find(p => p.id === selectedPeriod)?.description}
                </p>
              </div>

              {/* Resultado do teste */}
              {testResult && (
                <div className={`p-3 rounded-lg border ${
                  testResult.triggered 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.triggered ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${
                      testResult.triggered ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                    }`}>
                      {testResult.triggered ? 'Insight seria ativado!' : 'Insight não seria ativado'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    testResult.triggered ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    Resultado: {String(testResult.result)}
                  </p>
                </div>
              )}

              {/* Ajuda contextual */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Dicas Rápidas
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>🎯 Combinações populares:</strong><br />
                    crescimento &gt; 20 && qualidade &gt; 70
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>⚠️ Para alertas:</strong><br />
                    participação &lt; 30 || declínio &gt; 10
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>📊 Para análises:</strong><br />
                    Use períodos de 7 ou 30 dias
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
} 