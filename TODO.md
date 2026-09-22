# TODO — TODO List Full-Stack (AdonisJS v7)

Fonte de verdade do progresso. Atualizar a cada tarefa concluída.

Legenda: `[x]` concluído e testado · `[ ]` pendente · `[~]` bloqueado/pendência externa (ver notas)

## Fase 0 — Bootstrap

- [x] Scaffold do projeto via `create-adonisjs` (kit `react` = Inertia + React 19, já traz Lucid, VineJS, Session Auth, Shield, Vite)
- [x] Confirmar Node v24+ (ambiente tem v26.8.1) e AdonisJS v7.5.0 real (publicado no npm)
- [ ] `TODO.md` inicial (este arquivo)
- [ ] `CLAUDE.md` + esqueleto de `docs/`
- [ ] Primeiro commit (`chore: bootstrap adonisjs v7 + inertia react project`)

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

- [ ] Migration `todos` (user_id FK, title, description, completed, timestamps)
- [ ] Model `Todo` (belongsTo User)
- [ ] `TodoService` (regra de negócio, controllers finos)
- [ ] Validators VineJS (create/update)
- [ ] Policy `TodoPolicy` (Bouncer) — usuário só acessa seus próprios todos
- [ ] Controller web (Inertia): index/store/update/toggle/destroy
- [ ] Páginas React: lista, criar/editar (modal ou página), estado concluído
- [ ] Controller API REST equivalente (`/api/todos`) com guard de access tokens
- [ ] Rotas web + API, ambas autenticadas
- [ ] Testes unitários (TodoService), funcionais (controllers web+API), E2E (fluxo completo)

## Fase 4 — Autenticação e autorização (extensões)

- [ ] Recuperação de senha (solicitar → token por email → redefinir)
- [ ] Magic link login (token único por email, sem senha)
- [ ] 2FA TOTP (enroll com QR code, verificação no login)
- [ ] Login social Google (Ally)
- [ ] Login social GitHub (Ally)
- [ ] Guard de access tokens para API (`tokens` guard do `@adonisjs/auth`)
- [ ] Rate limiting em login e recuperação de senha (`@adonisjs/limiter`)
- [ ] `docs/auth.md`
- [ ] Testes para cada fluxo (funcional/E2E)

> Nota: login social (Google/GitHub) e envio de email (reset/magic link) exigem credenciais
> reais (`OAUTH_*`, `SMTP_*`) que só o usuário pode gerar. O código e os testes cobrem o
> fluxo completo com credenciais de teste/mock; a validação com credenciais reais fica como
> pendência explícita até o usuário fornecer os valores em `.env`.

## Fase 5 — Seeds

- [ ] Seeder admin (`admin@gmail.com` / `adminBR@123`) + todos de exemplo
- [ ] `node ace db:seed` documentado

## Fase 6 — API

- [ ] `docs/api.md` (contratos de request/response de todos os endpoints REST)

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
- [ ] `docs/testing.md`
- [ ] `.claude/skills/` com os fluxos dominados
- [ ] `README.md` completo na raiz
- [ ] Revisão final do Definition of Done (ver prompt original)

## Pendências externas conhecidas

- Credenciais reais de OAuth (Google/GitHub) — usuário deve criar os apps e preencher `.env`
- Credenciais reais de SMTP para envio de email (reset de senha, magic link) — usuário deve
  fornecer um provedor (ex.: Mailtrap para dev, SMTP real para produção)
- Teste dos 6 scripts em `setups/` em ambiente Windows real e Unix real com Docker rodando
