# 🛡️ Migração de Segurança - Guia Completo

## ⚠️ ATENÇÃO: EXECUTAR COM URGÊNCIA

Este guia implementa **Row Level Security (RLS)** para proteger dados sensíveis dos grupos.

## 🎯 Métodos de Execução

### Método 1: SQL Editor do Supabase (RECOMENDADO)

1. **Acesse o SQL Editor:**
   ```
   https://pdmnkyiuvyyuobfozlly.supabase.co/project/pdmnkyiuvyyuobfozlly/sql
   ```

2. **Execute em sequência:**
   - Primeiro: Cole e execute todo o conteúdo de `supabase-security-migration.sql`
   - Depois: Cole e execute todo o conteúdo de `supabase-security-related-tables.sql`

### Método 2: CLI do Supabase (ALTERNATIVA)

Se você tiver o CLI do Supabase instalado:

```bash
# 1. Navegue para a pasta do projeto
cd /g/Downloads/001

# 2. Execute as migrações
supabase db reset --db-url postgresql://postgres:[password]@db.pdmnkyiuvyyuobfozlly.supabase.co:5432/postgres
```

## 📋 Checklist de Execução

### ✅ Passo 1: Migração Principal
- [ ] Executar `supabase-security-migration.sql`
- [ ] Verificar se a coluna `user_id` foi adicionada
- [ ] Confirmar que RLS foi habilitado
- [ ] Checar se as políticas foram criadas

### ✅ Passo 2: Tabelas Relacionadas
- [ ] Executar `supabase-security-related-tables.sql`
- [ ] Verificar proteção das tabelas relacionadas
- [ ] Confirmar que todas as tabelas estão com RLS

### ✅ Passo 3: Verificação Final
- [ ] Todas as tabelas devem mostrar status "✅ PROTEGIDA"
- [ ] Cada tabela deve ter 4 políticas (SELECT, INSERT, UPDATE, DELETE)

## 🔍 Verificações de Segurança

Após executar as migrações, execute estas verificações:

```sql
-- Verificar estrutura da tabela groups
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'groups' AND column_name = 'user_id';

-- Verificar se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('groups', 'group_members', 'group_message_files');

-- Contar políticas criadas
SELECT tablename, COUNT(*) as policies 
FROM pg_policies 
WHERE tablename IN ('groups', 'group_members', 'group_message_files')
GROUP BY tablename;
```

## 🚨 Problemas Conhecidos

### Se houver grupos sem proprietário:
```sql
-- Ver grupos órfãos
SELECT id, name, user_id FROM groups WHERE user_id IS NULL;

-- Associar ao primeiro usuário (CUIDADO!)
UPDATE groups 
SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE user_id IS NULL;
```

### Se RLS bloquear acesso:
1. Verifique se o usuário está autenticado
2. Confirme que `auth.uid()` retorna um valor
3. Verifique se os grupos têm `user_id` preenchido

## 📊 Resultado Esperado

### Tabelas Protegidas:
- ✅ `groups` - RLS ativo com 4 políticas
- ✅ `group_members` - RLS ativo com 4 políticas  
- ✅ `group_message_files` - RLS ativo com 4 políticas
- ✅ `daily_analytics` - RLS ativo com 4 políticas (se existir)
- ✅ `group_analytics` - RLS ativo com 4 políticas (se existir)

### Segurança Implementada:
- 🔒 Usuários só veem seus próprios grupos
- 🔒 Usuários só podem criar grupos para si
- 🔒 Usuários só podem editar seus grupos
- 🔒 Usuários só podem deletar seus grupos
- 🔒 Dados relacionados protegidos por associação

## 🆘 Suporte

Se encontrar problemas:

1. **Erro de permissão:** Execute como superuser no SQL Editor
2. **Tabela não existe:** Algumas tabelas podem não existir ainda
3. **Grupos órfãos:** Use o comando de associação com cuidado
4. **RLS muito restritivo:** Pode ser necessário ajustar as políticas

## ⏰ Tempo Estimado

- Execução: 2-3 minutos
- Verificação: 1-2 minutos
- **Total: ~5 minutos**

---

**🎯 PRIORIDADE MÁXIMA:** Execute esta migração ANTES de continuar o desenvolvimento! 
 