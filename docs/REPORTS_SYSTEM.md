# Sistema de Relatórios Omnys

## Visão Geral

O sistema de relatórios da plataforma Omnys permite gerar análises detalhadas e profissionais dos grupos de WhatsApp em múltiplos formatos. O sistema oferece dois templates principais e três formatos de exportação diferentes.

## Funcionalidades

### Templates de Relatório

#### 1. Relatório Completo
- **Descrição**: Análise abrangente com todas as métricas disponíveis
- **Conteúdo**:
  - Estatísticas gerais (mensagens, palavras, mídias, membros ativos)
  - Gráficos de atividade diária e por horário
  - Ranking completo de membros
  - Insights automáticos baseados nos dados
  - Análise temporal detalhada
  - Métricas de engajamento

#### 2. Relatório de Membros
- **Descrição**: Foco específico nos membros e suas atividades
- **Conteúdo**:
  - Ranking detalhado dos membros mais ativos
  - Estatísticas individuais de cada membro
  - Padrões de participação
  - Análise de engajamento por membro
  - Classificação de nível de atividade (Alto/Médio/Baixo)

### Formatos de Exportação

#### 1. CSV - Dados Estruturados
- **Uso**: Análise em planilhas e ferramentas de dados
- **Conteúdo**: Dados brutos estruturados em formato tabular
- **Estrutura**:
  ```
  - Cabeçalho com informações do grupo
  - Estatísticas gerais
  - Atividade diária
  - Ranking de membros
  - Atividade por hora
  ```

#### 2. PDF - Documento Profissional
- **Uso**: Apresentações e relatórios executivos
- **Características**:
  - Layout profissional com gradientes e design moderno
  - Gráficos visuais integrados
  - Insights destacados
  - Tabelas formatadas
  - Branding da Omnys

#### 3. PNG - Imagem Elegante
- **Uso**: Compartilhamento em redes sociais e grupos
- **Características**:
  - Design Apple-style minimalista
  - Métricas visuais destacadas
  - Gráficos estilizados
  - Cores e gradientes elegantes
  - Ideal para WhatsApp, Instagram, etc.

## Fluxo de Criação

### Processo em 4 Etapas

1. **Seleção do Grupo**
   - Lista todos os grupos disponíveis
   - Funcionalidade de busca
   - Exibe informações básicas (nome, membros, ícone)
   - Validação automática de dados suficientes

2. **Escolha do Template**
   - Cartões visuais explicativos
   - Descrições detalhadas de cada template
   - Tags indicando o conteúdo incluído

3. **Seleção do Formato**
   - Explicação de cada formato
   - Indicação do uso ideal
   - Preview das características

4. **Geração**
   - Barra de progresso em tempo real
   - Mensagens de status detalhadas
   - Download automático ao finalizar

## Arquitetura Técnica

### Componentes Principais

#### `report-generator.ts`
- **Função**: Core do sistema de geração
- **Responsabilidades**:
  - Coleta e processamento de dados
  - Geração de insights automáticos
  - Formatação para diferentes outputs
  - Validação de grupos

#### `png-report-renderer.tsx`
- **Função**: Renderização de relatórios em imagem
- **Características**:
  - Layouts responsivos
  - Gradientes e efeitos visuais
  - Suporte a diferentes templates
  - Otimizado para compartilhamento

#### `pdf-report-renderer.tsx`
- **Função**: Renderização de relatórios em PDF
- **Características**:
  - Layout de página A4
  - Gráficos integrados
  - Tabelas profissionais
  - Headers e footers estilizados

### Estrutura de Dados

```typescript
interface ReportData {
  group: {
    id: string;
    name: string;
    description?: string;
    member_count?: number;
    icon_url?: string;
  };
  period: {
    start: Date;
    end: Date;
    days: number;
  };
  stats: DetailedStats;
  metadata: {
    generated_at: Date;
    template: 'complete' | 'members';
    format: 'csv' | 'pdf' | 'png';
  };
}
```

## Insights Automáticos

O sistema gera insights automáticos baseados nos dados analisados:

### Tipos de Insights

