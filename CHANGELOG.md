# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Fixed

- **`SQLITE_CANTOPEN` em produção**: `tmp/` (onde vive o arquivo SQLite) nunca era copiado
  para o build de produção — `adonisrc.ts` só listava `resources/views/**` e `public/**` em
  `metaFiles`, e o Galaxy Cloud builda com `node ace build` direto (não usa
  `infra/Dockerfile`, o único lugar que fazia `mkdir -p tmp`). Corrigido em duas camadas:
  `tmp/.gitkeep` agora entra em `metaFiles`, e `config/database.ts` garante o diretório com
  `mkdirSync` antes de qualquer conexão, independente do método de deploy.
- Layout do `/dashboard` perdia a navbar (caía no `AuthLayout` genérico) logo após o redirect
  do login social e logo após aplicar um filtro — em ambos os casos a URL carrega uma query
  string (`?state=...&code=...` do OAuth, ou `?q=...&category=...` do filtro) e o matcher de
  rota do layout (`inertia/layouts/default.tsx`) comparava a URL completa em vez do pathname.
  Corrigido comparando só o pathname; o redirect de callback do OAuth também para de repassar
  a query string do provedor para `/dashboard` (`withQs(false)`).
- Scripts em `setups/*.sh`: a janela do Git Bash fechava assim que o script terminava
  (double-click no Windows), sem dar tempo de ler os logs — agora cada script pausa com
  "Press any key to close" ao sair (sucesso ou erro) e termina rodando `npm run dev` em
  foreground, então os logs do servidor ficam visíveis na mesma janela.
- **Causa raiz real do 500 no login social em produção**: não era o OAuth em si — qualquer
  request que tocasse o banco falhava, porque o binário pré-compilado do `sqlite3@6.0.1`
  requer uma `glibc` (2.38) mais nova do que a do runtime do Galaxy Cloud
  (`GLIBC_2.38' not found`). `sqlite3` fixado em `5.1.7` (última release antes dessa mudança
  de toolchain de build do pacote) resolve. Ver `docs/deployment.md`.
- Login social (Google/GitHub) retornava HTTP 500 no callback sem nenhum diagnóstico: erros de
  `provider.user()` (rede, credenciais OAuth ausentes/erradas no ambiente, mudança de resposta da
  API do provedor) agora são capturados, logados no servidor e o usuário é redirecionado ao login
  com uma mensagem amigável em vez de uma tela de erro crua.
- Select de "Subject" na página `/contact` ficava com texto branco em fundo branco no dark theme —
  agora usa cores explícitas (fundo branco, texto preto) independente do tema.
- Modal de criar/editar todo e o menu de ações (Edit/Delete) do item de todo ficavam ilegíveis
  (texto branco em fundo branco) em dark theme.
- Botões da aplicação (variant `primary`/`secondary`) em dark theme agora usam fundo branco/texto
  preto no estado normal e uma cor de destaque com texto branco no hover, em vez de herdar tokens
  de tema que colidiam (texto branco sobre fundo quase branco).
- Qualquer rota inexistente (ex.: `/aposkpas`) redireciona para `/` em vez de mostrar uma página
  de erro 404.

### Added

- **Micro-SaaS Stripe**: plano "Pro" com duas variantes de cobrança (mensal $2.99, anual
  $29.90, uma Product com duas Prices). 10 todos grátis por usuário
  (`stripeConfig.freeTodoLimit`) — depois disso, criar um todo exige assinatura ativa
  (`TodoPolicy#create`). Nova página `/checkout` (2 cards de plano, inacessível a quem já tem
  assinatura ativa), seção de billing em `/profile` (plano atual + botão "Manage subscription"
  pro Customer Portal), customer da Stripe criado e persistido (`stripeCustomerId`) no
  primeiro checkout, estado da assinatura sincronizado só via webhook
  (`POST /webhooks/stripe`, nunca na success page) e log de transações de pagamento
  (`payment_transactions`, idempotente por `stripeEventId`). Também escuta
  `customer.subscription.created` (além de `updated`/`deleted`) para cobrir qualquer
  assinatura criada fora do fluxo de Checkout. Tudo opcional — a app sobe sem Stripe
  configurado. Sandbox configurado e testado de ponta a ponta (Product/Prices/webhook via
  Stripe MCP + CLI, fluxo real de checkout → webhook → sincronização → cancelamento
  verificado contra a API de verdade). Ver `docs/billing.md`.
- README.md reescrito como projeto open source: badges de CI/license/Node/AdonisJS/TypeScript,
  introdução, tech stack, setup de desenvolvimento, seção de documentação, créditos.
  `LICENSE` (MIT) e `CONTRIBUTING.md` adicionados na raiz.
- Categoria de todo `Other`; selecionar uma categoria agora é obrigatório ao criar um todo
  (a edição continua permitindo deixar sem categoria).
- Todo: campos `category` (enum fixo) e `dueDate` (data), título com 4–24 caracteres, descrição
  agora opcional (alternável via select) com 4–128 caracteres quando preenchida.
- Dashboard: filtros de busca (título/descrição, categoria, intervalo de datas) e paginação
  (10 itens por página).
- Seed do usuário `admin@gmail.com`: 32 todos gerados aleatoriamente (categorias/datas variadas)
  para testar filtros e paginação.
- Checklist de requisitos de senha (com check/x) abaixo do campo de senha no signup.
- Efeitos de hover nos botões de login/signup social (Google/GitHub) e nos botões de
  login/signup principais.
- Links "Don't have an account yet? Create account" (login) e "Already have an account? Login"
  (signup).
- Navbar: nome do usuário logado ao lado do ícone de perfil; dropdown ganhou links de Contact,
  Terms of Use e Privacy Policy (com ícones), separados do Logout por um `<hr/>`.
- Husky: hooks `pre-commit` (`biome check --staged`), `pre-push` (typecheck + build + testes) e
  `commit-msg` (valida Conventional Commits).
- CI: `.github/workflows/ci.yml` roda lint, typecheck, testes e build em todo push/PR para
  `master` (sem step de deploy — o Galaxy Cloud já publica sozinho via Git push).

### Changed

- Título e descrição do todo agora são sempre salvos em UPPERCASE — forçado tanto no frontend
  (enquanto o usuário digita) quanto no backend (`app/validators/todo.ts` e um hook
  `@beforeSave` no model `Todo`, para cobrir qualquer caminho de escrita). A busca do filtro
  também compara em uppercase, já que `LIKE` é case-sensitive no PostgreSQL (diferente do
  SQLite).
- Dashboard: as ações de editar/excluir um todo trocaram o menu "⋯" por dois ícones (lápis e
  lixeira) alinhados à direita; excluir agora abre um modal de confirmação em vez de excluir
  direto.
- Dashboard: filtro de categoria ficou mais estreito e os dois campos de data do filtro de
  calendário ficaram mais largos.
- Gestão de 2FA saiu da página dedicada `/settings/two-factor` e virou um modal em `/profile`
  ("Manage"); os endpoints correspondentes agora respondem em JSON (consumidos via `fetch` pelo
  modal) em vez de renderizar uma página Inertia.
- Removido o campo "Confirm password" do formulário de signup (mantido em reset de senha e troca
  de senha no perfil, onde o fluxo é diferente).

### Removed

- Página `/settings/two-factor` (`inertia/pages/settings/two_factor.tsx`).
- Página de erro `errors/not_found` (não é mais renderizada — 404 de rota agora redireciona).
