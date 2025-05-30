# Arquitetura do Banco de Dados - Sistema de Adicionar Grupos/Comunidades

## Visão Geral

O sistema de adicionar grupos (futuramente renomeado para "comunidades") é construído sobre uma arquitetura robusta no Supabase que suporta múltiplas plataformas de mensageria (WhatsApp, Discord, Telegram, Instagram).

## Estrutura das Tabelas

### 1. Tabela Principal: `groups`

Esta é a tabela central que armazena informações básicas sobre cada comunidade:

```sql
-- Estrutura da tabela groups
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,                    -- Nome da comunidade
    icon_url TEXT,                         -- URL da foto/ícone da comunidade
    description TEXT,                      -- Descrição opcional
    created_at TIMESTAMPTZ DEFAULT NOW(), -- Data de criação
    last_updated_at TIMESTAMPTZ DEFAULT NOW(), -- Última atualização
    member_count INTEGER,                  -- Número total de membros
    user_id UUID,                         -- ID do usuário proprietário (FK para auth.users)
    created_by UUID,                      -- ID do criador (FK para auth.users)
    updated_at DATE,                      -- Data da última atualização
    platform VARCHAR DEFAULT 'whatsapp'  -- Plataforma: whatsapp, discord, telegram, instagram
);
```

**Campos importantes:**
- `user_id`: Fundamental para RLS (Row Level Security) - garante que cada usuário vê apenas suas comunidades
- `platform`: Campo que define a plataforma da comunidade (padrão: whatsapp)
- `icon_url`: Armazena o link público do ícone após upload no Supabase Storage

### 2. Tabelas Relacionadas

#### `group_message_files`
Armazena referências aos arquivos de mensagens carregados:
```sql
CREATE TABLE group_message_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id),
    storage_path TEXT NOT NULL,           -- Caminho no Supabase Storage
    file_date DATE NOT NULL,              -- Data das mensagens do arquivo
    file_size INTEGER,                    -- Tamanho do arquivo em bytes
    message_count INTEGER DEFAULT 0,     -- Número de mensagens no arquivo
    bucket_id TEXT NOT NULL,             -- ID do bucket no Storage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `daily_analytics`
Estatísticas processadas por dia:
```sql
CREATE TABLE daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id),
    date DATE,                           -- Data da análise (NULL para resumos)
    total_messages INTEGER DEFAULT 0,   -- Total de mensagens do dia
    active_members INTEGER DEFAULT 0,   -- Membros ativos no dia
    total_words INTEGER DEFAULT 0,      -- Total de palavras
    total_media INTEGER DEFAULT 0,      -- Total de mídias
    hourly_activity JSONB DEFAULT '{}', -- Atividade por hora
    members_stats JSONB,                 -- Estatísticas detalhadas dos membros
    period_summary BOOLEAN DEFAULT false, -- Se é resumo de período
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `group_analytics`
Estatísticas globais consolidadas:
```sql
CREATE TABLE group_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID UNIQUE NOT NULL REFERENCES groups(id),
    total_messages INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    total_media INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    avg_words_per_message FLOAT DEFAULT 0,
    first_message_date DATE,
    last_message_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Processo de Adicionar Grupo - Fluxo Detalhado

### Etapa 1: Seleção de Plataforma
- **Interface**: Modal com botões para cada plataforma
- **Estado**: Apenas WhatsApp está ativo, outros em "Em Breve"
- **Dados**: Plataforma selecionada é armazenada em estado local

### Etapa 2: Informações Básicas
**Função**: `onSubmitStep1` no `add-group-modal.tsx`

#### Processo de Criação:
1. **Validação de Autenticação**:
   ```typescript
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   ```

2. **Inserção na Tabela Groups**:
   ```typescript
   const { data, error } = await supabase
     .from('groups')
     .insert([{
       name: values.name,
       description: values.description || null,
       member_count: values.memberCount || null,
       user_id: user.id,        // SEGURANÇA: Associa ao usuário
       platform: selectedPlatform // Plataforma selecionada
     }])
     .select()
     .single();
   ```

3. **Upload de Ícone (se fornecido)**:
   ```typescript
   // Gera nome único do arquivo
   const fileName = `${data.id}-${Date.now()}.${fileExt}`;
   const filePath = `groups/${fileName}`;
   
   // Upload para Storage
   const { error: uploadError } = await supabase
     .storage
     .from('group-icons')
     .upload(filePath, values.icon, {
       cacheControl: '3600',
       upsert: false,
     });
   
   // Atualiza grupo com URL pública
   const { data: urlData } = supabase
     .storage
     .from('group-icons')
     .getPublicUrl(filePath);
   
   await supabase
     .from('groups')
     .update({ icon_url: urlData.publicUrl })
     .eq('id', data.id);
   ```

### Etapa 3: Upload de Mensagens
**Função**: `processWhatsAppChat` no `add-group-modal.tsx`

#### Processo de Análise:
1. **Leitura do Arquivo**:
   ```typescript
   const content = await file.text();
   ```

2. **Parsing de Mensagens**:
   - Regex para extrair mensagens: `/\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\]/`
   - Agrupamento por data
   - Análise de conteúdo (texto, mídia, emojis, etc.)

3. **Upload de Arquivos Processados**:
   ```typescript
   // Para cada dia de mensagens
   const filePath = `${userId}/${groupId}/messages/${formattedDate}.txt`;
   
   // Tenta bucket principal, depois backup
   await supabase
     .storage
     .from('whatsapp_messages')
     .upload(filePath, blob, {
       cacheControl: '3600',
       upsert: true,
     });
   
   // Registra na tabela
   await supabase
     .from('group_message_files')
     .upsert({
       group_id: groupId,
       storage_path: filePath,
       file_date: sqlFormattedDate,
       file_size: fileSize,
       message_count: msgs.length,
       bucket_id: bucketId
     });
   ```

4. **Análise e Processamento**:
   ```typescript
   // Executa análise usando lib/analysis.ts
   await analyzeWhatsAppChat(groupId, startDate, endDate);
   ```

## Segurança e RLS (Row Level Security)

### Políticas de Segurança:
1. **groups**: Usuários só veem grupos que criaram
2. **group_message_files**: Acesso baseado no proprietário do grupo
3. **daily_analytics**: Acesso baseado no proprietário do grupo
4. **group_analytics**: Acesso baseado no proprietário do grupo

### Verificações de Segurança no Código:
```typescript
// Sempre verificar user_id na criação
user_id: user.id

