# Templates System - Quick Start para Desenvolvedores

## 🚀 Quick Start

### Criando seu Primeiro Template

```bash
# 1. Crie o arquivo do template
touch lib/reports/templates/meu-template.ts

# 2. Use este template básico:
```

```typescript
import { TemplateConfig, ReportSection } from '../types';

const MEU_TEMPLATE_SECTIONS: ReportSection[] = [
  {
    id: 'overview',
    name: 'Visão Geral',
    description: 'Resumo das principais métricas',
    category: 'overview',
    available: true,
    required: true,
    estimatedSize: 'small'
  }
];

export const meuTemplate: TemplateConfig = {
  id: 'meu-template',
  name: 'Meu Template',
  description: 'Template personalizado para análises específicas',
  icon: 'FileText',
  previewSupported: true,
  estimatedTime: '1-2 minutos',
  complexity: 'basic',
  requiredData: ['daily_stats'],
  formats: ['pdf'],
  sections: MEU_TEMPLATE_SECTIONS,
  defaultOptions: {
    includeGeneralStats: true,
    // ... outras opções
  }
};
```

### Registrando o Template

```typescript
// lib/reports/templates/index.ts
import { meuTemplate } from './meu-template';

export const TEMPLATE_REGISTRY: Record<ReportTemplate, TemplateConfig> = {
  // ... templates existentes
  'meu-template': meuTemplate,
};
```

### Atualizando os Tipos

```typescript
// lib/reports/types.ts
export type ReportTemplate = 
  | 'complete'
  | 'members'
  | 'executive'
  | 'meu-template' // 👈 Adicione aqui
  | 'analytics'
  // ... outros
```

## 📝 Exemplos Práticos

### Template Simples (Básico)

```typescript
// lib/reports/templates/summary-template.ts
export const summaryTemplate: TemplateConfig = {
  id: 'summary',
  name: 'Resumo Executivo',
  description: 'Relatório condensado para gestores',
  icon: 'FileText',
  complexity: 'basic',
  estimatedTime: '30 segundos',
  formats: ['pdf'],
  sections: [
    {
      id: 'keyMetrics',
      name: 'Métricas-Chave',
      category: 'overview',
      available: true,
      required: true,
      estimatedSize: 'small'
    }
  ],
  defaultOptions: {
    includeGeneralStats: true,
    colorTheme: 'blue',
    reportStyle: 'executive'
  }
};
```

### Template Intermediário

```typescript
// lib/reports/templates/engagement-template.ts
export const engagementTemplate: TemplateConfig = {
  id: 'engagement',
  name: 'Análise de Engajamento',
  description: 'Foco na participação e interação dos membros',
  icon: 'Users',
  complexity: 'intermediate',
  estimatedTime: '2-3 minutos',
  formats: ['pdf', 'csv'],
  sections: [
    {
      id: 'participationOverview',
      name: 'Visão Geral da Participação',
      category: 'overview',
      available: true,
      required: true,
      estimatedSize: 'medium'
    },
    {
      id: 'memberEngagement',
      name: 'Engajamento por Membro',
      category: 'members',
      available: true,
      estimatedSize: 'large'
    }
  ],
  defaultOptions: {
    includeGeneralStats: true,
    includeMemberRanking: true,
    includeEngagementAnalysis: true,
    maxMembersInRanking: 25,
    colorTheme: 'green'
  }
};
```

### Template Avançado

```typescript
// lib/reports/templates/advanced-analytics.ts
export const advancedAnalyticsTemplate: TemplateConfig = {
  id: 'advanced-analytics',
  name: 'Analytics Avançado',
  description: 'Análise completa com IA e previsões',
  icon: 'Brain',
  complexity: 'advanced',
  estimatedTime: '5-7 minutos',
  formats: ['pdf', 'csv'],
  requiredData: ['daily_stats', 'member_stats', 'hourly_activity'],
  sections: [
    // Múltiplas seções complexas
    {
      id: 'aiInsights',
      name: 'Insights de IA',
      category: 'insights',
      available: true,
      premium: true,
      estimatedSize: 'large'
    }
  ],
  defaultOptions: {
    // Muitas opções configuradas
    includeAnomalyDetection: true,
    includeGrowthProjections: true,
    includePredictions: true,
    insightDepth: 'advanced'
  }
};
```

