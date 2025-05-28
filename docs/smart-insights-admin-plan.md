# 🎯 PLANO ESTRATÉGICO: PAINEL ADMINISTRADOR SMART INSIGHTS

## 📊 VISÃO GERAL

O Painel Administrador Smart Insights é um sistema avançado que permite aos usuários:
- **Ativar/Desativar** insights específicos por grupo
- **Criar Insights Customizados** com fórmulas próprias
- **Gerenciar Templates** de insights modulares
- **Configurar Alertas** baseados em métricas específicas

---

## 🏗️ ARQUITETURA DO SISTEMA

### 1. ESTRUTURA DE DADOS EXPANDIDA

#### Tabela: `insight_preferences`
```sql
CREATE TABLE insight_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES groups(id),
  insight_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  custom_threshold JSONB,
  notification_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `custom_insights`
```sql
CREATE TABLE custom_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  formula JSONB NOT NULL, -- Estrutura da fórmula
  variables JSONB NOT NULL, -- Variáveis utilizadas
  conditions JSONB NOT NULL, -- Condições de ativação
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  category TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `insight_alerts`
```sql
CREATE TABLE insight_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES groups(id),
  insight_id TEXT, -- ID do insight que gerou o alerta
  custom_insight_id UUID REFERENCES custom_insights(id),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  data JSONB NOT NULL -- Dados do insight quando foi ativado
);
```

### 2. VARIÁVEIS DISPONÍVEIS PARA FÓRMULAS

#### 📈 Métricas Básicas
- `total_messages` - Total de mensagens no período
- `active_members` - Membros ativos no período
- `avg_messages_day` - Média de mensagens por dia
- `avg_messages_member` - Média de mensagens por membro
- `member_count` - Total de membros no grupo
- `participation_rate` - Taxa de participação (%)

#### 📊 Métricas Avançadas
- `message_growth_rate` - Taxa de crescimento de mensagens (%)
- `member_growth_rate` - Taxa de crescimento de membros (%)
- `consistency_score` - Score de consistência de atividade
- `concentration_index` - Índice de concentração de atividade
- `peak_activity_ratio` - Razão entre pico e média
- `weekend_activity_ratio` - Razão atividade fim de semana/semana

#### ⏰ Métricas Temporais
- `morning_activity` - Atividade manhã (6h-12h)
- `afternoon_activity` - Atividade tarde (12h-18h)
- `evening_activity` - Atividade noite (18h-23h)
- `night_activity` - Atividade madrugada (23h-6h)
- `weekday_vs_weekend` - Comparação semana vs fim de semana

#### 🎯 Métricas de Qualidade
- `avg_message_length` - Comprimento médio das mensagens
- `media_ratio` - Proporção de mensagens com mídia
- `response_rate` - Taxa de resposta entre membros
- `conversation_depth` - Profundidade das conversas

---

## 🎨 COMPONENTES DO PAINEL

### 1. DASHBOARD PRINCIPAL (`/admin/insights`)

```typescript
interface AdminInsightsDashboard {
  // Estado geral dos insights
  totalInsights: number;
  activeInsights: number;
  customInsights: number;
  pendingAlerts: number;
  
  // Filtros e controles
  groupFilters: string[];
  categoryFilters: string[];
  priorityFilters: string[];
  
  // Dados dos insights
  insightsList: InsightOverview[];
  customInsightsList: CustomInsight[];
  recentAlerts: Alert[];
}
```

### 2. GERENCIADOR DE INSIGHTS (`/admin/insights/manage`)

#### Seção: Insights Padrão
- Lista todos os tipos de insights disponíveis
- Toggle para ativar/desativar por grupo
- Configuração de thresholds personalizados
- Configuração de notificações

#### Seção: Insights Customizados
- Criador visual de fórmulas
- Seletor de variáveis
- Preview em tempo real
- Teste com dados históricos

### 3. CONSTRUTOR DE FÓRMULAS (`/admin/insights/formula-builder`)

```typescript
interface FormulaBuilder {
  // Estrutura da fórmula
  formula: {
    name: string;
    description: string;
    expression: string; // Ex: "(total_messages / active_members) > 10"
    variables: Variable[];
    conditions: Condition[];
  };
  
  // Variáveis utilizadas
  selectedVariables: Variable[];
  
  // Condições de ativação
  triggers: {
    operator: 'greater' | 'less' | 'equal' | 'between';
    value: number | string;
    timeframe: 'daily' | 'weekly' | 'monthly';
  }[];
  
  // Preview e teste
  testResults: TestResult[];
  previewData: PreviewData;
}
```

