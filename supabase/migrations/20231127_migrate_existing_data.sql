-- Script para migrar dados existentes para o novo formato

-- 1. Backup de membros existentes em uma tabela temporária
CREATE TEMP TABLE temp_group_members AS 
SELECT * FROM public.group_members;

-- 2. Para cada membro existente, gerar um ID consistente e atualizar a tabela
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM temp_group_members
  LOOP
    -- Limpar o nome para evitar caracteres especiais
    DECLARE 
      clean_name text := regexp_replace(trim(r.name), '[^\w\s]', '', 'g');
      member_id text := r.group_id || '-' || regexp_replace(lower(trim(clean_name)), '\s+', '_', 'g');
    BEGIN
      -- Atualizar o membro existente com o novo ID e manter o nome original
      UPDATE public.group_members
      SET 
        id = member_id,
        name = CASE WHEN length(clean_name) > 0 THEN clean_name ELSE 'Usuário Anônimo' END,
        original_name = r.name
      WHERE id = r.id;
    END;
  END LOOP;
END $$;

-- 3. Limpar tabela temporária
DROP TABLE temp_group_members;

-- 4. Backup de estatísticas diárias de membros existentes
CREATE TEMP TABLE temp_member_daily AS 
SELECT * FROM public.member_daily_analytics WHERE id IS NULL;

-- 5. Para cada estatística diária, gerar um ID único e atualizar
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM temp_member_daily
  LOOP
    -- Gerar um ID único para o registro: memberId-YYYY-MM-DD
    DECLARE 
      daily_id text := r.member_id || '-' || to_char(r.date, 'YYYY-MM-DD');
    BEGIN
      -- Atualizar o registro com o novo ID
      UPDATE public.member_daily_analytics
      SET id = daily_id
      WHERE member_id = r.member_id AND date = r.date AND id IS NULL;
    END;
  END LOOP;
END $$;

-- 6. Limpar tabela temporária
DROP TABLE temp_member_daily;

-- 7. Criar trigger para atualizar campo updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger em todas as tabelas relevantes
DROP TRIGGER IF EXISTS update_groups_timestamp ON public.groups;
CREATE TRIGGER update_groups_timestamp
BEFORE UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_group_members_timestamp ON public.group_members;
CREATE TRIGGER update_group_members_timestamp
BEFORE UPDATE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_daily_analytics_timestamp ON public.daily_analytics;
CREATE TRIGGER update_daily_analytics_timestamp
BEFORE UPDATE ON public.daily_analytics
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_member_daily_analytics_timestamp ON public.member_daily_analytics;
CREATE TRIGGER update_member_daily_analytics_timestamp
BEFORE UPDATE ON public.member_daily_analytics
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_period_group_analytics_timestamp ON public.period_group_analytics;
CREATE TRIGGER update_period_group_analytics_timestamp
BEFORE UPDATE ON public.period_group_analytics
FOR EACH ROW EXECUTE FUNCTION update_timestamp(); 