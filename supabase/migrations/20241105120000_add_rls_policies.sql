-- Adicionar políticas de segurança de linha (RLS) para a tabela groups
-- Esta migração adiciona suporte para usuários autenticados interagirem com grupos

-- Habilitar RLS para a tabela groups se ainda não estiver habilitado
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Política para permitir usuários autenticados verem todos os grupos
CREATE POLICY "Usuários autenticados podem ver grupos" 
ON groups
FOR SELECT 
TO authenticated
USING (true);

-- Política para permitir usuários autenticados inserirem novos grupos
CREATE POLICY "Usuários autenticados podem criar grupos" 
ON groups
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Política para permitir usuários autenticados atualizarem grupos
-- Aqui poderia ser adicionada uma lógica para restringir a apenas donos de grupo
CREATE POLICY "Usuários autenticados podem atualizar grupos" 
ON groups
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para permitir usuários autenticados excluírem grupos
-- Aqui poderia ser adicionada uma lógica para restringir a apenas donos de grupo
CREATE POLICY "Usuários autenticados podem excluir grupos" 
ON groups
FOR DELETE 
TO authenticated
USING (true);

-- Habilitar a permissão para usuários anônimos verem grupos (somente leitura)
CREATE POLICY "Usuários anônimos podem ver grupos" 
ON groups
FOR SELECT 
TO anon
USING (true);

-- Adicionar referência do usuário que criou o grupo (pode ser necessário para permissões futuras)
ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id); 