# Autenticação e autorização

## Autenticação

- Guard `web` (sessão) para a camada Inertia — cadastro (`NewAccountController`), login e
  logout (`SessionController`). Senhas com hash via `withAuthFinder` (hasher padrão do
  AdonisJS).
- Guard `api` (access tokens, `@adonisjs/auth`) para a API REST — ver `docs/api.md`.
- Recuperação de senha, magic link, 2FA e login social (Google/GitHub) — todos abaixo.

## Recuperação de senha

Fluxo: `POST /forgot-password` (email) → email com link assinado (via um token de uso
único) → `GET /reset-password/:token` (formulário) → `PUT /reset-password` (nova senha).

- `app/services/auth_token_service.ts` gera um token aleatório (`crypto.randomBytes`),
  guarda apenas o hash SHA-256 dele na tabela `auth_tokens` (nunca o valor em texto puro) e
  devolve o valor original só para ir no link do email — o mesmo padrão que os
  `auth_access_tokens` do próprio framework usam.
- A tabela `auth_tokens` é compartilhada entre recuperação de senha e magic link (coluna
  `type`), já que as duas features precisam exatamente da mesma forma: token com expiração,
  de uso único, associado a um usuário.
- `POST /forgot-password` sempre responde com a mesma mensagem de sucesso, exista ou não
  aquele email — evita que alguém descubra quais emails têm conta testando o formulário.
- O token expira em 1 hora e é marcado como usado (`used_at`) assim que a senha é
  redefinida; uma segunda tentativa com o mesmo token falha.
- Rate limiting: 5 tentativas de login por minuto e 3 pedidos de recuperação de senha a
  cada 15 minutos, por IP (`start/limiter.ts`, guardado na tabela `rate_limits` via o store
  `database` do `@adonisjs/limiter` — sem precisar de Redis).
- Emails são enviados via `@adonisjs/mail` usando o transporte `resend` (ver
  `config/mail.ts` e `RESEND_API_KEY` em `.env`); nos testes, `mail.fake()` intercepta o
  envio sem precisar de nenhuma chamada real à API do Resend.

## Magic link

`POST /magic-link` (email) → email com link de login de uso único → `GET
/magic-link/:token` autentica direto (sem senha) e redireciona para `/todos`.

Reaproveita `AuthTokenService`/`auth_tokens` (mesma tabela da recuperação de senha, com
`type = 'magic_link'`), o mesmo princípio de resposta uniforme (não revela quais emails
existem) e a mesma limitação de 3 pedidos a cada 15 minutos por IP. O link expira em 15
minutos e só pode ser usado uma vez.

## Autenticação de dois fatores (2FA / TOTP)

Não existe pacote oficial de 2FA no AdonisJS, então `app/services/totp_service.ts`
implementa TOTP (RFC 6238) direto com `node:crypto` — HMAC-SHA1, período de 30s, 6 dígitos.
Coberto por um teste unitário que recalcula o código de forma independente (implementação
própria no teste) como conferência cruzada do HMAC/offset/truncamento.

- **Habilitar**: `GET /settings/two-factor` gera um secret pendente (guardado só na
  sessão, ainda não persistido) e mostra um QR code (`otpauth://` renderizado via
  `qrcode`) + o secret em texto para digitação manual. `POST /settings/two-factor`
  confirma com um código de 6 dígitos; se válido, o secret e 8 códigos de recuperação são
  **criptografados** (`@adonisjs/core/services/encryption`, não hasheados — precisam ser
  lidos de volta para verificar códigos futuros) e gravados em `users`
  (`two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`). Os
  códigos de recuperação são mostrados uma única vez, na resposta da própria confirmação.
- **Login com 2FA ativo**: `SessionController.store` detecta `twoFactorConfirmedAt` e, em
  vez de logar o usuário, guarda o id dele na sessão (`two_factor_user_id`) e redireciona
  para `GET /two-factor/challenge`. `POST /two-factor/challenge` aceita um código TOTP ou
  um código de recuperação (que é consumido/removido ao ser usado) e só então efetiva o
  login.
- **Desabilitar**: `DELETE /settings/two-factor` limpa as três colunas.
- **Serialização**: `database/schema_rules.ts` marca `two_factor_secret` e
  `two_factor_recovery_codes` com `serializeAs: null` no model auto-gerado — o mesmo
  tratamento que a coluna `password` já recebe por padrão do Lucid — para que esses
  campos nunca vazem em JSON/Inertia mesmo que alguém esqueça de usar um transformer.
  Isso exigiu registrar `schemaGeneration.rulesPaths` em `config/database.ts` (em cada
  conexão), já que esse arquivo de regras existe no starter kit mas não vem conectado por
  padrão.

## Login social (Google/GitHub)

Via `@adonisjs/ally`. `GET /oauth/:provider/redirect` envia o navegador para o provedor;
`GET /oauth/:provider/callback` recebe a volta, busca o usuário autenticado no provedor
(`ally.use(provider).user()`) e:

- Se já existe um usuário com aquele email, faz login nele (conta social e conta por
  senha com o mesmo email são tratadas como a mesma pessoa — simplificação deliberada
  para este projeto de referência; um app real provavelmente guardaria
  `provider`/`provider_id` para permitir múltiplos providers por conta com segurança).
- Senão, cria um novo usuário com esse email e uma senha aleatória de 32 bytes que a
  pessoa nunca usa (a coluna `password` é `NOT NULL`; login social nunca passa por
  `verifyCredentials`, só por `auth.use('web').login(user)` diretamente).
- Se o provedor não retorna email público, ou o usuário nega acesso, ou o `state` do OAuth
  não bate, redireciona para o login com uma mensagem de erro.

`config/ally.ts` já está configurado para `google` e `github`; falta apenas preencher
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` no
`.env` com credenciais reais (ver comentários em `.env.example` com os links para criar os
OAuth apps e a callback URL exata que cada um espera). Sem essas credenciais, os botões
"Continue with Google/GitHub" redirecionam corretamente até o provedor, mas a autenticação
em si falha — isso é uma pendência explícita que só o usuário pode resolver (ver
`TODO.md`).

## Autorização

Cada usuário só acessa seus próprios todos, reforçado por `TodoPolicy`
(`app/policies/todo_policy.ts`) via Bouncer (`@adonisjs/bouncer`):

```ts
await bouncer.with(TodoPolicy).authorize('update', todo)
```

Uma tentativa de editar/excluir o todo de outro usuário lança `E_AUTHORIZATION_FAILURE`. Na
camada web isso redireciona de volta com uma mensagem de erro (flash, exibida como toast);
na API sempre retorna `403` em JSON (ver a nota sobre `app/exceptions/handler.ts` em
`docs/testing.md`).
