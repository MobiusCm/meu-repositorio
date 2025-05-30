-- ========================================================
-- SEGURANÇA PARA TABELAS RELACIONADAS AOS GRUPOS
-- ========================================================
-- EXECUTE APÓS supabase-security-migration.sql

-- ========================================================
-- PROTEGER TABELA group_members
-- ========================================================
-- Habilitar RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "users_can_view_own_group_members" ON group_members;
DROP POLICY IF EXISTS "users_can_insert_own_group_members" ON group_members;
DROP POLICY IF EXISTS "users_can_update_own_group_members" ON group_members;
DROP POLICY IF EXISTS "users_can_delete_own_group_members" ON group_members;

-- Criar políticas baseadas na propriedade do grupo
CREATE POLICY "users_can_view_own_group_members" ON group_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_members.group_id 
            AND groups.user_id = auth.uid()
        )
    );

CREATE POLICY "users_can_insert_own_group_members" ON group_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_members.group_id 
            AND groups.user_id = auth.uid()
        )
    );

CREATE POLICY "users_can_update_own_group_members" ON group_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_members.group_id 
            AND groups.user_id = auth.uid()
        )
    );

CREATE POLICY "users_can_delete_own_group_members" ON group_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_members.group_id 
            AND groups.user_id = auth.uid()
        )
    );

-- ========================================================
-- PROTEGER TABELA group_message_files
-- ========================================================
-- Habilitar RLS
ALTER TABLE group_message_files ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "users_can_view_own_group_files" ON group_message_files;
DROP POLICY IF EXISTS "users_can_insert_own_group_files" ON group_message_files;
DROP POLICY IF EXISTS "users_can_update_own_group_files" ON group_message_files;
DROP POLICY IF EXISTS "users_can_delete_own_group_files" ON group_message_files;

-- Criar políticas baseadas na propriedade do grupo
CREATE POLICY "users_can_view_own_group_files" ON group_message_files
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_message_files.group_id 
            AND groups.user_id = auth.uid()
        )
    );

CREATE POLICY "users_can_insert_own_group_files" ON group_message_files
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_message_files.group_id 
            AND groups.user_id = auth.uid()
        )
    );

CREATE POLICY "users_can_update_own_group_files" ON group_message_files
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_message_files.group_id 
            AND groups.user_id = auth.uid()
        )
    );

CREATE POLICY "users_can_delete_own_group_files" ON group_message_files
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_message_files.group_id 
            AND groups.user_id = auth.uid()
        )
    );

-- ========================================================
-- PROTEGER TABELA daily_analytics (se existir)
-- ========================================================
-- Verificar se a tabela existe antes de aplicar
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_analytics') THEN
        -- Habilitar RLS
        ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

        -- Remover políticas antigas
        DROP POLICY IF EXISTS "users_can_view_own_daily_analytics" ON daily_analytics;
        DROP POLICY IF EXISTS "users_can_insert_own_daily_analytics" ON daily_analytics;
        DROP POLICY IF EXISTS "users_can_update_own_daily_analytics" ON daily_analytics;
        DROP POLICY IF EXISTS "users_can_delete_own_daily_analytics" ON daily_analytics;

        -- Criar políticas baseadas na propriedade do grupo
        CREATE POLICY "users_can_view_own_daily_analytics" ON daily_analytics
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE groups.id = daily_analytics.group_id 
                    AND groups.user_id = auth.uid()
                )
            );

        CREATE POLICY "users_can_insert_own_daily_analytics" ON daily_analytics
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE groups.id = daily_analytics.group_id 
                    AND groups.user_id = auth.uid()
                )
            );

        CREATE POLICY "users_can_update_own_daily_analytics" ON daily_analytics
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE groups.id = daily_analytics.group_id 
                    AND groups.user_id = auth.uid()
                )
            );

        CREATE POLICY "users_can_delete_own_daily_analytics" ON daily_analytics
            FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE groups.id = daily_analytics.group_id 
                    AND groups.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- ========================================================
-- PROTEGER TABELA group_analytics (se existir)
-- ========================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_analytics') THEN
        -- Habilitar RLS
        ALTER TABLE group_analytics ENABLE ROW LEVEL SECURITY;

        -- Remover políticas antigas
        DROP POLICY IF EXISTS "users_can_view_own_group_analytics" ON group_analytics;
        DROP POLICY IF EXISTS "users_can_insert_own_group_analytics" ON group_analytics;
        DROP POLICY IF EXISTS "users_can_update_own_group_analytics" ON group_analytics;
        DROP POLICY IF EXISTS "users_can_delete_own_group_analytics" ON group_analytics;

        -- Criar políticas baseadas na propriedade do grupo
        CREATE POLICY "users_can_view_own_group_analytics" ON group_analytics
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE groups.id = group_analytics.group_id 
                    AND groups.user_id = auth.uid()
                )
            );

        CREATE POLICY "users_can_insert_own_group_analytics" ON group_analytics
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE groups.id = group_analytics.group_id 
                    AND groups.user_id = auth.uid()
                )
            );

        CREATE POLICY "users_can_update_own_group_analytics" ON group_analytics
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE groups.id = group_analytics.group_id 
                    AND groups.user_id = auth.uid()
                )
            );

        CREATE POLICY "users_can_delete_own_group_analytics" ON group_analytics
            FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM groups 
                    WHERE groups.id = group_analytics.group_id 
                    AND groups.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- ========================================================
-- VERIFICAÇÕES FINAIS
-- ========================================================
-- Listar todas as tabelas com RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE WHEN rowsecurity THEN '✅ PROTEGIDA' ELSE '❌ VULNERÁVEL' END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('groups', 'group_members', 'group_message_files', 'daily_analytics', 'group_analytics')
ORDER BY tablename;

-- Contar políticas por tabela
SELECT 
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('groups', 'group_members', 'group_message_files', 'daily_analytics', 'group_analytics')
GROUP BY tablename
ORDER BY tablename; 