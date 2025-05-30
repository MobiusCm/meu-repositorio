# Guia de Templates - Sistema Modular de Relatórios

## Visão Geral

O sistema de templates do Omnys é projetado para ser modular, extensível e fácil de manter. Cada template é um arquivo independente que define suas próprias seções, formatos suportados e configurações padrão.

## Arquitetura do Sistema

### Estrutura de Diretórios

```
lib/reports/
├── templates/
│   ├── complete.ts      # Template completo
│   ├── members.ts       # Template focado em membros
│   ├── executive.ts     # Template executivo
│   └── index.ts         # Registry central e utilitários
├── types.ts             # Definições de tipos
└── index.ts             # Exportações principais
```

### Componentes Principais

1. **TemplateConfig**: Interface que define a estrutura de um template
2. **ReportSection**: Interface que define uma seção individual
3. **TEMPLATE_REGISTRY**: Registro central de todos os templates
4. **Funções Utilitárias**: Helpers para validação e manipulação

## Anatomia de um Template

### Estrutura Básica

```typescript
import { TemplateConfig, ReportSection } from '../types';

// 1. Definir seções disponíveis
const TEMPLATE_SECTIONS: ReportSection[] = [
  {
    id: 'uniqueId',
    name: 'Nome da Seção',
    description: 'Descrição detalhada',
    category: 'overview', // overview, activity, members, trends, behavior, content, insights
    available: true,
    required: false, // true para seções obrigatórias
    estimatedSize: 'medium' // small, medium, large
  }
];

// 2. Configurar o template
export const meuTemplate: TemplateConfig = {
  id: 'meu-template',
  name: 'Meu Template',
  description: 'Descrição do que o template faz',
  icon: 'IconName', // Nome do ícone Lucide
  previewSupported: true,
  estimatedTime: '2-3 minutos',
  complexity: 'intermediate', // basic, intermediate, advanced
  requiredData: ['daily_stats'], // Dados necessários
  formats: ['pdf', 'csv'], // Formatos suportados
  sections: TEMPLATE_SECTIONS,
  defaultOptions: {
    // Configurações padrão (ver seção abaixo)
  }
};
```

## Categorias de Seções

### Overview (Visão Geral)
- `generalStats`: Estatísticas gerais
- `executiveSummary`: Resumo executivo

### Activity (Atividade)
- `dailyActivity`: Atividade diária
- `hourlyActivity`: Atividade por hora
- `activityPatterns`: Padrões de atividade

### Members (Membros)
- `memberRanking`: Ranking de membros
- `memberEvolution`: Evolução dos membros
- `memberConcentration`: Concentração de atividade
- `participationTrends`: Tendências de participação
- `influencerAnalysis`: Análise de influenciadores

### Trends (Tendências)
- `trendAnalysis`: Análise de tendências
- `seasonalPatterns`: Padrões sazonais

### Behavior (Comportamento)
- `engagementAnalysis`: Análise de engajamento
- `activityPeaks`: Picos de atividade
- `consistencyAnalysis`: Análise de consistência

### Content (Conteúdo)
- `wordStatistics`: Estatísticas de palavras
- `mediaAnalysis`: Análise de mídia

### Insights
- `keyInsights`: Insights principais
- `anomalyDetection`: Detecção de anomalias
- `growthProjections`: Projeções de crescimento

## Configurações Padrão (defaultOptions)

### Seções Incluídas
```typescript
// Controle de quais seções incluir
includeGeneralStats: boolean;
includeDailyActivity: boolean;
includeMemberRanking: boolean;
includeHourlyActivity: boolean;
includeInsights: boolean;
// ... mais opções
```

### Configurações Visuais
```typescript
// Tema e estilo
colorTheme: 'blue' | 'green' | 'purple' | 'red';
rankingDisplay: 'table' | 'cards' | 'minimal';
reportStyle: 'standard' | 'detailed' | 'executive';
chartStyle: 'modern' | 'minimal' | 'classic';

// Opções de gráficos
showGridLines: boolean;
showDataLabels: boolean;
useGradients: boolean;
animatedCharts: boolean;
```

### Configurações de Conteúdo
```typescript
// Controle de dados
maxMembersInRanking: number;
insightDepth: 'basic' | 'intermediate' | 'advanced';
memberDisplayMode: 'minimal' | 'detailed' | 'comprehensive';

// Recursos extras
includeRecommendations: boolean;
includeActionItems: boolean;
includeRiskAssessment: boolean;
watermark: boolean;
logoInclude: boolean;
```

## Como Criar um Novo Template

### Passo 1: Criar o Arquivo do Template