// Sempre verificar propriedade na exclusão
.eq('user_id', user.id)

// Verificar autenticação antes de operações
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  throw new Error('Usuário não autenticado');
}
```

## Storage (Arquivos)

### Buckets Utilizados:
1. **group-icons**: Ícones das comunidades
2. **whatsapp_messages**: Arquivos de mensagens processados (bucket principal)
3. **whatsapp-messages**: Bucket de backup

### Organização de Arquivos:
```
group-icons/
  groups/
    {groupId}-{timestamp}.{ext}

whatsapp_messages/
  {userId}/
    {groupId}/
      messages/
        {YYYY-MM-DD}.txt
```

## Análise de Dados

### Fluxo de Processamento:
1. **Upload** → `group_message_files`
2. **Análise** → `daily_analytics` (por dia)
3. **Consolidação** → `group_analytics` (totais)

### Funções de Análise:
- `analyzeWhatsAppChat()`: Análise completa de período
- `analyzeWhatsAppChatFile()`: Análise de arquivo único
- `fetchPreProcessedStats()`: Busca dados pré-processados

## Considerações de Performance

1. **Indexação**: Índices em `group_id`, `user_id`, `date`
2. **Paginação**: Limite de registros em consultas
3. **Cache**: URLs públicas com cache de 1 hora
4. **Batch Operations**: Upload em lotes para evitar timeouts

## Campos Obrigatórios vs Opcionais

### Obrigatórios:
- `name`: Nome da comunidade
- `user_id`: Proprietário (preenchido automaticamente)
- `platform`: Plataforma (padrão: whatsapp)

### Opcionais:
- `description`: Descrição
- `member_count`: Número de membros
- `icon_url`: Ícone (preenchido após upload)

## Tratamento de Erros

1. **Validação de Entrada**: Zod schema
2. **Autenticação**: Verificação obrigatória
3. **Upload**: Fallback entre buckets
4. **Análise**: Continua mesmo com falhas parciais
5. **UI**: Toast notifications para feedback

Este sistema garante integridade, segurança e escalabilidade para suportar múltiplas plataformas de mensageria mantendo um código limpo e organizados. 