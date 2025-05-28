✅ Plano Detalhado
[x] 1. Criar estrutura no Supabase
[x] Configurar tabela groups (id, name, icon_url, created_at, last_updated_at)
[x] Configurar tabela messages_status (group_id, last_processed_date, last_message_timestamp)
[x] Configurar bucket para arquivos de mensagens
[ ] 2. Reestruturar o Dashboard
[ ] Remover fluxo de upload único atual
[ ] Criar página de listagem de grupos
[ ] Implementar estado "vazio" com orientação para adicionar grupos
[ ] 3. Implementar Modal de Adição de Grupo
[ ] Criar componente de modal estilo Apple com etapas
[ ] Etapa 1: Nome do grupo
[ ] Etapa 2: Upload de ícone (opcional)
[ ] Etapa 3: Upload do arquivo de chat com instruções
[ ] 4. Implementar Processador de Arquivo
[ ] Adaptar o script fornecido para executar no navegador
[ ] Criar sistema de barra de progresso
[ ] Dividir mensagens por dia
[ ] Preparar arquivos para upload
[ ] 5. Integração com Supabase
[ ] Salvar metadados do grupo no banco
[ ] Upload dos arquivos para bucket
[ ] Salvar status do processamento
[ ] 6. Criar Fluxo de Atualização
[ ] Interface para atualizar dados de um grupo existente
[ ] Lógica para processar apenas mensagens novas
[ ] Feedback visual do processo
[ ] 7. Redesign das Páginas de Análise
[ ] Página de visão geral do grupo
[ ] Estatísticas e gráficos
[ ] Lista de membros

Para entender melhor esse é o prompt inicial com a alma de tudo que quero fazer:

Ok, agora vamos para uma parte Super Importante, vamos mudar o Fluxo atual, primeira coisa, no dashboard temos a função seguinte:

Welcome to WhatsApp Insights
Upload your WhatsApp chat export to analyze group activity, member engagement, and more.

Drop your WhatsApp chat export here

Only .txt files exported from WhatsApp are supported

Vamos tirar essa etapa, pois agora usaremos uma nova proposta, o usuário terá que adicionar os grupos, ele serão listados e salvos no Supabase para não precisar fazer upload do TSX toda vez, vamos primeiro para essa pagina. Dashboard também está tudo aglomerado conforme formos avançando, vamos separar cada pagina. Primeira coisa é essa página que somos redirecionados após o login, que é a página Dashboard. Se não hou ver grupos ainda no Supabase, vamos pedir pro usuário adicionar o primeiro Grupo, o processo deve ser totalmente UX Friendly, com inspiração na apple. O usuário clica no botão de adicionar grupo, irá abrir um card grande em Pop-up no site Guiando em cada etapa de forma fácil. Primeira Etapa, nome do grupo (obrigatório), segunda etapa icone do grupo (essa etapa é opcional), e na terceita e mais importante etapa Arquivo inicial, guiando o usuário a fazer o export de todas as mensagens sem mídia do grupo do whatsapp. Nessa etapa será rodado um script Javascript para pegar esse arquivo bruto com todas as mensagens do grupo e separálas por dia, um arquivo .txt por dia.

O escrip deve funcionar exatamente igual esse:

#!/usr/bin/env node
/*  split_whatsapp_by_day.js
    Uso:  node split_whatsapp_by_day.js [_chat.txt]
-----------------------------------------------------------------*/
import fs   from 'fs';
import path from 'path';

// ── 1. Configurações ────────────────────────────────────────────
const SRC_FILE  = process.argv[2] || '_chat.txt';   // arquivo de origem
const OUT_DIR   = 'mensagens_por_dia';              // pasta destino

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── 2. Carrega o chat inteiro em memória ───────────────────────
const content = fs.readFileSync(SRC_FILE, 'utf8');

// Regex: pega bloco que começa com “[dd/mm/aaaa, hh:mm:ss]” até o
// próximo cabeçalho ou o fim do arquivo.
const MSG_BLOCK =
  /\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\][\s\S]*?(?=\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\]|$)/g;

const messages = content.match(MSG_BLOCK) || [];

// ── 3. Agrupa por dia ──────────────────────────────────────────
const DATE_TAG  = /\[(\d{2}\/\d{2}\/\d{4})/;
const byDay = {};

for (const msg of messages) {
  const m = msg.match(DATE_TAG);
  if (!m) continue;
  const date = m[1];                      // 12/04/2025
  (byDay[date] ??= []).push(msg);
}

// ── 4. Gera um arquivo por dia ─────────────────────────────────
for (const [date, msgs] of Object.entries(byDay)) {
  const fileName = path.join(
    OUT_DIR,
    `${date.replace(/\//g, '-')}.txt`     // 12-04-2025.txt
  );
  fs.writeFileSync(fileName, msgs.join(''), 'utf8');
}

console.log(
  `Separação concluída! ${Object.keys(byDay).length} arquivos salvos em “${OUT_DIR}”.`
);

Mostre uma barra de carregamento pro usuário, e um feedback quando tudo estiver concluido, após isso vamos salvar no supabase esses arquivos em bucket no supabase, um por um, e sempre no último arquivo, teremos uma coluna salvo a última linha do ultimo arquivo, para que na próxima atualização comçe por lá, entendeu?

Após tudo salvo no Supabase e devidamente conectado, o usuário terá o dashboard sempre pronto para usar, e depois poderá atualizar fazendo o upload do arquivo atualizado que iremos apenas adicionar o conteúdo novo sem substituir tudo.

Verifique minha estrutura, Crie um arquivo com o plano detalhado para os próximos passos, com varios checkmarks, e começe a iplementação, sempre atualizando o checkmar a medida que progredimos.  