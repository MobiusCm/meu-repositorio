-- Migration: Criar tabelas para sistema de administração de insights
-- Criado em: 2025-05-28
-- Descrição: Infraestrutura para permitir que usuários configurem e criem insights customizados

-- Tabela para preferências de insights por usuário e grupo
CREATE TABLE IF NOT EXISTS insight_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  custom_threshold JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"email": false, "push": false, "inApp": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir uma preferência por usuário/grupo/tipo de insight
  UNIQUE(user_id, group_id, insight_type)
);

-- Tabela para insights customizados criados pelos usuários
CREATE TABLE IF NOT EXISTS custom_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  formula JSONB NOT NULL, -- Estrutura da fórmula
  variables JSONB NOT NULL DEFAULT '[]', -- Variáveis utilizadas
  conditions JSONB NOT NULL DEFAULT '[]', -- Condições de ativação
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'custom',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para alertas de insights
CREATE TABLE IF NOT EXISTS insight_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  insight_id TEXT, -- ID do insight padrão que gerou o alerta
  custom_insight_id UUID REFERENCES custom_insights(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  data JSONB NOT NULL DEFAULT '{}', -- Dados do insight quando foi ativado
  
  -- Garantir que pelo menos um dos IDs de insight esteja presente
  CHECK (insight_id IS NOT NULL OR custom_insight_id IS NOT NULL)
);

-- Tabela para templates de fórmulas predefinidas
CREATE TABLE IF NOT EXISTS formula_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  formula JSONB NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  conditions JSONB NOT NULL DEFAULT '[]',
  example_use_case TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_insight_preferences_user_group ON insight_preferences(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_insight_preferences_type ON insight_preferences(insight_type);
CREATE INDEX IF NOT EXISTS idx_custom_insights_user ON custom_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_insights_category ON custom_insights(category);
CREATE INDEX IF NOT EXISTS idx_insight_alerts_user ON insight_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_alerts_group ON insight_alerts(group_id);
CREATE INDEX IF NOT EXISTS idx_insight_alerts_acknowledged ON insight_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_formula_templates_category ON formula_templates(category);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insight_preferences_updated_at 
  BEFORE UPDATE ON insight_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_insights_updated_at 
  BEFORE UPDATE ON custom_insights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE insight_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_templates ENABLE ROW LEVEL SECURITY;

-- Policies para insight_preferences
CREATE POLICY "Users can view their own insight preferences" ON insight_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insight preferences" ON insight_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insight preferences" ON insight_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insight preferences" ON insight_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para custom_insights
CREATE POLICY "Users can view their own custom insights" ON custom_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom insights" ON custom_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom insights" ON custom_insights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom insights" ON custom_insights
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para insight_alerts
CREATE POLICY "Users can view their own insight alerts" ON insight_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insight alerts" ON insight_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insight alerts" ON insight_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insight alerts" ON insight_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para formula_templates (somente leitura para todos)
CREATE POLICY "Anyone can view formula templates" ON formula_templates
  FOR SELECT USING (true);

-- Inserir templates de fórmulas predefinidas
INSERT INTO formula_templates (name, description, category, formula, variables, conditions, example_use_case, difficulty_level) VALUES
(
  'Crescimento Acelerado',
  'Detecta quando a atividade do grupo cresceu significativamente em relação ao período anterior',
  'Crescimento',
  '{"expression": "((current.total_messages - previous.total_messages) / previous.total_messages) * 100", "type": "percentage_growth"}',
  '["current.total_messages", "previous.total_messages"]',
  '[{"field": "result", "operator": "gt", "value": 50}]',
  'Útil para identificar quando estratégias de engajamento estão funcionando excepcionalmente bem',
  'beginner'
),
(
  'Concentração Extrema',
  'Identifica quando poucos membros dominam excessivamente as conversas',
  'Distribuição',
  '{"expression": "(top3_members_messages / total_messages) * 100", "type": "concentration_percentage"}',
  '["top3_members_messages", "total_messages"]',
  '[{"field": "result", "operator": "gt", "value": 80}]',
  'Importante para manter equilíbrio nas discussões e evitar monopolização',
  'intermediate'
),
(
  'Atividade de Baixa Qualidade',
  'Detecta quando as mensagens são muito curtas e há pouco conteúdo multimídia',
  'Qualidade',
  '{"expression": "avg_message_length < 10 && media_ratio < 0.1", "type": "quality_check"}',
  '["avg_message_length", "media_ratio"]',
  '[{"field": "avg_message_length", "operator": "lt", "value": 10}, {"field": "media_ratio", "operator": "lt", "value": 0.1}]',
  'Ajuda a identificar quando o conteúdo pode estar perdendo qualidade',
  'intermediate'
),
(
  'Pico Suspeito',
  'Detecta picos de atividade muito intensos e de curta duração',
  'Anomalias',
  '{"expression": "peak_activity_ratio > 5 && peak_duration < 2", "type": "anomaly_detection"}',
  '["peak_activity_ratio", "peak_duration_hours"]',
  '[{"field": "peak_activity_ratio", "operator": "gt", "value": 5}, {"field": "peak_duration_hours", "operator": "lt", "value": 2}]',
  'Útil para detectar eventos anômalos ou possível spam',
  'advanced'
),
(
  'Declínio Gradual',
  'Identifica tendências de declínio consistente ao longo do tempo',
  'Tendências',
  '{"expression": "weekly_decline_count >= 3 && avg_weekly_decline > 10", "type": "trend_analysis"}',
  '["weekly_decline_count", "avg_weekly_decline"]',
  '[{"field": "weekly_decline_count", "operator": "gte", "value": 3}, {"field": "avg_weekly_decline", "operator": "gt", "value": 10}]',
  'Detecta problemas de engajamento antes que se tornem críticos',
  'advanced'
),
(
  'Horário de Ouro',
  'Identifica quando há alta concentração de atividade em horários específicos',
  'Temporal',
  '{"expression": "(peak_hour_activity / total_activity) * 100", "type": "temporal_concentration"}',
  '["peak_hour_activity", "total_activity"]',
  '[{"field": "result", "operator": "gt", "value": 40}]',
  'Ajuda a otimizar horários de postagem e eventos',
  'beginner'
),
(
  'Participação Balanceada',
  'Detecta quando há boa distribuição de participação entre os membros',
  'Engajamento',
  '{"expression": "participation_diversity_index > 0.7 && active_member_ratio > 0.2", "type": "balance_check"}',
  '["participation_diversity_index", "active_member_ratio"]',
  '[{"field": "participation_diversity_index", "operator": "gt", "value": 0.7}, {"field": "active_member_ratio", "operator": "gt", "value": 0.2}]',
  'Reconhece quando o grupo tem dinâmica saudável e equilibrada',
  'intermediate'
);

COMMENT ON TABLE insight_preferences IS 'Armazena preferências do usuário para cada tipo de insight por grupo';
COMMENT ON TABLE custom_insights IS 'Insights customizados criados pelos usuários com fórmulas próprias';
COMMENT ON TABLE insight_alerts IS 'Histórico de alertas gerados pelos insights';
COMMENT ON TABLE formula_templates IS 'Templates predefinidos de fórmulas para facilitar criação de insights customizados'; 