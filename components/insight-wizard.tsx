'use client';

import React, { useState, useEffect } from 'react';
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
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Ícones disponíveis para seleção
const AVAILABLE_ICONS = [
  { name: 'CheckCircle', icon: CheckCircle, color: 'green' },
  { name: 'AlertTriangle', icon: AlertTriangle, color: 'yellow' },
  { name: 'TrendingUp', icon: TrendingUp, color: 'emerald' },
  { name: 'TrendingDown', icon: TrendingDown, color: 'red' },
  { name: 'Users', icon: Users, color: 'blue' },
  { name: 'MessageSquare', icon: MessageSquare, color: 'purple' },
  { name: 'Clock', icon: Clock, color: 'orange' },
  { name: 'Activity', icon: Activity, color: 'pink' },
  { name: 'BarChart3', icon: BarChart3, color: 'indigo' },
  { name: 'Target', icon: Target, color: 'cyan' },
  { name: 'Zap', icon: Zap, color: 'yellow' },
  { name: 'Brain', icon: Brain, color: 'purple' },
  { name: 'Globe', icon: Globe, color: 'blue' },
  { name: 'Eye', icon: Eye, color: 'gray' },
  { name: 'Heart', icon: Heart, color: 'red' },
  { name: 'Star', icon: Star, color: 'yellow' },
  { name: 'ThumbsUp', icon: ThumbsUp, color: 'green' },
  { name: 'Award', icon: Award, color: 'gold' },
  { name: 'Flame', icon: Flame, color: 'orange' },
  { name: 'Shield', icon: Shield, color: 'blue' },
  { name: 'Zap', icon: Zap, color: 'yellow' }
];

// Variáveis disponíveis organizadas
const VARIABLES_BY_CATEGORY = [
  {
    category: 'Básicas',
    variables: [
      { name: 'total_messages', label: 'Total de Mensagens', example: 1547 },
      { name: 'active_members', label: 'Membros Ativos', example: 28 },
      { name: 'member_count', label: 'Total de Membros', example: 45 },
      { name: 'participation_rate', label: 'Taxa de Participação (%)', example: 62 }
    ]
  },
  {
    category: 'Crescimento',
    variables: [
      { name: 'message_growth_rate', label: 'Crescimento de Mensagens (%)', example: 15 },
      { name: 'member_growth_rate', label: 'Crescimento de Membros (%)', example: 12 },
      { name: 'prev_total_messages', label: 'Mensagens Período Anterior', example: 1320 }
    ]
  },
  {
    category: 'Qualidade',
    variables: [
      { name: 'avg_message_length', label: 'Tamanho Médio da Mensagem', example: 15.4 },
      { name: 'media_ratio', label: 'Taxa de Mídia (%)', example: 20 },
      { name: 'conversation_depth', label: 'Profundidade da Conversa', example: 3.2 }
    ]
  }
];

// Operadores matemáticos e lógicos
const OPERATORS = [
  { symbol: '+', name: 'Somar', example: '10 + 5 = 15' },
  { symbol: '-', name: 'Subtrair', example: '10 - 5 = 5' },
  { symbol: '*', name: 'Multiplicar', example: '10 * 5 = 50' },
  { symbol: '/', name: 'Dividir', example: '10 / 5 = 2' },
  { symbol: '>', name: 'Maior que', example: '10 > 5 = true' },
  { symbol: '<', name: 'Menor que', example: '5 < 10 = true' },
  { symbol: '>=', name: 'Maior ou igual', example: '10 >= 10 = true' },
  { symbol: '<=', name: 'Menor ou igual', example: '5 <= 10 = true' },
  { symbol: '==', name: 'Igual', example: '5 == 5 = true' },
  { symbol: '&&', name: 'E (ambos)', example: 'true && true = true' },
  { symbol: '||', name: 'Ou (qualquer)', example: 'true || false = true' }
];

// Dados simulados para preview
const SAMPLE_DATA = {
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

// Templates inteligentes para começar rapidamente
const SMART_TEMPLATES = [
  {
    name: 'Alto Crescimento',
    description: 'Detecta quando o grupo está crescendo rapidamente',
    icon: 'TrendingUp',
    category: 'Crescimento',
    formula: 'message_growth_rate > 20',
    explanation: 'Ativa quando o crescimento de mensagens for maior que 20%'
  },
  {
    name: 'Participação Excelente',
    description: 'Identifica grupos com alta participação',
    icon: 'CheckCircle',
    category: 'Engajamento',
    formula: 'participation_rate > 70 && active_members > 20',
    explanation: 'Ativa quando mais de 70% dos membros participam E há mais de 20 membros ativos'
  },
  {
    name: 'Alerta de Declínio',
    description: 'Avisa quando o engajamento está caindo',
    icon: 'AlertTriangle',
    category: 'Engajamento',
    formula: 'message_growth_rate < -10 || participation_rate < 30',
    explanation: 'Ativa quando o crescimento for negativo em -10% OU participação menor que 30%'
  },
  {
    name: 'Qualidade Premium',
    description: 'Detecta conversas de alta qualidade',
    icon: 'Star',
    category: 'Qualidade',
    formula: 'avg_message_length > 25 && conversation_depth > 3',
    explanation: 'Ativa quando mensagens são longas (>25 chars) E conversas são profundas (>3 trocas)'
  }
];

interface InsightWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (insight: any) => Promise<boolean>;
  editingInsight?: any;
}