### 4. CONFIGURADOR DE ALERTAS (`/admin/insights/alerts`)

```typescript
interface AlertConfig {
  // Configurações de notificação
  email: boolean;
  push: boolean;
  inApp: boolean;
  
  // Frequência
  frequency: 'immediate' | 'daily' | 'weekly';
  
  // Filtros
  priorities: string[];
  categories: string[];
  groups: string[];
  
  // Horários
  quietHours: {
    start: string;
    end: string;
    enabled: boolean;
  };
}
```

---

## 🔧 FUNCIONALIDADES PRINCIPAIS

### 1. GERENCIAMENTO DE INSIGHTS PADRÃO

#### Ativar/Desativar Insights
```typescript
const toggleInsight = async (
  insightType: string, 
  groupId: string, 
  enabled: boolean
) => {
  await supabase
    .from('insight_preferences')
    .upsert({
      user_id: user.id,
      group_id: groupId,
      insight_type: insightType,
      enabled: enabled
    });
};
```

#### Personalizar Thresholds
```typescript
const updateThreshold = async (
  insightType: string,
  groupId: string,
  customThreshold: Record<string, any>
) => {
  await supabase
    .from('insight_preferences')
    .upsert({
      user_id: user.id,
      group_id: groupId,
      insight_type: insightType,
      custom_threshold: customThreshold
    });
};
```

### 2. CRIAÇÃO DE INSIGHTS CUSTOMIZADOS

#### Sistema de Fórmulas
```typescript
interface CustomFormula {
  name: string;
  expression: string; // Ex: "((total_messages - prev_total_messages) / prev_total_messages) * 100"
  variables: {
    current: string[]; // Variáveis do período atual
    previous: string[]; // Variáveis do período anterior
    calculated: string[]; // Variáveis calculadas
  };
  conditions: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: number | [number, number];
  }[];
}
```

#### Exemplos de Fórmulas Predefinidas
```typescript
const FORMULA_TEMPLATES = {
  "crescimento_acelerado": {
    name: "Crescimento Acelerado",
    expression: "((current.total_messages - previous.total_messages) / previous.total_messages) * 100",
    conditions: [
      { field: "result", operator: "gt", value: 50 }
    ]
  },
  
  "concentracao_extrema": {
    name: "Concentração Extrema",
    expression: "(top3_members_messages / total_messages) * 100",
    conditions: [
      { field: "result", operator: "gt", value: 80 }
    ]
  },
  
  "atividade_baixa_qualidade": {
    name: "Atividade de Baixa Qualidade",
    expression: "avg_message_length < 10 && media_ratio < 0.1",
    conditions: [
      { field: "avg_message_length", operator: "lt", value: 10 },
      { field: "media_ratio", operator: "lt", value: 0.1 }
    ]
  },
  
  "pico_suspeito": {
    name: "Pico Suspeito",
    expression: "peak_activity_ratio > 5 && peak_duration < 2",
    conditions: [
      { field: "peak_activity_ratio", operator: "gt", value: 5 },
      { field: "peak_duration_hours", operator: "lt", value: 2 }
    ]
  }
};
```

### 3. SISTEMA DE AVALIAÇÃO DE FÓRMULAS

```typescript
class FormulaEvaluator {
  static evaluate(formula: CustomFormula, data: GroupAnalysisData): InsightResult {
    // 1. Extrair variáveis dos dados
    const variables = this.extractVariables(data, formula.variables);
    
    // 2. Calcular expressão
    const result = this.calculateExpression(formula.expression, variables);
    
    // 3. Verificar condições
    const triggered = this.checkConditions(formula.conditions, result, variables);
    
    // 4. Gerar insight se triggered
    if (triggered) {
      return this.generateInsight(formula, result, data);
    }
    
    return null;
  }
  
  private static extractVariables(data: GroupAnalysisData, variableConfig: any) {
    // Extrair todas as variáveis necessárias dos dados
    return {
      // Básicas
      total_messages: data.dailyStats.reduce((sum, day) => sum + day.total_messages, 0),
      active_members: new Set(data.memberStats.filter(m => m.message_count > 0).map(m => m.name)).size,
      
      // Calculadas
      avg_messages_day: this.calculateAvgMessagesPerDay(data),
      participation_rate: this.calculateParticipationRate(data),
      concentration_index: this.calculateConcentrationIndex(data),
      
      // Temporais
      weekend_activity: this.calculateWeekendActivity(data),
      peak_activity_ratio: this.calculatePeakRatio(data),
      
      // Qualidade
      avg_message_length: this.calculateAvgMessageLength(data),
      media_ratio: this.calculateMediaRatio(data)
    };
  }
}
```

