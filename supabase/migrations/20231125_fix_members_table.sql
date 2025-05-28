-- Adicionando uma coluna para armazenar o nome original com caracteres especiais
ALTER TABLE "public"."group_members" 
ADD COLUMN IF NOT EXISTS "original_name" text;

-- Modificando a tabela group_members para usar um ID personalizado
ALTER TABLE "public"."group_members"
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" TYPE text;

-- Adicionar índice para melhorar a performance de buscas por group_id
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON "public"."group_members" (group_id);

-- Modificando a tabela de análise diária de membros para usar um ID personalizado
ALTER TABLE "public"."member_daily_analytics" 
ADD COLUMN IF NOT EXISTS "id" text PRIMARY KEY;

-- Adicionando colunas para métricas adicionais se ainda não existirem
ALTER TABLE "public"."member_daily_analytics" 
ADD COLUMN IF NOT EXISTS "emoji_count" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "links_count" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "replies_count" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "mentions_count" integer DEFAULT 0;

-- Adicionar índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_member_daily_group_date ON "public"."member_daily_analytics" (group_id, date);
CREATE INDEX IF NOT EXISTS idx_member_daily_member ON "public"."member_daily_analytics" (member_id);

-- Adicionar índices na tabela de análise diária
CREATE INDEX IF NOT EXISTS idx_daily_analytics_group_date ON "public"."daily_analytics" (group_id, date);

-- Criar políticas RLS para permitir acesso adequado aos dados
ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON "public"."group_members"
  USING (auth.role() = 'authenticated');

ALTER TABLE "public"."member_daily_analytics" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON "public"."member_daily_analytics"
  USING (auth.role() = 'authenticated');

-- Criar funções para limpar nomes e gerar IDs consistentes
CREATE OR REPLACE FUNCTION "public"."clean_member_name"(member_name text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(trim(member_name), '[^\w\s]', '', 'g');
$$;

CREATE OR REPLACE FUNCTION "public"."generate_member_id"(group_id text, member_name text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT group_id || '-' || regexp_replace(lower(trim(clean_member_name(member_name))), '\s+', '_', 'g');
$$; 