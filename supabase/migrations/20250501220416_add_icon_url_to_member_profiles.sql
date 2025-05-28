-- Adicionar novas colunas à tabela member_profiles
ALTER TABLE member_profiles
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS real_name TEXT,
ADD COLUMN IF NOT EXISTS anotacoes TEXT;

-- Criar um bucket para armazenar as fotos de perfil se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pictures', 'profile_pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Definir política para permitir acesso público às imagens
CREATE POLICY "Permitir acesso público às fotos de perfil"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile_pictures');

-- Definir política para permitir upload de fotos pelos usuários autenticados
CREATE POLICY "Permitir upload pelos usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile_pictures' AND
  auth.role() = 'authenticated'
);

-- Definir política para permitir atualização/exclusão pelas próprias pessoas
CREATE POLICY "Permitir atualização pelos próprios usuários"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile_pictures' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'profile_pictures' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Permitir exclusão pelos próprios usuários"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile_pictures' AND
  auth.role() = 'authenticated'
);