---

## 🎨 INTERFACE DO USUÁRIO

### 1. CARDS DE INSIGHT CONFIGURÁVEIS

```typescript
interface ConfigurableInsightCard {
  insight: SmartInsight;
  configuration: {
    enabled: boolean;
    threshold: Record<string, any>;
    priority: 'critical' | 'high' | 'medium' | 'low';
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  
  // Ações disponíveis
  onToggle: (enabled: boolean) => void;
  onConfigureThreshold: () => void;
  onConfigureNotifications: () => void;
  onEdit: () => void; // Para insights customizados
  onDelete: () => void; // Para insights customizados
}
```

### 2. CONSTRUTOR VISUAL DE FÓRMULAS

```typescript
interface VisualFormulaBuilder {
  // Componentes drag-and-drop
  variableLibrary: Variable[];
  operatorLibrary: Operator[];
  conditionBuilder: ConditionBuilder;
  
  // Canvas de construção
  formulaCanvas: FormulaNode[];
  
  // Preview em tempo real
  livePreview: {
    expression: string;
    result: number | boolean;
    explanation: string;
  };
  
  // Validação
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}
```

### 3. PAINEL DE CONTROLE CENTRALIZADO

```typescript
interface AdminControlPanel {
  // Estatísticas gerais
  stats: {
    totalInsights: number;
    activeInsights: number;
    customInsights: number;
    alertsTriggered: number;
  };
  
  // Filtros globais
  filters: {
    groups: string[];
    categories: string[];
    priorities: string[];
    dateRange: DateRange;
  };
  
  // Ações em lote
  bulkActions: {
    toggleMultiple: (insightIds: string[], enabled: boolean) => void;
    updateThresholds: (updates: ThresholdUpdate[]) => void;
    exportConfiguration: () => void;
    importConfiguration: (config: Configuration) => void;
  };
}
```

---

## 🚀 IMPLEMENTAÇÃO INICIAL

### Fase 1: Infraestrutura Base (Semana 1)
1. ✅ Criar tabelas no banco de dados
2. ✅ Implementar hooks para gerenciamento de preferências
3. ✅ Criar página base do admin (`/admin/insights`)
4. ✅ Implementar toggle básico de insights

### Fase 2: Configuração Avançada (Semana 2)
1. ✅ Personalização de thresholds
2. ✅ Sistema de notificações
3. ✅ Filtros e busca
4. ✅ Configuração por grupo

### Fase 3: Insights Customizados (Semana 3)
1. ✅ Construtor de fórmulas básico
2. ✅ Sistema de avaliação de expressões
3. ✅ Templates de fórmulas predefinidas
4. ✅ Preview e teste

### Fase 4: Interface Avançada (Semana 4)
1. ✅ Construtor visual drag-and-drop
2. ✅ Editor de código para fórmulas
3. ✅ Sistema de validação robusto
4. ✅ Documentação integrada

---

## 📋 CHECKLIST DE DESENVOLVIMENTO

### Backend
- [ ] Migrations para novas tabelas
- [ ] Policies RLS para segurança
- [ ] Triggers para auditoria
- [ ] Funções SQL para cálculos complexos

### Frontend
- [ ] Página admin principal
- [ ] Gerenciador de insights padrão
- [ ] Construtor de fórmulas
- [ ] Sistema de alertas
- [ ] Configuração de notificações

### Integração
- [ ] Modificar insights-engine para usar preferências
- [ ] Integrar insights customizados no fluxo principal
- [ ] Sistema de avaliação de fórmulas
- [ ] Cache para performance

### Testes
- [ ] Testes unitários para avaliador de fórmulas
- [ ] Testes de integração para preferências
- [ ] Testes E2E para fluxo completo
- [ ] Testes de performance com muitos insights

---

Este plano estratégico fornece uma base sólida para implementar um sistema completo de administração de Smart Insights, permitindo máxima personalização e controle para os usuários. 