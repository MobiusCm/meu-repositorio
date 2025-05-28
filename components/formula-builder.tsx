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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Code,
  Play,
  Save,
  RotateCcw,
  Info,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Copy,
  BookOpen,
  Zap,
  Calculator,
  Database,
  Clock,
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataAnalyzer } from '@/components/data-analyzer';

// Definir variáveis disponíveis
const AVAILABLE_VARIABLES = [
  {
    category: 'Básicas',
    icon: Database,
    variables: [
      { name: 'total_messages', description: 'Total de mensagens no período', type: 'number' },
      { name: 'active_members', description: 'Membros ativos no período', type: 'number' },
      { name: 'member_count', description: 'Total de membros no grupo', type: 'number' },
      { name: 'avg_messages_day', description: 'Média de mensagens por dia', type: 'number' },
      { name: 'avg_messages_member', description: 'Média de mensagens por membro', type: 'number' },
      { name: 'participation_rate', description: 'Taxa de participação (%)', type: 'percentage' }
    ]
  },
  {
    category: 'Crescimento',
    icon: TrendingUp,
    variables: [
      { name: 'message_growth_rate', description: 'Taxa de crescimento de mensagens (%)', type: 'percentage' },
      { name: 'member_growth_rate', description: 'Taxa de crescimento de membros (%)', type: 'percentage' },
      { name: 'prev_total_messages', description: 'Total de mensagens do período anterior', type: 'number' },
      { name: 'prev_active_members', description: 'Membros ativos do período anterior', type: 'number' }
    ]
  },
  {
    category: 'Qualidade',
    icon: MessageSquare,
    variables: [
      { name: 'avg_message_length', description: 'Comprimento médio das mensagens', type: 'number' },
      { name: 'media_ratio', description: 'Proporção de mensagens com mídia', type: 'percentage' },
      { name: 'response_rate', description: 'Taxa de resposta entre membros', type: 'percentage' },
      { name: 'conversation_depth', description: 'Profundidade das conversas', type: 'number' }
    ]
  },
  {
    category: 'Distribuição',
    icon: Users,
    variables: [
      { name: 'concentration_index', description: 'Índice de concentração de atividade', type: 'number' },
      { name: 'top3_members_messages', description: 'Mensagens dos 3 membros mais ativos', type: 'number' },
      { name: 'top20_percent_activity', description: 'Atividade dos 20% mais ativos', type: 'percentage' },
      { name: 'participation_diversity_index', description: 'Índice de diversidade de participação', type: 'number' }
    ]
  },
  {
    category: 'Temporal',
    icon: Clock,
    variables: [
      { name: 'morning_activity', description: 'Atividade manhã (6h-12h)', type: 'number' },
      { name: 'afternoon_activity', description: 'Atividade tarde (12h-18h)', type: 'number' },
      { name: 'evening_activity', description: 'Atividade noite (18h-23h)', type: 'number' },
      { name: 'night_activity', description: 'Atividade madrugada (23h-6h)', type: 'number' },
      { name: 'weekend_activity_ratio', description: 'Razão atividade fim de semana/semana', type: 'percentage' },
      { name: 'peak_activity_ratio', description: 'Razão entre pico e média', type: 'number' },
      { name: 'peak_duration_hours', description: 'Duração do pico em horas', type: 'number' }
    ]
  },
  {
    category: 'Avançadas',
    icon: Activity,
    variables: [
      { name: 'consistency_score', description: 'Score de consistência de atividade', type: 'number' },
      { name: 'anomaly_score', description: 'Score de detecção de anomalias', type: 'number' },
      { name: 'engagement_velocity', description: 'Velocidade de engajamento', type: 'number' },
      { name: 'retention_index', description: 'Índice de retenção de membros', type: 'number' }
    ]
  }
];

// Operadores disponíveis
const OPERATORS = [
  { symbol: '+', name: 'Adição', description: 'Soma dois valores' },
  { symbol: '-', name: 'Subtração', description: 'Subtrai o segundo valor do primeiro' },
  { symbol: '*', name: 'Multiplicação', description: 'Multiplica dois valores' },
  { symbol: '/', name: 'Divisão', description: 'Divide o primeiro valor pelo segundo' },
  { symbol: '%', name: 'Módulo', description: 'Resto da divisão' },
  { symbol: '>', name: 'Maior que', description: 'Verifica se o primeiro valor é maior' },
  { symbol: '<', name: 'Menor que', description: 'Verifica se o primeiro valor é menor' },
  { symbol: '>=', name: 'Maior ou igual', description: 'Verifica se o primeiro valor é maior ou igual' },
  { symbol: '<=', name: 'Menor ou igual', description: 'Verifica se o primeiro valor é menor ou igual' },
  { symbol: '==', name: 'Igual', description: 'Verifica se os valores são iguais' },
  { symbol: '!=', name: 'Diferente', description: 'Verifica se os valores são diferentes' },
  { symbol: '&&', name: 'E lógico', description: 'Ambas as condições devem ser verdadeiras' },
  { symbol: '||', name: 'Ou lógico', description: 'Pelo menos uma condição deve ser verdadeira' }
];

