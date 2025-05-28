PERFEITO, AVANÇAMOS DEMAIS, PRÓXIMA ETAPA:

Após fichar o usuário disponibilizar o botão: Oraculo Analysis. Ao clicar vamos mandar todas as mensagens do usuário para uma chamada API para a OpenAI GPT 4.1 Mini, e pegar o output da chamada API, salvar no supabase, e mostrar no Perfil todos os dados que conseguimos do usuário. E disponibilizar um botão de Ver Todas as Mensagens, para o usuário poder ver todas as mensagens só desse usuáriode forma elegante, em balões de mensagens.

Para a chamada API precisamos fazer da seguinte forma:

POST https://api.openai.com/v1/responses 

HTTP Headers
Authorization: Bearer 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
Content-Type: application/json

Request Body
model: gpt-4.1-mini-2025-04-14
input: Você é um analista comportamental que cria perfis detalhados de membros de grupos com base em suas mensagens. 
Analise cuidadosamente todas as mensagens fornecidas e preencha um JSON organizado nas seguintes categorias:

1. Identificação
2. Comportamento e Personalidade
3. Preferências e Opiniões
4. Outros (informações adicionais e dados aleatórios)

**IMPORTANTE:**
- Responda **apenas** no formato JSON especificado.
- NÃO invente informações. Se algum dado não puder ser identificado, escreva "Não identificado" ou deixe um array vazio.
- As listas devem conter apenas os itens realmente detectáveis nas mensagens analisadas.

Mensagens analisadas:
[INSERIR AQUI AS MENSAGENS DO USUÁRIO, todas as mensagens sem timestamp do arquivo que salvamos no supabase]

instructions: Você é um analista comportamental que cria perfis detalhados de membros de grupos com base em suas mensagens.

Sua tarefa é ler as mensagens fornecidas e gerar um perfil comportamental organizado em 4 seções (abas), no formato JSON abaixo.

**REGRAS IMPORTANTES:**
1. Responda **apenas** com um JSON no formato exato especificado.
2. NÃO inclua explicações, textos fora do JSON ou comentários.
3. Se alguma informação não puder ser identificada, use "Não identificado" (para campos de texto) ou [] (para listas vazias).
4. Não invente dados. Utilize apenas o que for possível deduzir diretamente das mensagens analisadas.

**FORMATO JSON:**

{
  "identificacao": {
    "nome": "Nome do usuário ou 'Não identificado'",
    "total_mensagens_analisadas": 0,
    "resumo_geral": "Resumo geral do comportamento e estilo comunicacional"
  },
  "comportamento_e_personalidade": {
    "topicos_frequentes": ["tópico 1", "tópico 2"],
    "estilo_de_escrita": "Formal / Informal / Usa gírias / Usa emojis",
    "tom_de_comunicacao": "Amigável / Sarcástico / Educado / etc.",
    "horarios_atividade": ["manhã", "noite"],
    "padroes_de_humor": "Positivo / Negativo / Neutro",
    "nivel_prolixidade": "Curto / Médio / Longo",
    "uso_emojis": "Alto / Moderado / Baixo",
    "participacao_polemicas": "Alto / Médio / Baixo",
    "frases_caracteristicas": ["'frase 1'", "'frase 2'"]
  },
  "preferencias_e_opinioes": {
    "gosta_de": ["assunto 1", "assunto 2"],
    "nao_gosta_de": ["assunto 1", "assunto 2"],
    "preferencias_explicitas": ["preferência 1", "preferência 2"],
    "posicionamentos": ["direita", "progressista", "neutro", "não identificado"]
  },
  "outros": {
    "informacoes_adicionais": [
      "Informação adicional 1",
      "Informação adicional 2"
    ],
    "dados_aleatorios": [
      "Dado aleatório 1",
      "Dado aleatório 2"
    ]
  }
}

**Exemplo de campos vazios corretos:**
- "frases_caracteristicas": []
- "gosta_de": []
- "uso_emojis": "Não identificado"

**Resumo:**
Seu objetivo é produzir um JSON limpo e estruturado com o máximo de informações que puder identificar a partir das mensagens fornecidas.

Nunca adicione explicações ou formatações extras fora do JSON.

Apenas gere o JSON solicitado.

Esse é o formato da HTTP Request, lembre de salvar a API Key em .env.local e criar um arquivo só pra essa chamada API E LOG para eu ver a resposta no meu console.
Após receber as respostas coloque no card do usuário que terá 4 abas:

 "identificacao": {
    "nome": "Nome do usuário ou 'Não identificado'",
    "total_mensagens_analisadas": 0,
    "resumo_geral": "Resumo geral do comportamento e estilo comunicacional"
  },
  "comportamento_e_personalidade": {
    "topicos_frequentes": ["tópico 1", "tópico 2"],
    "estilo_de_escrita": "Formal / Informal / Usa gírias / Usa emojis",
    "tom_de_comunicacao": "Amigável / Sarcástico / Educado / etc.",
    "horarios_atividade": ["manhã", "noite"],
    "padroes_de_humor": "Positivo / Negativo / Neutro",
    "nivel_prolixidade": "Curto / Médio / Longo",
    "uso_emojis": "Alto / Moderado / Baixo",
    "participacao_polemicas": "Alto / Médio / Baixo",
    "frases_caracteristicas": ["'frase 1'", "'frase 2'"]
  },
  "preferencias_e_opinioes": {
    "gosta_de": ["futebol", "filmes de ação"],
    "nao_gosta_de": ["política", "notícias negativas"],
    "preferencias_explicitas": ["prefere mensagens de áudio", "gosta de discutir esportes"],
    "posicionamentos": ["direita", "progressista", "neutro", "não identificado"]
  },
  "outros": {
    "informacoes_adicionais": [
      "Mencionou que tem filhos",
      "Fala muito sobre viagens",
      "Demonstra interesse em tecnologia"
    ],
    "dados_aleatorios": [
      "Já compartilhou links de receitas",
      "Costuma usar stickers engraçados"

precisamos melhorar muito a UI do card, que está ruim e nada simétrica, e colocar essas abas apenas se recebermos uma resposta da IA GPT 4.1 MINI, e precisamos salvar essa resposta no supabase também, então criar uma coluna para isso na table member_profiles.