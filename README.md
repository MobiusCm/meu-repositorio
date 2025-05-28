# Finance Flow

Aplicação moderna desenvolvida com Next.js 15 e TypeScript para gerenciamento financeiro, oferecendo insights inteligentes e controle de despesas.

## Tecnologias Principais

- **Frontend**: Next.js 15.3.1, React 19, TypeScript
- **Estilização**: Tailwind CSS 4.1.5
- **Banco de Dados**: Supabase
- **Autenticação**: Supabase Auth
- **UI Components**: Radix UI
- **Animações**: Framer Motion
- **Formulários**: React Hook Form com Zod
- **Gráficos**: Recharts

## Recursos

- Dashboard interativo
- Relatórios personalizados
- Gerenciamento de grupos e membros
- Análise de insights financeiros
- Interface responsiva e moderna
- Autenticação segura

## Instalação

```bash
# Instalar dependências
npm install
# ou
yarn install
# ou
pnpm install

# Configurar variáveis de ambiente
# Copie o arquivo .env.example para .env.local e adicione suas chaves

# Iniciar servidor de desenvolvimento
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

## Estrutura do Projeto

```
/
├── app/                  # Rotas e páginas (App Router)
├── components/           # Componentes reutilizáveis
├── lib/                  # Funções utilitárias e lógica comum
├── hooks/                # Custom React hooks
├── public/               # Arquivos estáticos
├── styles/               # Estilos globais
└── supabase/             # Configuração e tipos do Supabase
```

## Requisitos

- Node.js 18.0 ou superior
- Conta no Supabase para banco de dados
- Chave de API do OpenAI (opcional, para features de IA)

## Configuração de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=seu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase
NEXT_PUBLIC_OPENAI_API_KEY=sua_chave_api_openai
``` 