1. **Dominância nas Conversas**
   - Detecta quando um membro tem >30% das mensagens
   - Alerta sobre concentração excessiva

2. **Participação Geral**
   - Calcula percentual de membros ativos
   - Identifica grupos com baixa participação

3. **Nível de Atividade**
   - Classifica grupos como baixa/média/alta atividade
   - Baseado na média diária de mensagens

4. **Padrões Temporais**
   - Identifica horários de pico
   - Mostra distribuição de atividade

## Validações e Requisitos

### Validação de Grupos

Antes da geração, o sistema valida:

- ✅ Grupo existe no banco de dados
- ✅ Possui dados de análise disponíveis
- ✅ Mínimo de 3 dias de dados
- ✅ Pelo menos algumas mensagens analisadas

### Tratamento de Erros

- Mensagens claras para o usuário
- Fallbacks para dados incompletos
- Logs detalhados para debug
- Recuperação graceful de falhas

## Interface do Usuário

### Design Principles

1. **Apple-inspired**: Design clean e minimalista
2. **Progressive Disclosure**: Informações reveladas gradualmente
3. **Visual Hierarchy**: Importância clara dos elementos
4. **Feedback Imediato**: Status e progresso sempre visíveis

### Componentes de UI

- **Modal Workflow**: Processo guiado em etapas
- **Progress Indicators**: Barras de progresso animadas
- **Interactive Cards**: Seleção visual intuitiva
- **Status Badges**: Estados claros dos relatórios
- **History Timeline**: Histórico organizado e pesquisável

## Métricas e Analytics

### Dados Coletados

- Total de mensagens no período
- Total de palavras enviadas
- Arquivos de mídia compartilhados
- Membros ativos no período
- Média de palavras por mensagem
- Distribuição por horário
- Atividade diária

### Cálculos Realizados

- Ranking de membros por atividade
- Percentual de participação individual
- Médias e tendências temporais
- Nível de engajamento por membro
- Insights comportamentais

## Configuração e Deployment

### Dependências

```json
{
  "date-fns": "^2.29.3",
  "lucide-react": "^0.263.1",
  "recharts": "^2.8.0"
}
```

### Variáveis de Ambiente

```env
# Configuração do Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configurações do sistema
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Roadmap Futuro

### Funcionalidades Planejadas

- [ ] **Relatórios Agendados**: Automação semanal/mensal
- [ ] **Comparativos**: Análise entre múltiplos grupos
- [ ] **Trends**: Análise de tendências temporais
- [ ] **Export API**: API para integração externa
- [ ] **White Label**: Customização de branding
- [ ] **Templates Customizados**: Criação de templates próprios

### Melhorias Técnicas

- [ ] **Cache Inteligente**: Cache de dados para relatórios
- [ ] **Background Jobs**: Processamento assíncrono
- [ ] **CDN Integration**: Armazenamento otimizado
- [ ] **Real-time Updates**: Status em tempo real
- [ ] **Batch Processing**: Múltiplos relatórios simultâneos

## Troubleshooting

### Problemas Comuns

1. **"Grupo sem dados suficientes"**
   - Solução: Fazer upload do histórico de mensagens primeiro
   - Verificar se há pelo menos 3 dias de dados

2. **"Erro na geração de PDF"**
   - Solução: Verificar se todos os dados estão disponíveis
   - Tentar novamente ou usar formato CSV

3. **"Arquivo não baixa"**
   - Solução: Verificar bloqueadores de popup
   - Tentar em navegador diferente

### Logs e Debug

```javascript
// Habilitar logs detalhados
localStorage.setItem('omnys_debug_reports', 'true');

// Verificar dados do grupo
console.log('Group validation:', await validateGroupForReport(groupId));
```

## Contribuição

Para contribuir com melhorias no sistema de relatórios:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente seguindo os padrões estabelecidos
4. Teste com dados reais
5. Submeta um Pull Request

### Padrões de Código

- TypeScript strict mode
- Componentes funcionais com hooks
- Error boundaries implementados
- Testes unitários obrigatórios
- Documentação inline 