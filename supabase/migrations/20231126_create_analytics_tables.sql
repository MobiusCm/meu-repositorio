-- Tabela de estatísticas diárias
CREATE TABLE IF NOT EXISTS "public"."daily_analytics" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "group_id" text REFERENCES "public"."groups"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "total_messages" integer NOT NULL DEFAULT 0,
  "active_members" integer NOT NULL DEFAULT 0,
  "total_words" integer NOT NULL DEFAULT 0,
  "total_media" integer NOT NULL DEFAULT 0,
  "media_count" integer NOT NULL DEFAULT 0,
  "emoji_count" integer NOT NULL DEFAULT 0,
  "links_count" integer NOT NULL DEFAULT 0,
  "avg_message_length" numeric(10,2) NOT NULL DEFAULT 0,
  "most_active_hour" text,
  "peak_activity_count" integer NOT NULL DEFAULT 0,
  "hourly_activity" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE("group_id", "date")
);

-- Tabela de estatísticas diárias por membro
CREATE TABLE IF NOT EXISTS "public"."member_daily_analytics" (
  "id" text PRIMARY KEY, -- Usará o formato groupId-memberId-YYYY-MM-DD
  "group_id" text REFERENCES "public"."groups"("id") ON DELETE CASCADE,
  "member_id" text REFERENCES "public"."group_members"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "message_count" integer NOT NULL DEFAULT 0,
  "word_count" integer NOT NULL DEFAULT 0,
  "media_count" integer NOT NULL DEFAULT 0,
  "emoji_count" integer NOT NULL DEFAULT 0,
  "links_count" integer NOT NULL DEFAULT 0,
  "replies_count" integer NOT NULL DEFAULT 0,
  "mentions_count" integer NOT NULL DEFAULT 0,
  "avg_message_length" numeric(10,2) NOT NULL DEFAULT 0,
  "avg_words_per_message" numeric(10,2) NOT NULL DEFAULT 0,
  "first_message_time" time,
  "last_message_time" time,
  "hourly_activity" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Tabela de resumos de período para grupos
CREATE TABLE IF NOT EXISTS "public"."period_group_analytics" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "group_id" text REFERENCES "public"."groups"("id") ON DELETE CASCADE,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "total_messages" integer NOT NULL DEFAULT 0,
  "total_words" integer NOT NULL DEFAULT 0,
  "total_media" integer NOT NULL DEFAULT 0,
  "active_members" integer NOT NULL DEFAULT 0,
  "avg_messages_per_day" numeric(10,2) NOT NULL DEFAULT 0,
  "avg_words_per_message" numeric(10,2) NOT NULL DEFAULT 0,
  "most_active_day" date,
  "peak_day_messages" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE("group_id", "start_date", "end_date")
);

-- Configurar RLS
ALTER TABLE "public"."daily_analytics" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON "public"."daily_analytics"
  USING (auth.role() = 'authenticated');

ALTER TABLE "public"."member_daily_analytics" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON "public"."member_daily_analytics"
  USING (auth.role() = 'authenticated');

ALTER TABLE "public"."period_group_analytics" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON "public"."period_group_analytics"
  USING (auth.role() = 'authenticated');

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON "public"."daily_analytics" ("date");
CREATE INDEX IF NOT EXISTS idx_member_daily_date ON "public"."member_daily_analytics" ("date");
CREATE INDEX IF NOT EXISTS idx_period_group_dates ON "public"."period_group_analytics" ("start_date", "end_date"); 