# Autenticação e autorização

> Cadastro/login/logout por email e senha e autorização por usuário já implementados (Fases
> 0 e 3). Login social, magic link, 2FA e recuperação de senha chegam na Fase 4 do
> `TODO.md`.

## Autenticação (atual)

- Guard `web` (sessão) para a camada Inertia — cadastro (`NewAccountController`), login e
  logout (`SessionController`). Senhas com hash via `withAuthFinder` (hasher padrão do
  AdonisJS).
- Guard `api` (access tokens, `@adonisjs/auth`) para a API REST — ver `docs/api.md`.

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
