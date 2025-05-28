# Plano Atualizado do Projeto

## 1. Criar estrutura no Supabase ✅
- [x] Configurar tabela groups (id, name, icon_url, created_at, last_updated_at)
- [x] Configurar tabela messages_status (group_id, last_processed_date, last_message_timestamp)
- [x] Configurar buckets para arquivos de mensagens
- [x] Criação da migração SQL para implementação no Supabase

## 2. Reestruturar o Dashboard ✅
- [x] Remover fluxo de upload único atual
- [x] Criar página de listagem de grupos
- [x] Implementar estado "vazio" com orientação para adicionar grupos
- [x] Criar rota Dashboard separada
- [x] Redirecionar rota raiz para o dashboard

## 3. Implementar Modal de Adição de Grupo ✅
- [x] Criar componente de modal estilo Apple com etapas
- [x] Etapa 1: Nome do grupo
- [x] Etapa 2: Upload de ícone (opcional)
- [x] Etapa 3: Upload do arquivo de chat com instruções

## 4. Implementar Processador de Arquivo ✅
- [x] Adaptar o script fornecido para executar no navegador
- [x] Criar sistema de barra de progresso
- [x] Dividir mensagens por dia
- [x] Preparar arquivos para upload

## 5. Integração com Supabase ✅
- [x] Salvar metadados do grupo no banco
- [x] Upload dos arquivos para bucket
- [x] Salvar status do processamento

## 6. Criar Fluxo de Atualização ✅
- [x] Interface para atualizar dados de um grupo existente
- [x] Lógica para processar apenas mensagens novas
- [x] Feedback visual do processo

## 7. Redesign das Páginas de Análise ✅
- [x] Página de visão geral do grupo
- [x] Estrutura para estatísticas e gráficos futuros
- [x] Estrutura para lista de membros futura

## 8. Próximos Passos
- [ ] Implementar análise detalhada de mensagens e membros
- [ ] Adicionar estatísticas avançadas e gráficos interativos
- [ ] Integrar análise de sentimento
- [ ] Implementar funcionalidade de exclusão de grupos

## Notas de Implementação

1. **Estrutura de Arquivos**: O projeto segue a estrutura do Next.js App Router, com os componentes principais na pasta `/components` e as páginas em `/app`.

2. **Design**: Todo o sistema foi desenhado com uma interface minimalista inspirada na Apple, usando Tailwind CSS e componentes shadcn/ui.

3. **Processamento de Arquivos**:
   - Os arquivos do WhatsApp são processados no lado do cliente usando regex
   - Divididos por dia e armazenados no Supabase Storage
   - Atualizações incrementais rastreiam a última mensagem processada

4. **Fluxo de Usuário**:
   - Adicionar grupo → Processar mensagens → Visualizar insights
   - Atualizar grupo quando houver novas mensagens
   - Visualizar estatísticas e tendências

5. **Modelo de Dados**:
   - `groups`: Informações gerais do grupo
   - `messages_status`: Rastreamento do processamento
   - `group_members`: Membros do grupo
   - `daily_stats`: Estatísticas agregadas por dia
   - `member_daily_stats`: Estatísticas por membro por dia 