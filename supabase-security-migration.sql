-- ========================================================
-- MIGRAÇÃO DE SEGURANÇA CRÍTICA PARA TABELA GROUPS
-- ========================================================
-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SUPABASE
-- URL: https://pdmnkyiuvyyuobfozlly.supabase.co/project/pdmnkyiuvyyuobfozlly/sql

-- ========================================================
-- PASSO 1: ADICIONAR COLUNA user_id (OBRIGATÓRIO)
-- ========================================================
-- Adiciona coluna user_id se não existir
ALTER TABLE groups ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ========================================================
-- PASSO 2: HABILITAR ROW LEVEL SECURITY (CRÍTICO)
-- ========================================================
-- Habilita RLS para segurança total
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- PASSO 3: REMOVER POLÍTICAS ANTIGAS (LIMPEZA)
-- ========================================================
-- Remove políticas existentes para recriar
DROP POLICY IF EXISTS "users_can_view_own_groups" ON groups;
DROP POLICY IF EXISTS "users_can_insert_own_groups" ON groups;
DROP POLICY IF EXISTS "users_can_update_own_groups" ON groups;
DROP POLICY IF EXISTS "users_can_delete_own_groups" ON groups;

-- ========================================================
-- PASSO 4: CRIAR POLÍTICAS DE SEGURANÇA (ESSENCIAL)
-- ========================================================

-- Usuários podem VER apenas seus próprios grupos
CREATE POLICY "users_can_view_own_groups" ON groups
    FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem CRIAR apenas grupos para si mesmos
CREATE POLICY "users_can_insert_own_groups" ON groups
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem ATUALIZAR apenas seus próprios grupos
CREATE POLICY "users_can_update_own_groups" ON groups
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem DELETAR apenas seus próprios grupos
CREATE POLICY "users_can_delete_own_groups" ON groups
    FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================================
-- PASSO 5: VERIFICAR SE HÁ GRUPOS SEM PROPRIETÁRIO
-- ========================================================
-- Mostra grupos que não têm user_id definido
SELECT 
    id, 
    name, 
    user_id,
    created_at
FROM groups 
WHERE user_id IS NULL;

-- ========================================================
-- PASSO 6: ASSOCIAR GRUPOS ÓRFÃOS (SE NECESSÁRIO)
-- ========================================================
-- DESCOMENTE E EXECUTE APENAS SE HOUVER GRUPOS SEM user_id
-- ATENÇÃO: Isso associará TODOS os grupos órfãos ao primeiro usuário!
-- 
-- UPDATE groups 
-- SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
-- WHERE user_id IS NULL;

-- ========================================================
-- PASSO 7: VERIFICAÇÕES FINAIS (CONFIRMAÇÃO)
-- ========================================================

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'groups' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'groups';

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'groups';

-- ========================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- ========================================================
-- 1. Acesse: https://pdmnkyiuvyyuobfozlly.supabase.co/project/pdmnkyiuvyyuobfozlly/sql
-- 2. Cole este script completo
-- 3. Execute pressionando "Run"
-- 4. Verifique os resultados das consultas de verificação
-- 5. Se houver grupos órfãos, descomente o UPDATE do PASSO 6
-- ======================================================== 