```typescript
// lib/reports/templates/meu-novo-template.ts
import { TemplateConfig, ReportSection } from '../types';

const MEU_TEMPLATE_SECTIONS: ReportSection[] = [
  {
    id: 'customSection1',
    name: 'Minha Seção Personalizada',
    description: 'Uma seção específica para meu caso de uso',
    category: 'overview',
    available: true,
    required: true,
    estimatedSize: 'medium'
  },
  // Adicionar mais seções conforme necessário
];

export const meuNovoTemplate: TemplateConfig = {
  id: 'meu-novo-template',
  name: 'Meu Novo Template',
  description: 'Template personalizado para casos específicos',
  icon: 'FileText',
  previewSupported: true,
  estimatedTime: '2-4 minutos',
  complexity: 'intermediate',
  requiredData: ['daily_stats', 'member_stats'],
  formats: ['pdf', 'csv'],
  sections: MEU_TEMPLATE_SECTIONS,
  defaultOptions: {
    includeGeneralStats: true,
    includeDailyActivity: false,
    // ... configurar todas as opções necessárias
    colorTheme: 'blue',
    reportStyle: 'standard',
    maxMembersInRanking: 15,
    insightDepth: 'intermediate',
    includeRecommendations: true,
    watermark: true,
    logoInclude: true
  }
};
```

### Passo 2: Registrar o Template

```typescript
// lib/reports/templates/index.ts

// 1. Importar o novo template
import { meuNovoTemplate } from './meu-novo-template';

// 2. Adicionar ao registry
export const TEMPLATE_REGISTRY: Record<ReportTemplate, TemplateConfig> = {
  complete: completeTemplate,
  members: membersTemplate,
  executive: executiveTemplate,
  'meu-novo-template': meuNovoTemplate, // Adicionar aqui
  // ... outros templates
};
```

### Passo 3: Atualizar os Tipos

```typescript
// lib/reports/types.ts

// Adicionar o novo template ao tipo union
export type ReportTemplate = 
  | 'complete'
  | 'members' 
  | 'executive'
  | 'meu-novo-template' // Adicionar aqui
  | 'analytics'
  | 'trends'
  | 'insights'
  | 'comparison';
```

### Passo 4: Adicionar à Interface

```typescript
// app/reports/page.tsx

// O template aparecerá automaticamente na interface quando:
// 1. Estiver no TEMPLATE_REGISTRY
// 2. Tiver as propriedades necessárias configuradas
// 3. A validação passar

// Exemplo de como seria exibido:
{Object.values(TEMPLATE_REGISTRY).slice(0, 3).map((template) => {
  // Seu template aparecerá aqui automaticamente
})}
```

## Validações e Boas Práticas

### Validação Automática

O sistema inclui validações automáticas:

```typescript
// Valida se todas as seções estão disponíveis
export function validateTemplateConfig(template: TemplateConfig): boolean {
  // Verificações automáticas de:
  // - Seções disponíveis
  // - Formatos válidos
  // - Dados necessários
}
```

### Boas Práticas

1. **Nomear Seções Claramente**
   - Use IDs únicos e descritivos
   - Forneça descrições úteis
   - Categorize adequadamente

2. **Configurar Formatos Apropriados**
   - CSV: Para dados tabulares
   - PDF: Para relatórios formatados
   - PNG: Para visualizações gráficas

3. **Definir Complexidade Corretamente**
   - `basic`: Templates simples, poucas seções
   - `intermediate`: Balanceado, seções principais
   - `advanced`: Completo, todas as seções

4. **Estimar Tempo Realisticamente**
   - Considere o número de seções
   - Leve em conta a complexidade dos dados
   - Teste com dados reais

## Extensibilidade

### Adicionando Novas Seções

```typescript
// 1. Definir a nova seção
const novaSecao: ReportSection = {
  id: 'minhaNovaSecao',
  name: 'Minha Nova Análise',
  description: 'Análise específica personalizada',
  category: 'insights',
  available: true,
  premium: true, // Opcional: marcar como premium
  estimatedSize: 'large'
};

// 2. Adicionar às seções disponíveis
export const AVAILABLE_SECTIONS: Record<string, ReportSection[]> = {
  insights: [
    // ... seções existentes
    novaSecao
  ]
};
```

### Criando Categorias Personalizadas

```typescript
// Adicionar nova categoria
export const AVAILABLE_SECTIONS: Record<string, ReportSection[]> = {
  // ... categorias existentes
  'minha-categoria': [
    {
      id: 'secaoPersonalizada',
      name: 'Seção da Minha Categoria',
      description: 'Descrição específica',
      category: 'minha-categoria',
      available: true,
      estimatedSize: 'medium'
    }
  ]
};
```

## Utilitários Disponíveis

### Funções Helper

