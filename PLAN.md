# PLAN.md — Execution checklist

Fonte de verdade de progresso entre sessões para as tarefas descritas em `TODO.md`.
Cada item concluído deve virar um commit (semver/conventional commits), com push para
`master`. Marque `[x]` só depois do commit correspondente estar feito.

## 0. Preparação

- [x] Explorar estrutura do projeto (routes, controllers, pages, config)
- [x] Investigar causa raiz do bug de deploy no Galaxy Cloud
- [x] Criar este PLAN.md

## 1. Bug de deploy (Galaxy Cloud + SQLite no Docker)

Causa raiz confirmada: `better-sqlite3` não publica binário pré-compilado — todo
`npm install` roda `node-gyp rebuild`, exigindo `python3/make/g++`. O build gerenciado do
Galaxy Cloud (base `meteor/galaxy-node`, sem Dockerfile customizado suportado para apps
Node/AdonisJS) não tem esses pacotes e não documenta forma de adicioná-los. O pacote
`sqlite3` (também suportado nativamente pelo Lucid) tenta baixar um binário pré-compilado
via `prebuild-install` antes de cair em `node-gyp`, então evita o problema na prática.

- [x] Trocar client SQLite de `better-sqlite3` para `sqlite3` em `config/database.ts`
- [x] Atualizar `package.json` (remover `better-sqlite3`, adicionar `sqlite3` com versão exata)
- [x] Atualizar `infra/Dockerfile` / docs (`docs/database.md`, `docs/deployment.md`)
- [x] Rodar `npm install`, migrations e suíte de testes localmente para validar (46/46 pass)
- [x] Commit + push

## 2. Envio de emails via Resend + react-email

Nota: `@adonisjs/mail` já traz um transporte `resend` embutido (sem SDK extra). Para o
JSX das mensagens, `@react-email/components` (e todos os pacotes individuais
`@react-email/*`) estão deprecados em favor do pacote unificado `react-email`, que por sua
vez arrasta toda a toolchain do seu CLI (esbuild, tailwindcss, socket.io, prismjs...) só
para renderizar duas mensagens simples — não compensa o peso. Optou-se por JSX simples
(tags HTML puras) renderizado com `@react-email/render` (mantido, dependências enxutas).