export function InsightWizard({ open, onClose, onSave, editingInsight }: InsightWizardProps) {
  const { toast } = useToast();
  
  // Estados do wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados dos dados do insight
  const [insightData, setInsightData] = useState({
    name: '',
    description: '',
    icon: 'CheckCircle',
    category: 'Engajamento',
    formula: '',
    variables: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    conditions: [{ field: 'result', operator: 'gt' as 'gt' | 'lt' | 'gte' | 'lte' | 'eq', value: 0 }]
  });
  
  // Estados da interface
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Carregar dados se estiver editando
  useEffect(() => {
    if (editingInsight) {
      setInsightData({
        name: editingInsight.name || '',
        description: editingInsight.description || '',
        icon: editingInsight.icon || 'CheckCircle',
        category: editingInsight.category || 'Engajamento',
        formula: editingInsight.formula?.expression || '',
        variables: editingInsight.variables || [],
        priority: editingInsight.priority || 'medium',
        conditions: editingInsight.conditions || [{ field: 'result', operator: 'gt', value: 0 }]
      });
    }
  }, [editingInsight]);

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
        conditions: [{ field: 'result', operator: 'gt', value: 0 }]
      });
      setPreviewResult(null);
      setValidationErrors([]);
    }
  }, [open]);

  // Atualizar dados do insight
  const updateInsightData = (updates: Partial<typeof insightData>) => {
    setInsightData(prev => ({ ...prev, ...updates }));
  };

  // Adicionar variável à fórmula
  const addVariable = (variableName: string) => {
    const newFormula = insightData.formula + (insightData.formula ? ' ' : '') + variableName;
    updateInsightData({ 
      formula: newFormula,
      variables: [...new Set([...insightData.variables, variableName])]
    });
  };

  // Adicionar operador à fórmula
  const addOperator = (operator: string) => {
    const newFormula = insightData.formula + (insightData.formula ? ' ' : '') + operator;
    updateInsightData({ formula: newFormula });
  };

  // Testar fórmula com dados simulados
  const testFormula = () => {
    if (!insightData.formula.trim()) {
      toast({
        title: 'Fórmula vazia',
        description: 'Adicione uma fórmula antes de testar.',
        variant: 'destructive'
      });
      return;
    }

    try {
      let expression = insightData.formula;
      
      // Substituir variáveis pelos valores de teste
      Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      });

      // Avaliar expressão
      const result = eval(expression);
      
      // Verificar condições
      const conditionResults = insightData.conditions.map(condition => {
        const value = condition.field === 'result' ? result : SAMPLE_DATA[condition.field as keyof typeof SAMPLE_DATA];
        
        switch (condition.operator) {
          case 'gt': return Number(value) > (condition.value as number);
          case 'lt': return Number(value) < (condition.value as number);
          case 'gte': return Number(value) >= (condition.value as number);
          case 'lte': return Number(value) <= (condition.value as number);
          case 'eq': return Number(value) === condition.value;
          default: return false;
        }
      });

      const triggered = conditionResults.every(Boolean);

      setPreviewResult({
        expression: insightData.formula,
        substituted: expression,
        result,
        triggered,
        conditionResults,
        testData: SAMPLE_DATA
      });

      toast({
        title: triggered ? '✅ Insight seria ativado!' : '❌ Insight não seria ativado',
        description: `Resultado: ${result} - ${triggered ? 'Condições atendidas' : 'Condições não atendidas'}`,
        variant: triggered ? 'default' : 'destructive'
      });

    } catch (error) {
      toast({
        title: 'Erro na fórmula',
        description: 'Expressão inválida. Verifique a sintaxe.',
        variant: 'destructive'
      });
      setPreviewResult(null);
    }
  };

  // Aplicar template
  const applyTemplate = (template: typeof SMART_TEMPLATES[0]) => {
    updateInsightData({
      name: template.name,
      description: template.description,
      icon: template.icon,
      category: template.category,
      formula: template.formula,
      variables: extractVariablesFromFormula(template.formula)
    });
    setShowTemplates(false);
    setCurrentStep(2); // Ir para o construtor
    toast({
      title: 'Template aplicado!',
      description: `"${template.name}" foi carregado. Você pode personalizar conforme necessário.`
    });
  };

  // Extrair variáveis da fórmula
  const extractVariablesFromFormula = (formula: string): string[] => {
    const allVariables = VARIABLES_BY_CATEGORY.flatMap(cat => cat.variables.map(v => v.name));
    const foundVariables = allVariables.filter(variable => 
      new RegExp(`\\b${variable}\\b`).test(formula)
    );
    return foundVariables;
  };

  // Validar etapa atual
  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];

    if (currentStep === 1) {
      if (!insightData.name.trim()) errors.push('Nome é obrigatório');
      if (!insightData.description.trim()) errors.push('Descrição é obrigatória');
    }

    if (currentStep === 2) {
      if (!insightData.formula.trim()) errors.push('Fórmula é obrigatória');
      if (insightData.conditions.length === 0) errors.push('Pelo menos uma condição é necessária');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Navegar para próxima etapa
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  // Navegar para etapa anterior
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Finalizar e salvar
  const handleFinish = async () => {
    if (!validateCurrentStep()) return;

    try {
      setIsLoading(true);
      
      const finalInsight = {
        name: insightData.name,
        description: insightData.description,
        expression: insightData.formula,
        variables: insightData.variables,
        conditions: insightData.conditions,
        category: insightData.category,
        priority: insightData.priority,
        icon: insightData.icon
      };

      const success = await onSave(finalInsight);
      
      if (success) {
        toast({
          title: '🎉 Insight criado com sucesso!',
          description: `"${insightData.name}" está pronto para ser usado.`
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar o insight. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedIcon = AVAILABLE_ICONS.find(i => i.name === insightData.icon);
  const IconComponent = selectedIcon?.icon || CheckCircle;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${selectedIcon?.color}-100 dark:bg-${selectedIcon?.color}-900/30`}>
              <IconComponent className={`h-6 w-6 text-${selectedIcon?.color}-600 dark:text-${selectedIcon?.color}-400`} />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {editingInsight ? 'Editar Insight' : 'Criar Novo Insight'}
              </DialogTitle>
              <DialogDescription>
                {currentStep === 1 && 'Configure as informações básicas do seu insight'}
                {currentStep === 2 && 'Construa a fórmula que determinará quando o insight será ativado'}
                {currentStep === 3 && 'Revise e configure os detalhes finais'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Indicador de progresso */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {/* Etapa 1: Informações Básicas */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                  <CardDescription>
                    Defina o nome, descrição e aparência do seu insight
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Insight *</Label>
                      <Input
                        value={insightData.name}
                        onChange={(e) => updateInsightData({ name: e.target.value })}
                        placeholder="Ex: Alto Engajamento"
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select 
                        value={insightData.category} 
                        onValueChange={(value) => updateInsightData({ category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engajamento">Engajamento</SelectItem>
                          <SelectItem value="Crescimento">Crescimento</SelectItem>
                          <SelectItem value="Qualidade">Qualidade</SelectItem>
                          <SelectItem value="Distribuição">Distribuição</SelectItem>
                          <SelectItem value="Temporal">Temporal</SelectItem>
                          <SelectItem value="Anomalias">Anomalias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Textarea
                      value={insightData.description}
                      onChange={(e) => updateInsightData({ description: e.target.value })}
                      placeholder="Descreva quando este insight deve ser ativado e o que ele significa..."
                      rows={3}
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select 
                      value={insightData.priority} 
                      onValueChange={(value: any) => updateInsightData({ priority: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            Baixa
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            Média
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                            Alta
                          </div>
                        </SelectItem>
                        <SelectItem value="critical">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            Crítica
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Seleção de Ícone */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Escolha um Ícone
                  </CardTitle>
                  <CardDescription>
                    Selecione um ícone que represente bem seu insight
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-3">
                    {AVAILABLE_ICONS.map(iconOption => {
                      const Icon = iconOption.icon;
                      const isSelected = insightData.icon === iconOption.name;
                      return (
                        <button
                          key={iconOption.name}
                          onClick={() => updateInsightData({ icon: iconOption.name })}
                          className={`
                            p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
                            ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 hover:border-gray-300'}
                          `}
                        >
                          <Icon className={`h-6 w-6 text-${iconOption.color}-600`} />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Templates Inteligentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Ou Comece com um Template
                  </CardTitle>
                  <CardDescription>
                    Use um template pronto e personalize conforme necessário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {SMART_TEMPLATES.map((template, index) => {
                      const TemplateIcon = AVAILABLE_ICONS.find(i => i.name === template.icon)?.icon || CheckCircle;
                      return (
                        <Card 
                          key={index} 
                          className="cursor-pointer hover:ring-2 hover:ring-blue-500/20 transition-all"
                          onClick={() => applyTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <TemplateIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{template.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Etapa 2: Construtor de Fórmula */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Painel de Variáveis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Variáveis Disponíveis</CardTitle>
                    <CardDescription className="text-sm">
                      Clique para adicionar à fórmula
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-64 overflow-y-auto">
                    {VARIABLES_BY_CATEGORY.map(category => (
                      <div key={category.category}>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          {category.category}
                        </h4>
                        <div className="space-y-1">
                          {category.variables.map(variable => (
                            <button
                              key={variable.name}
                              onClick={() => addVariable(variable.name)}
                              className="w-full p-2 text-left text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded border transition-colors"
                            >
                              <div className="font-mono font-medium">{variable.name}</div>
                              <div className="text-muted-foreground">{variable.label}</div>
                              <div className="text-blue-600 font-medium">Exemplo: {variable.example}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Painel de Operadores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Operadores</CardTitle>
                    <CardDescription className="text-sm">
                      Combine variáveis com operadores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                    {OPERATORS.map(operator => (
                      <button
                        key={operator.symbol}
                        onClick={() => addOperator(operator.symbol)}
                        className="w-full p-2 text-left text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 rounded border transition-colors"
                      >
                        <div className="font-mono font-bold text-blue-700 dark:text-blue-300">
                          {operator.symbol}
                        </div>
                        <div className="text-sm">{operator.name}</div>
                        <div className="text-xs text-muted-foreground">{operator.example}</div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Editor de Fórmula */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sua Fórmula</CardTitle>
                    <CardDescription className="text-sm">
                      Construa a lógica do insight
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        value={insightData.formula}
                        onChange={(e) => updateInsightData({ 
                          formula: e.target.value,
                          variables: extractVariablesFromFormula(e.target.value)
                        })}
                        placeholder="Ex: participation_rate > 70 && active_members > 20"
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={testFormula} 
                        size="sm" 
                        className="flex-1"
                        variant="outline"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Testar
                      </Button>
                      <Button 
                        onClick={() => updateInsightData({ formula: '', variables: [] })} 
                        size="sm"
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Botão para IA - preparado para implementação futura */}
                    <Button 
                      variant="outline" 
                      className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/20"
                      disabled
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar com IA (Em breve)
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Preview em Tempo Real */}
              {previewResult && (
                <Card className={`border-2 ${previewResult.triggered ? 'border-green-200 bg-green-50/30 dark:bg-green-950/20' : 'border-red-200 bg-red-50/30 dark:bg-red-950/20'}`}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {previewResult.triggered ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      Preview com Dados Reais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Fórmula Original:</Label>
                        <code className="block p-2 bg-muted rounded text-xs">{previewResult.expression}</code>
                      </div>
                      <div>
                        <Label className="text-sm">Com Dados Substituídos:</Label>
                        <code className="block p-2 bg-muted rounded text-xs">{previewResult.substituted}</code>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-sm">Resultado:</Label>
                        <div className="text-lg font-bold">{String(previewResult.result)}</div>
                      </div>
                      <div>
                        <Label className="text-sm">Status:</Label>
                        <Badge variant={previewResult.triggered ? 'default' : 'destructive'}>
                          {previewResult.triggered ? 'Insight Ativado ✅' : 'Insight Não Ativado ❌'}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded text-xs">
                      <strong>Dados de exemplo utilizados:</strong>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {Object.entries(previewResult.testData).map(([key, value]) => (
                          <span key={key}>{key}: {String(value)}</span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Etapa 3: Revisão Final */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Revisão Final
                  </CardTitle>
                  <CardDescription>
                    Confirme todos os detalhes do seu insight antes de salvar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Nome:</Label>
                        <p className="text-base">{insightData.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Descrição:</Label>
                        <p className="text-sm text-muted-foreground">{insightData.description}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <Label className="text-sm font-medium">Categoria:</Label>
                          <Badge variant="outline">{insightData.category}</Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Prioridade:</Label>
                          <Badge variant={
                            insightData.priority === 'critical' ? 'destructive' :
                            insightData.priority === 'high' ? 'default' : 'secondary'
                          }>
                            {insightData.priority === 'low' ? 'Baixa' :
                             insightData.priority === 'medium' ? 'Média' :
                             insightData.priority === 'high' ? 'Alta' : 'Crítica'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Ícone:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                          <span className="text-sm">{insightData.icon}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Fórmula:</Label>
                        <code className="block p-2 bg-muted rounded text-xs mt-1">{insightData.formula}</code>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Variáveis utilizadas:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {insightData.variables.map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {previewResult && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Teste Realizado com Sucesso
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Sua fórmula foi testada e {previewResult.triggered ? 'seria ativada' : 'não seria ativada'} com os dados de exemplo.
                        Resultado: {String(previewResult.result)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Erros de validação */}
        {validationErrors.length > 0 && (
          <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Corrija os seguintes erros:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Etapa {currentStep} de 3
          </div>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button onClick={nextStep}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 