// Templates de fórmulas prontas
const FORMULA_TEMPLATES = [
  {
    name: 'Crescimento Percentual',
    description: 'Calcula a taxa de crescimento entre períodos',
    formula: '((total_messages - prev_total_messages) / prev_total_messages) * 100',
    category: 'Crescimento',
    difficulty: 'Básico',
    variables: ['total_messages', 'prev_total_messages']
  },
  {
    name: 'Concentração de Atividade',
    description: 'Verifica se poucos membros dominam as conversas',
    formula: '(top3_members_messages / total_messages) * 100',
    category: 'Distribuição',
    difficulty: 'Intermediário',
    variables: ['top3_members_messages', 'total_messages']
  },
  {
    name: 'Qualidade Baixa',
    description: 'Detecta quando mensagens são muito curtas e sem mídia',
    formula: 'avg_message_length < 10 && media_ratio < 0.1',
    category: 'Qualidade',
    difficulty: 'Intermediário',
    variables: ['avg_message_length', 'media_ratio']
  },
  {
    name: 'Pico Anômalo',
    description: 'Identifica picos suspeitos de atividade',
    formula: 'peak_activity_ratio > 5 && peak_duration_hours < 2',
    category: 'Anomalias',
    difficulty: 'Avançado',
    variables: ['peak_activity_ratio', 'peak_duration_hours']
  },
  {
    name: 'Engajamento Balanceado',
    description: 'Verifica se há boa distribuição de participação',
    formula: 'participation_diversity_index > 0.7 && participation_rate > 20',
    category: 'Engajamento',
    difficulty: 'Avançado',
    variables: ['participation_diversity_index', 'participation_rate']
  }
];

interface Condition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
}

interface CustomFormula {
  name: string;
  description: string;
  expression: string;
  variables: string[];
  conditions: Condition[];
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface FormulaBuilderProps {
  onSave?: (formula: CustomFormula) => void;
  initialFormula?: Partial<CustomFormula>;
  onCancel?: () => void;
}

export function FormulaBuilder({ onSave, initialFormula, onCancel }: FormulaBuilderProps) {
  const { toast } = useToast();
  
  // Estados do formulário
  const [formula, setFormula] = useState<CustomFormula>({
    name: '',
    description: '',
    expression: '',
    variables: [],
    conditions: [],
    category: 'custom',
    priority: 'medium',
    ...initialFormula
  });

  // Estados da interface
  const [selectedTab, setSelectedTab] = useState('visual');
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Atualizar fórmula
  const updateFormula = (updates: Partial<CustomFormula>) => {
    setFormula(prev => ({ ...prev, ...updates }));
  };

  // Adicionar variável à expressão
  const addVariable = (variableName: string) => {
    const newExpression = formula.expression + (formula.expression ? ' ' : '') + variableName;
    updateFormula({ 
      expression: newExpression,
      variables: [...new Set([...formula.variables, variableName])]
    });
  };

  // Adicionar operador à expressão
  const addOperator = (operator: string) => {
    const newExpression = formula.expression + (formula.expression ? ' ' : '') + operator;
    updateFormula({ expression: newExpression });
  };

  // Adicionar condição
  const addCondition = () => {
    const newCondition: Condition = {
      field: 'result',
      operator: 'gt',
      value: 0
    };
    updateFormula({
      conditions: [...formula.conditions, newCondition]
    });
  };

  // Remover condição
  const removeCondition = (index: number) => {
    updateFormula({
      conditions: formula.conditions.filter((_, i) => i !== index)
    });
  };

  // Atualizar condição
  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const updatedConditions = formula.conditions.map((condition, i) =>
      i === index ? { ...condition, ...updates } : condition
    );
    updateFormula({ conditions: updatedConditions });
  };