## 🛠️ Utilitários Essenciais

### Validação Rápida

```typescript
// Teste seu template
import { validateTemplateConfig } from '@/lib/reports/templates';

const isValid = validateTemplateConfig(meuTemplate);
if (!isValid) {
  console.error('Template inválido!');
}
```

### Debug Helper

```typescript
// Debug completo do template
function debugTemplate(templateId: ReportTemplate) {
  const template = getTemplateById(templateId);
  
  console.log('📋 Template:', template.name);
  console.log('⚙️ Complexidade:', template.complexity);
  console.log('📊 Seções:', template.sections.length);
  console.log('📄 Formatos:', template.formats.join(', '));
  console.log('✅ Válido:', validateTemplateConfig(template));
  
  // Verificar cada formato
  template.formats.forEach(format => {
    console.log(`  ${format}: ${templateSupportsFormat(templateId, format)}`);
  });
}

// Uso
debugTemplate('meu-template');
```

### Template Builder Helper

```typescript
// Helper para criar templates rapidamente
function createQuickTemplate(config: {
  id: string;
  name: string;
  description: string;
  sections: string[]; // IDs das seções
  formats: string[];
  complexity?: 'basic' | 'intermediate' | 'advanced';
}): TemplateConfig {
  
  const sections = config.sections.map(sectionId => {
    const section = getSectionById(sectionId);
    if (!section) throw new Error(`Seção ${sectionId} não encontrada`);
    return section;
  });
  
  return {
    id: config.id as ReportTemplate,
    name: config.name,
    description: config.description,
    icon: 'FileText',
    previewSupported: true,
    estimatedTime: sections.length > 5 ? '3-5 min' : '1-2 min',
    complexity: config.complexity || 'intermediate',
    requiredData: ['daily_stats'],
    formats: config.formats as any[],
    sections,
    defaultOptions: {
      includeGeneralStats: true,
      colorTheme: 'blue',
      reportStyle: 'standard'
    }
  };
}

// Uso
const quickTemplate = createQuickTemplate({
  id: 'quick-test',
  name: 'Teste Rápido',
  description: 'Template criado rapidamente',
  sections: ['generalStats', 'memberRanking'],
  formats: ['pdf'],
  complexity: 'basic'
});
```

## 📊 Seções Pré-definidas

### Seções Mais Usadas

```typescript
// Overview
'generalStats'      // ⭐ Sempre incluir
'executiveSummary'  // 📋 Para relatórios executivos

// Atividade
'dailyActivity'     // 📈 Gráfico de atividade diária
'hourlyActivity'    // 🕐 Distribuição por horas
'activityPeaks'     // ⚡ Momentos de pico

// Membros
'memberRanking'     // 🏆 Top membros mais ativos
'memberEvolution'   // 📊 Evolução individual
'influencerAnalysis' // 🌟 Análise de influenciadores

// Insights
'keyInsights'       // 💡 Descobertas principais
'trendAnalysis'     // 📈 Análise de tendências
'anomalyDetection'  // 🚨 Detecção de anomalias
```

### Combinações Recomendadas

```typescript
// Template Básico
const basicSections = [
  'generalStats',
  'memberRanking',
  'keyInsights'
];

// Template Gerencial
const managerSections = [
  'executiveSummary',
  'trendAnalysis',
  'memberRanking',
  'anomalyDetection'
];

// Template Completo
const completeSections = [
  'generalStats',
  'dailyActivity',
  'hourlyActivity',
  'memberRanking',
  'memberEvolution',
  'trendAnalysis',
  'keyInsights'
];
```

## 🎨 Configurações de Estilo

### Temas de Cores

```typescript
colorTheme: 'blue'    // 🔵 Profissional, padrão
colorTheme: 'green'   // 🟢 Positivo, crescimento
colorTheme: 'purple'  // 🟣 Premium, executivo
colorTheme: 'red'     // 🔴 Alertas, urgência
```

### Estilos de Relatório

```typescript
reportStyle: 'standard'  // 📄 Padrão, equilibrado
reportStyle: 'detailed' // 📋 Detalhado, completo
reportStyle: 'executive' // 🎯 Executivo, condensado
```

### Estilos de Gráfico

```typescript
chartStyle: 'modern'   // 🎨 Moderno, gradientes
chartStyle: 'minimal'  // ⚪ Minimalista, limpo
chartStyle: 'classic'  // 📊 Clássico, tradicional
```

