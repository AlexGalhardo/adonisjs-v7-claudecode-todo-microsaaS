# Autenticação e autorização

## Autenticação

- Guard `web` (sessão) para a camada Inertia — cadastro (`NewAccountController`), login e
  logout (`SessionController`). Senhas com hash via `withAuthFinder` (hasher padrão do
  AdonisJS).
- Guard `api` (access tokens, `@adonisjs/auth`) para a API REST — ver `docs/api.md`.
- Recuperação de senha (abaixo). Magic link, 2FA e login social (Google/GitHub) ainda estão
  na Fase 4 do `TODO.md`.

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
- Emails são enviados via `@adonisjs/mail` (SMTP). Em desenvolvimento, aponte `SMTP_HOST`/
  `SMTP_PORT` para o Mailpit do `infra/docker-compose.yml` (Fase 7) para ver os emails numa
  caixa de entrada local; nos testes, `mail.fake()` intercepta o envio sem precisar de
  nenhum servidor SMTP real.

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
