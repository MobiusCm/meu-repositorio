-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de grupos
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  icon_url TEXT,
  description TEXT,
  member_count INT,
  last_updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de status de mensagens
CREATE TABLE IF NOT EXISTS messages_status (
  group_id UUID PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
  last_processed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_timestamp TEXT
);

-- Tabela de membros do grupo
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estatísticas diárias
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INT NOT NULL DEFAULT 0,
  active_members INT NOT NULL DEFAULT 0,
  UNIQUE (group_id, date)
);

-- Tabela de estatísticas diárias por membro
CREATE TABLE IF NOT EXISTS member_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INT NOT NULL DEFAULT 0,
  UNIQUE (group_id, member_id, date)
);

-- Índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_group_id ON daily_stats(group_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_member_daily_stats_group_id ON member_daily_stats(group_id);
CREATE INDEX IF NOT EXISTS idx_member_daily_stats_member_id ON member_daily_stats(member_id);
CREATE INDEX IF NOT EXISTS idx_member_daily_stats_date ON member_daily_stats(date);

-- Permissões de armazenamento (buckets)
-- Estas instruções devem ser adaptadas conforme a estrutura do Supabase
INSERT INTO storage.buckets (id, name) VALUES ('group-icons', 'Ícones de Grupos do WhatsApp')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name) VALUES ('whatsapp-messages', 'Mensagens do WhatsApp')
ON CONFLICT (id) DO NOTHING;

-- Adicionar políticas RLS para os buckets (exemplo básico)
CREATE POLICY "Todos podem ler ícones de grupo" ON storage.objects
FOR SELECT USING (bucket_id = 'group-icons');

CREATE POLICY "Todos podem ler mensagens" ON storage.objects
FOR SELECT USING (bucket_id = 'whatsapp-messages');

CREATE POLICY "Usuários autenticados podem adicionar ícones" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'group-icons' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem adicionar mensagens" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'whatsapp-messages' AND auth.role() = 'authenticated'); 