- [x] Remover config SMTP de `config/mail.ts`, adicionar transporte `resend`
- [x] Adicionar `RESEND_API_KEY`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` em `.env`/`.env.example`/`start/env.ts`
- [x] Instalar `@react-email/render` (versão estável) e migrar templates de `app/mails/*` para JSX
- [x] Atualizar `docs/` relevante (auth.md, deployment.md, README.md) e remover Mailpit do docker-compose/setups
- [x] Rodar testes relacionados a envio de email (46/46 pass) + build de produção
- [x] Commit + push

## 3. Drizzle Studio como visualizador do banco

- [x] Instalar `drizzle-kit` + `drizzle-orm` (dev deps) + `@libsql/client` (introspecção SQLite sem compilar nada)
- [x] Criar `drizzle.config.ts` (dialect dinâmico via `DB_CONNECTION`)
- [x] Rodar `drizzle-kit pull` e documentar o fluxo (`docs/database.md`)
- [x] Adicionar `./drizzle` ao `.gitignore` (e excluir de tsc/eslint)
- [x] Adicionar script npm `db:studio`
- [x] Commit + push

## 4. Página /login

- [x] Ícone de olho (mostrar/ocultar senha)
- [x] Validação de senha 8–32 caracteres
- [x] Remover navbar, título centralizado com link para landing page (AuthLayout)
- [x] Forçar dark theme nessa página (AuthLayout forceDark)
- [x] Commit + push

## 5. Página /signup

- [x] Auto-capitalização de cada palavra do full name
- [x] Validação full name 4–24 caracteres
- [x] Ícone de olho no campo de senha
- [x] Validação de senha 8–32 chars, 1 maiúscula, 1 minúscula, 1 número, 1 especial
- [x] Botões "Create Account with GitHub/Google" com ícone
- [x] Remover navbar, título centralizado com link para landing page (AuthLayout)
- [x] Forçar dark theme nessa página (AuthLayout forceDark)
- [x] Commit + push

## 6. Página /forgot-password

- [x] Remover navbar, título centralizado com link para landing page (AuthLayout)
- [x] Forçar dark theme nessa página (AuthLayout forceDark)
- [x] Commit + push

## 7. Landing page (/)

- [x] Remover botão "Começar agora"
- [x] Layout sem scroll (100vh) com efeito matrix (0/1 caindo) no fundo, dark theme
- [x] Título atraente à esquerda, placeholder de imagem/gif à direita
- [x] Botão Signup verde "matrix" com hover, botão Login branco com hover
- [x] Footer: copyright à esquerda, links (Contact, Terms Of Use, Privacy Policy) à direita
- [x] Redirecionar usuário autenticado para /dashboard (guest middleware, feito no commit de layouts)
- [x] Commit + push

## 8. Página /contact

- [x] Form: full name + email pré-preenchidos/disabled (readOnly) se autenticado
- [x] Select de assunto (Bug/Technical issue, Suggestion or question, Other)
- [x] Textarea 7 rows, 32–512 chars, contador "x/512 characters"
- [x] Botão hover verde matrix
- [x] Rota + controller + validator + email de notificação (Resend)
- [x] Commit + push

## 9. Rota /dashboard (ex /todos) + navbar

- [x] Renomear rota/página de `/todos` para `/dashboard`
- [x] Navbar: título à esquerda, ícone de usuário + dropdown (Profile, API, Toggle tema, Logout) à direita
- [x] Commit + push (feito junto do commit da fundação de tema/layouts)

## 10. Página /profile/api (docs da API + tokens)

- [x] Sistema de geração de API tokens do usuário (access tokens do Adonis)
- [x] Página com `@scalar/api-reference-react` documentando os endpoints REST
- [x] Copiar valores com `clipboard.js` + toast de confirmação
- [x] Exemplos práticos com cURL e `fetch` nativo
- [x] Commit + push

## 11. Página /profile

- [x] Form editar nome
- [x] Campo email disabled pré-preenchido
- [x] Form trocar senha (exige senha atual)
- [x] Botão excluir conta → modal com cooldown de 10s + aviso de 30 dias para reverter (soft-delete real, cancela no login, `users:purge-deleted`)
- [x] Form de gestão de 2FA (status + link para habilitar/desabilitar)
- [x] Commit + push

## 12. BiomeJS v2

- [ ] Remover ESLint/Prettier padrão do AdonisJS
- [ ] Instalar e configurar Biome v2 (lint + format)
- [ ] Atualizar scripts npm (`lint`, `format`)
- [ ] Commit + push

## 13. Husky (git hooks)

- [ ] Instalar Husky
- [ ] `pre-commit`: format + lint (Biome)
- [ ] `pre-push`: typecheck + build + testes
- [ ] Hook de validação de commit message (conventional commits / semver)
- [ ] Commit + push

## 14. CI/CD GitHub Actions → Galaxy Cloud

- [ ] Perguntar ao usuário credenciais/permissões necessárias (token Galaxy, secrets do GitHub)
- [ ] Criar workflow `.github/workflows/*.yml` (lint, typecheck, test, build, deploy)
- [ ] Documentar em `docs/deployment.md` (ou novo `docs/ci-cd.md`)
- [ ] Avaliar necessidade de skill dedicada em `.claude/skills/`
- [ ] Commit + push

## Transversal (aplicado ao longo de todas as tarefas acima)

- [ ] Toda a interface (textos visíveis) em inglês
- [ ] Toda lógica de endpoints/URLs em inglês
- [ ] Redirecionar usuários autenticados para longe de login/signup/forgot-password/reset-password/landing page
- [ ] Fonte global: JetBrains Mono
- [ ] Adicionar skills `frontend-design`, `web-design-guidelines`, `vercel-react-best-practices`, `ui-ux-pro-max`, `minimalist-ui` em `.claude/skills/` e usá-las
- [ ] Atualizar `CLAUDE.md` com a regra de interface em inglês
- [ ] Atualizar `CHANGELOG.md` ao final do conjunto de mudanças