## 🔧 Configurações Avançadas

### Opções de Personalização

```typescript
// Configuração completa de exemplo
defaultOptions: {
  // === SEÇÕES ===
  includeGeneralStats: true,
  includeDailyActivity: true,
  includeMemberRanking: true,
  includeInsights: true,
  
  // === VISUAL ===
  colorTheme: 'blue',
  reportStyle: 'detailed',
  chartStyle: 'modern',
  
  // === DADOS ===
  maxMembersInRanking: 20,
  insightDepth: 'advanced',
  
  // === RECURSOS ===
  includeRecommendations: true,
  includeActionItems: true,
  watermark: true,
  logoInclude: true,
  
  // === GRÁFICOS ===
  showGridLines: true,
  showDataLabels: true,
  useGradients: true,
  animatedCharts: false
}
```

## 🚨 Troubleshooting Common Issues

### Template não aparece na UI

```typescript
// ❌ Problema comum
export const TEMPLATE_REGISTRY = {
  // Esqueceu de adicionar o template aqui
};

// ✅ Solução
export const TEMPLATE_REGISTRY: Record<ReportTemplate, TemplateConfig> = {
  complete: completeTemplate,
  'meu-template': meuTemplate, // 👈 Adicionar aqui
};
```

### Erro de tipo TypeScript

```typescript
// ❌ Tipo não atualizado
export type ReportTemplate = 'complete' | 'members';

// ✅ Tipo atualizado
export type ReportTemplate = 
  | 'complete' 
  | 'members'
  | 'meu-template'; // 👈 Adicionar aqui
```

### Seção não disponível

```typescript
// ❌ Seção marcada como indisponível
{
  id: 'minhaSecao',
  available: false, // 👈 Problema
}

// ✅ Seção disponível
{
  id: 'minhaSecao',
  available: true, // 👈 Solução
}
```

## 📱 Testando Templates

### Teste Simples

```typescript
// Teste básico de template
function testTemplate(templateId: ReportTemplate) {
  const template = getTemplateById(templateId);
  
  console.log('🧪 Testando template:', template.name);
  
  // Validação
  const isValid = validateTemplateConfig(template);
  console.log('✅ Válido:', isValid);
  
  // Seções
  console.log('📊 Seções:', template.sections.length);
  
  // Formatos
  template.formats.forEach(format => {
    console.log(`📄 ${format}: ✅`);
  });
  
  return isValid;
}
```

### Teste com Dados Mock

```typescript
// Simular geração de relatório
async function testReportGeneration(templateId: ReportTemplate) {
  const mockStats = {
    daily_stats: [],
    member_stats: [],
    total_messages: 100,
    // ... outros dados mock
  };
  
  const template = getTemplateById(templateId);
  
  try {
    // Simular geração (sem dados reais)
    console.log('🔄 Simulando geração...');
    
    const options = template.defaultOptions;
    console.log('⚙️ Opções:', Object.keys(options).length);
    
    console.log('✅ Template funcionaria corretamente');
    return true;
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
    return false;
  }
}
```

## 📚 Recursos Extras

### Links Úteis

- 📖 [Guia Completo](./templates-guide.md)
- 🎨 [Ícones Lucide](https://lucide.dev/icons/)
- 📊 [Tipos de Dados](../lib/reports/types.ts)

### Comandos Úteis

```bash
# Verificar sintaxe TypeScript
npx tsc --noEmit

# Executar testes (se houver)
npm test

# Build do projeto
npm run build
```

### Checklist de Novo Template

- [ ] Arquivo criado em `lib/reports/templates/`
- [ ] Template exportado corretamente
- [ ] Registrado no `TEMPLATE_REGISTRY`
- [ ] Tipo adicionado em `ReportTemplate`
- [ ] Seções definidas e disponíveis
- [ ] Formatos configurados
- [ ] Validação passando
- [ ] Testado na interface

---

## 💡 Dicas Finais

1. **Comece simples** - Crie templates básicos primeiro
2. **Reutilize seções** - Use seções existentes sempre que possível
3. **Teste constantemente** - Valide cada mudança
4. **Documente** - Adicione descrições claras
5. **Seja consistente** - Siga os padrões estabelecidos

**Happy coding! 🚀** 
 