  // Validar fórmula
  const validateFormula = () => {
    const errors: string[] = [];

    if (!formula.name.trim()) {
      errors.push('Nome da fórmula é obrigatório');
    }

    if (!formula.expression.trim()) {
      errors.push('Expressão da fórmula é obrigatória');
    }

    if (formula.conditions.length === 0) {
      errors.push('Pelo menos uma condição de ativação é necessária');
    }

    // Validar se todas as variáveis usadas na expressão estão disponíveis
    const allVariables = AVAILABLE_VARIABLES.flatMap(cat => cat.variables.map(v => v.name));
    const usedVariables = formula.variables;
    const invalidVariables = usedVariables.filter(v => !allVariables.includes(v));
    
    if (invalidVariables.length > 0) {
      errors.push(`Variáveis inválidas: ${invalidVariables.join(', ')}`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Testar fórmula com dados simulados
  const testFormula = () => {
    if (!validateFormula()) return;

    // Dados simulados para teste
    const testData = {
      total_messages: 150,
      active_members: 25,
      member_count: 100,
      avg_messages_day: 21.4,
      avg_messages_member: 6.0,
      participation_rate: 25,
      message_growth_rate: 15,
      prev_total_messages: 130,
      avg_message_length: 45,
      media_ratio: 0.15,
      concentration_index: 0.3,
      peak_activity_ratio: 2.5,
      peak_duration_hours: 4
    };

    try {
      // Simular avaliação da expressão (em produção usaria um parser seguro)
      let expression = formula.expression;
      
      // Substituir variáveis pelos valores de teste
      Object.entries(testData).forEach(([key, value]) => {
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      });

      // Avaliação básica (em produção seria mais segura)
      const result = eval(expression);
      
      // Verificar condições
      const conditionResults = formula.conditions.map(condition => {
        const value = condition.field === 'result' ? result : testData[condition.field as keyof typeof testData];
        
        switch (condition.operator) {
          case 'gt': return value > (condition.value as number);
          case 'lt': return value < (condition.value as number);
          case 'gte': return value >= (condition.value as number);
          case 'lte': return value <= (condition.value as number);
          case 'eq': return value === condition.value;
          case 'between': 
            const [min, max] = condition.value as [number, number];
            return value >= min && value <= max;
          default: return false;
        }
      });

      const triggered = conditionResults.every(Boolean);

      setPreviewResult({
        expression: formula.expression,
        substituted: expression,
        result,
        triggered,
        conditionResults,
        testData
      });

      toast({
        title: triggered ? 'Fórmula ativada!' : 'Fórmula não ativada',
        description: `Resultado: ${result}${typeof result === 'number' ? '' : ''} - ${triggered ? 'Todas as condições foram atendidas' : 'Algumas condições não foram atendidas'}`,
        variant: triggered ? 'default' : 'destructive'
      });

    } catch (error) {
      toast({
        title: 'Erro na fórmula',
        description: 'Expressão inválida. Verifique a sintaxe.',
        variant: 'destructive'
      });
    }
  };

  // Carregar template
  const loadTemplate = (template: typeof FORMULA_TEMPLATES[0]) => {
    updateFormula({
      name: template.name,
      description: template.description,
      expression: template.formula,
      variables: template.variables,
      category: template.category.toLowerCase()
    });
    setShowTemplates(false);
    toast({
      title: 'Template carregado',
      description: `Fórmula "${template.name}" foi carregada com sucesso.`
    });
  };

  // Salvar fórmula
  const handleSave = () => {
    if (validateFormula()) {
      onSave?.(formula);
      toast({
        title: 'Fórmula salva',
        description: 'Sua fórmula customizada foi salva com sucesso.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Construtor de Fórmulas</h2>
          <p className="text-muted-foreground">
            Crie insights personalizados com fórmulas matemáticas e condições lógicas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" onClick={testFormula}>
            <Play className="h-4 w-4 mr-2" />
            Testar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Configurações básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Fórmula</Label>
              <Input
                value={formula.name}
                onChange={(e) => updateFormula({ name: e.target.value })}
                placeholder="Ex: Crescimento Acelerado"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formula.category} onValueChange={(value) => updateFormula({ category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Personalizado</SelectItem>
                  <SelectItem value="crescimento">Crescimento</SelectItem>
                  <SelectItem value="engajamento">Engajamento</SelectItem>
                  <SelectItem value="qualidade">Qualidade</SelectItem>
                  <SelectItem value="distribuição">Distribuição</SelectItem>
                  <SelectItem value="temporal">Temporal</SelectItem>
                  <SelectItem value="anomalias">Anomalias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={formula.priority} onValueChange={(value: any) => updateFormula({ priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formula.description}
              onChange={(e) => updateFormula({ description: e.target.value })}
              placeholder="Descreva o que esta fórmula detecta e quando deve ser ativada..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Construtor da fórmula */}
      <Card>
        <CardHeader>
          <CardTitle>Construtor de Expressão</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="code">Código</TabsTrigger>
              <TabsTrigger value="data">Explorar Dados</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4">
              {/* Paleta de variáveis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label className="text-base font-medium">Variáveis Disponíveis</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                      {AVAILABLE_VARIABLES.map(category => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <category.icon className="h-4 w-4" />
                            {category.category}
                          </div>
                          {category.variables.map(variable => (
                            <Button
                              key={variable.name}
                              variant="outline"
                              size="sm"
                              className="justify-start text-xs h-8"
                              onClick={() => addVariable(variable.name)}
                            >
                              {variable.name}
                            </Button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operadores */}
                  <div>
                    <Label className="text-base font-medium">Operadores</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {OPERATORS.map(operator => (
                        <Button
                          key={operator.symbol}
                          variant="outline"
                          size="sm"
                          onClick={() => addOperator(operator.symbol)}
                          title={operator.description}
                        >
                          {operator.symbol}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview da expressão */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Expressão Atual</Label>
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[100px] font-mono text-sm">
                      {formula.expression || 'Clique nas variáveis e operadores para construir sua fórmula'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFormula({ expression: '' })}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label>Expressão Matemática</Label>
                <Textarea
                  value={formula.expression}
                  onChange={(e) => updateFormula({ expression: e.target.value })}
                  placeholder="Ex: ((total_messages - prev_total_messages) / prev_total_messages) * 100"
                  rows={6}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Use variáveis, operadores matemáticos (+, -, *, /, %) e lógicos (&gt;, &lt;, ==, &&, ||)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <DataAnalyzer onSelectVariable={addVariable} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Condições de ativação */}
      <Card>
        <CardHeader>
          <CardTitle>Condições de Ativação</CardTitle>
          <CardDescription>
            Defina quando este insight deve ser ativado baseado no resultado da fórmula
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formula.conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-4 gap-2">
                <Select
                  value={condition.field}
                  onValueChange={(value) => updateCondition(index, { field: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="result">Resultado da fórmula</SelectItem>
                    {AVAILABLE_VARIABLES.flatMap(cat => 
                      cat.variables.map(v => (
                        <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(value: any) => updateCondition(index, { operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">Maior que</SelectItem>
                    <SelectItem value="gte">Maior ou igual</SelectItem>
                    <SelectItem value="lt">Menor que</SelectItem>
                    <SelectItem value="lte">Menor ou igual</SelectItem>
                    <SelectItem value="eq">Igual a</SelectItem>
                    <SelectItem value="between">Entre</SelectItem>
                  </SelectContent>
                </Select>

                {condition.operator === 'between' ? (
                  <div className="col-span-2 flex gap-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={Array.isArray(condition.value) ? condition.value[0] : ''}
                      onChange={(e) => {
                        const currentValue = Array.isArray(condition.value) ? condition.value : [0, 100];
                        updateCondition(index, { value: [Number(e.target.value), currentValue[1]] });
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={Array.isArray(condition.value) ? condition.value[1] : ''}
                      onChange={(e) => {
                        const currentValue = Array.isArray(condition.value) ? condition.value : [0, 100];
                        updateCondition(index, { value: [currentValue[0], Number(e.target.value)] });
                      }}
                    />
                  </div>
                ) : (
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={typeof condition.value === 'number' ? condition.value : ''}
                    onChange={(e) => updateCondition(index, { value: Number(e.target.value) })}
                  />
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCondition(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addCondition}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Condição
          </Button>
        </CardContent>
      </Card>

      {/* Validação e preview */}
      {(validationErrors.length > 0 || previewResult) && (
        <Card>
          <CardHeader>
            <CardTitle>Validação e Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationErrors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Erros encontrados:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {previewResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Resultado do teste:</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Expressão:</Label>
                    <p className="font-mono bg-muted p-2 rounded">{previewResult.expression}</p>
                  </div>
                  <div>
                    <Label>Resultado:</Label>
                    <p className="font-mono bg-muted p-2 rounded">{previewResult.result}</p>
                  </div>
                </div>

                <div>
                  <Label>Status:</Label>
                  <Badge variant={previewResult.triggered ? 'default' : 'secondary'}>
                    {previewResult.triggered ? 'Insight ativado' : 'Insight não ativado'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de templates */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates de Fórmulas</DialogTitle>
            <DialogDescription>
              Escolha um template para começar rapidamente
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            {FORMULA_TEMPLATES.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:ring-2 hover:ring-blue-500/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{template.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Fórmula:</Label>
                      <p className="font-mono text-xs bg-muted p-2 rounded">{template.formula}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{template.category}</Badge>
                      <Button size="sm" onClick={() => loadTemplate(template)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Usar Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 