```typescript
// Buscar template por ID
const template = getTemplateById('complete');

// Buscar todos os templates
const todos = getAllTemplates();

// Filtrar por complexidade
const basicos = getTemplatesByComplexity('basic');

// Filtrar por formato
const pdfs = getTemplatesByFormat('pdf');

// Buscar seções por categoria
const membrosSecoes = getSectionsByCategory('members');

// Validar se template suporta formato
const suportaPNG = templateSupportsFormat('complete', 'png');

// Criar template personalizado
const customTemplate = createCustomTemplate('custom-id', {
  name: 'Template Personalizado',
  // ... outras configurações
});
```

### Validações

```typescript
// Validar configuração do template
const isValid = validateTemplateConfig(meuTemplate);

// Obter tamanho estimado
const tamanho = getEstimatedSize(template.sections);

// Buscar seção por ID
const secao = getSectionById('memberRanking');
```

## Exemplo Completo

```typescript
// lib/reports/templates/analytics-template.ts
import { TemplateConfig, ReportSection } from '../types';

const ANALYTICS_SECTIONS: ReportSection[] = [
  {
    id: 'performanceMetrics',
    name: 'Métricas de Performance',
    description: 'KPIs principais e indicadores de saúde do grupo',
    category: 'overview',
    available: true,
    required: true,
    estimatedSize: 'medium'
  },
  {
    id: 'behaviorAnalysis',
    name: 'Análise Comportamental',
    description: 'Padrões de comportamento e interação',
    category: 'behavior',
    available: true,
    estimatedSize: 'large'
  },
  {
    id: 'predictiveInsights',
    name: 'Insights Preditivos',
    description: 'Previsões baseadas em machine learning',
    category: 'insights',
    available: true,
    premium: true,
    estimatedSize: 'medium'
  }
];

export const analyticsTemplate: TemplateConfig = {
  id: 'analytics',
  name: 'Relatório de Analytics',
  description: 'Análise avançada com métricas de performance e insights preditivos.',
  icon: 'TrendingUp',
  previewSupported: true,
  estimatedTime: '4-6 minutos',
  complexity: 'advanced',
  requiredData: ['daily_stats', 'member_stats', 'hourly_activity'],
  formats: ['pdf', 'csv'],
  sections: ANALYTICS_SECTIONS,
  defaultOptions: {
    includeGeneralStats: true,
    includeDailyActivity: true,
    includeMemberRanking: false,
    includeHourlyActivity: true,
    includeInsights: true,
    includeActivityPatterns: true,
    includeEngagementAnalysis: true,
    includeTrendAnalysis: true,
    includeAnomalyDetection: true,
    includeGrowthProjections: true,
    colorTheme: 'purple',
    reportStyle: 'detailed',
    chartStyle: 'modern',
    maxMembersInRanking: 10,
    insightDepth: 'advanced',
    includeRecommendations: true,
    includeActionItems: true,
    includeRiskAssessment: true,
    watermark: true,
    logoInclude: true
  }
};
```

## Considerações de Performance

### Otimização de Templates

1. **Seções Condicionais**: Use seções opcionais para reduzir tempo de processamento
2. **Dados Necessários**: Especifique apenas os dados realmente necessários
3. **Tamanho Estimado**: Configure corretamente para expectativas do usuário
4. **Formatos Apropriados**: CSV para dados, PDF para apresentação

### Monitoramento

```typescript
// Exemplo de como monitorar performance
const startTime = Date.now();
const resultado = await ReportSystem.generateReport(/* parâmetros */);
const duration = Date.now() - startTime;

console.log(`Template ${templateId} processado em ${duration}ms`);
```

## Troubleshooting

### Problemas Comuns

1. **Template não aparece na interface**
   - Verificar se está no TEMPLATE_REGISTRY
   - Verificar se a validação está passando
   - Conferir se os tipos estão corretos

2. **Erro ao gerar relatório**
   - Verificar se todos os dados necessários estão disponíveis
   - Confirmar se as seções estão implementadas
   - Checar se os formatos são suportados

3. **Preview não funciona**
   - Definir `previewSupported: true`
   - Implementar seções no componente de preview
   - Verificar se os dados estão sendo passados corretamente

### Debug

```typescript
// Habilitar logs de debug
console.log('Template config:', getTemplateById('meu-template'));
console.log('Seções disponíveis:', getTemplateSections('meu-template'));
console.log('Suporta PDF:', templateSupportsFormat('meu-template', 'pdf'));
```

---

## Conclusão

O sistema modular de templates permite:

- ✅ **Extensibilidade**: Fácil adição de novos templates
- ✅ **Manutenibilidade**: Cada template é independente
- ✅ **Reutilização**: Seções podem ser compartilhadas
- ✅ **Validação**: Sistema robusto de verificações
- ✅ **Flexibilidade**: Configurações granulares
- ✅ **Escalabilidade**: Suporta crescimento do sistema

Este guia fornece a base para criar e manter templates de forma eficiente e escalável. 
 