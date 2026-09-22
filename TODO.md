# TODO — TODO List Full-Stack (AdonisJS v7)

Fonte de verdade do progresso. Atualizar a cada tarefa concluída.

Legenda: `[x]` concluído e testado · `[ ]` pendente · `[~]` bloqueado/pendência externa (ver notas)

## Fase 0 — Bootstrap

- [x] Scaffold do projeto via `create-adonisjs` (kit `react` = Inertia + React 19, já traz Lucid, VineJS, Session Auth, Shield, Vite)
- [x] Confirmar Node v24+ (ambiente tem v26.8.1) e AdonisJS v7.5.0 real (publicado no npm)
- [x] `TODO.md` inicial (este arquivo)
- [x] `CLAUDE.md` + esqueleto de `docs/`
- [x] Primeiro commit (`chore: bootstrap adonisjs v7 + inertia react project`)

## Fase 1 — Banco de dados dual (SQLite / PostgreSQL)

- [x] Instalar driver `pg`
- [x] `config/database.ts` lendo `DB_CONNECTION` do `.env` (sqlite | pg) sem alterar código
- [x] `.env.example` completo e comentado para os dois drivers
- [x] `docs/database.md`
- [x] Teste: migrations rodam em ambos os drivers (sqlite local; pg via container Docker
      temporário — migrou com sucesso em ambos sem alterar código)

## Fase 2 — Estilo (Tailwind v4 + Base UI)

- [x] Instalar Tailwind CSS v4 (plugin Vite) + Base UI
- [x] Layout base React (Inertia) com Tailwind aplicado (header, home, login, signup,
      páginas de erro; componentes reutilizáveis `TextField`/`Button`)
- [x] Verificar dev server renderiza estilos corretamente (screenshot via Playwright,
      sem erros de console) — uso real do Base UI (Dialog/Checkbox/Menu) chega na Fase 3
      junto com a UI de Todos, onde faz sentido de fato

## Fase 3 — Domínio Todos (CRUD)

- [x] Migration `todos` (user_id FK, title, description, completed, timestamps) + migration
      `auth_access_tokens` (necessária para o guard de tokens da API)
- [x] Model `Todo` (belongsTo User) + relação inversa `User.todos` (hasMany)
- [x] `TodoService` (regra de negócio, controllers finos)
- [x] Validators VineJS (create/update)
- [x] Policy `TodoPolicy` (Bouncer) — usuário só acessa seus próprios todos
- [x] Controller web (Inertia): index/store/update/destroy (toggle reaproveita update)
- [x] Páginas React: lista (`todos/index`), modal de criar/editar com Base UI Dialog,
      Checkbox (concluído) e Menu (editar/excluir) — primeiro uso real do Base UI
- [x] Controller API REST equivalente (`/api/todos`) com guard de access tokens (`api`)
      + `POST/DELETE /api/login|logout` para emitir/revogar o token
- [x] Rotas web + API, ambas autenticadas
- [x] Testes: 11 unitários (`TodoService` + validators), 12 funcionais (web + API,
      incluindo autorização cruzada entre usuários), 1 E2E de browser (signup → criar →
      concluir → editar → excluir → logout) — 24/24 passando
- [x] `npm run build` (produção) validado de ponta a ponta

## Fase 4 — Autenticação e autorização (extensões)

- [x] `@adonisjs/mail` (SMTP), `@adonisjs/ally` (Google/GitHub) e `@adonisjs/limiter`
      (store `database`) instalados e configurados
- [x] Recuperação de senha (solicitar → token por email → redefinir) — tabela genérica
      `auth_tokens` (reaproveitada pelo magic link), token hasheado (SHA-256) e de uso
      único, resposta uniforme para não vazar quais emails existem
- [x] Magic link login (token único por email, sem senha) — reaproveita `auth_tokens`/
      `AuthTokenService` da recuperação de senha
- [x] 2FA TOTP (enroll com QR code, verificação no login) — implementação própria
      (RFC 6238 via `node:crypto`, sem pacote oficial disponível), secret e códigos de
      recuperação criptografados em repouso, `serializeAs: null` no model auto-gerado
- [ ] Login social Google (Ally)
- [ ] Login social GitHub (Ally)
- [x] Guard de access tokens para API (`tokens` guard do `@adonisjs/auth`) — feito na Fase 3
- [x] Rate limiting em login (5/min), recuperação de senha e magic link (3/15min cada),
      por IP (`@adonisjs/limiter`, store `database`)
- [x] `docs/auth.md` (recuperação de senha, magic link, 2FA; login social falta)
- [x] Testes: recuperação de senha (4), magic link (4), rate limiting (1), TOTP (5
      unitários), 2FA end-to-end (4 funcionais) — todos passando — 41/41 no total até
      aqui (+ 1 E2E de browser = 42)

> Nota: login social (Google/GitHub) e envio de email (reset/magic link) exigem credenciais
> reais (`OAUTH_*`, `SMTP_*`) que só o usuário pode gerar. O código e os testes cobrem o
> fluxo completo com credenciais de teste/mock; a validação com credenciais reais fica como
> pendência explícita até o usuário fornecer os valores em `.env`.

## Fase 5 — Seeds

- [ ] Seeder admin (`admin@gmail.com` / `adminBR@123`) + todos de exemplo
- [ ] `node ace db:seed` documentado

## Fase 6 — API

- [x] `docs/api.md` (contratos de request/response de todos os endpoints REST) — escrito
      antecipadamente junto com a Fase 3; revisar quando a Fase 4 adicionar mais rotas

## Fase 7 — Infraestrutura

- [ ] `infra/Dockerfile` multi-stage produção
- [ ] `infra/docker-compose.yml` (app + Postgres)
- [ ] `setups/setup-unix-using-sqlite-localhost.sh`
- [ ] `setups/setup-unix-using-postgresql-localhost.sh`
- [ ] `setups/setup-unix-using-postgresql-docker.sh`
- [ ] `setups/setup-windows-using-sqlite-localhost.sh`
- [ ] `setups/setup-windows-using-postgresql-localhost.sh`
- [ ] `setups/setup-windows-using-postgresql-docker.sh`
- [ ] `docs/deployment.md`

## Fase 8 — Documentação final

- [ ] `docs/architecture.md`
- [x] `docs/testing.md` — escrito antecipadamente junto com a Fase 3
- [ ] `.claude/skills/` com os fluxos dominados
- [ ] `README.md` completo na raiz
- [ ] Revisão final do Definition of Done (ver prompt original)

## Pendências externas conhecidas

- Credenciais reais de OAuth (Google/GitHub) — usuário deve criar os apps e preencher `.env`
- Credenciais reais de SMTP para envio de email (reset de senha, magic link) — usuário deve
  fornecer um provedor (ex.: Mailtrap para dev, SMTP real para produção)
- Teste dos 6 scripts em `setups/` em ambiente Windows real e Unix real com Docker rodando
