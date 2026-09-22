# Testes

## Suítes

Três suítes Japa (`adonisrc.ts` → `tests.suites`):

- `unit` (`tests/unit/`) — services, validators, helpers. Toca o banco (via factories) mas
  não faz requisições HTTP.
- `functional` (`tests/functional/`) — controllers via `@japa/api-client`, incluindo web
  (Inertia) e API (REST).
- `browser` (`tests/browser/`) — fluxos completos via `@japa/browser-client` (Playwright).

## Rodando os testes

```bash
# Uma vez por ambiente (ou após criar uma migration nova): aplica o schema no banco de teste
NODE_ENV=test node ace migration:run

node ace test            # todas as suítes
node ace test unit        # só unitários
node ace test functional   # só funcionais
node ace test browser       # só E2E (abre um Chromium headless via Playwright)
node ace test --tests="nome do teste"   # filtra por título
node ace test --groups="Todos web"       # filtra por grupo
```

`npm run test` é um atalho para `node ace test`.

## Isolamento do banco de testes

- `.env.test` fixa `DB_CONNECTION=sqlite`, então a suíte nunca depende de um Postgres
  rodando nem toca no banco de desenvolvimento.
- `config/database.ts` aponta o driver SQLite para `tmp/db_test.sqlite3` (via `app.inTest`)
  em vez de `tmp/db.sqlite3`.
- `tests/bootstrap.ts` envolve cada teste em uma transação global
  (`testUtils.db().wrapInGlobalTransaction()`) que é desfeita ao final — testes não
  precisam limpar dados manualmente e não interferem uns nos outros.

## Autenticando requisições em testes funcionais

```ts
// Camada web (guard "web", baseado em sessão) — precisa de CSRF para métodos mutantes
await client.post('/todos').loginAs(user).withCsrfToken().form({ title: 'Buy milk' })

// Camada API (guard "api", baseado em token) — sem CSRF, guard explícito
await client.post('/api/todos').withGuard('api').loginAs(user).json({ title: 'Buy milk' })
```

Duas pegadinhas encontradas ao escrever esses testes, documentadas aqui para não se repetir:

1. Por padrão o cliente HTTP de teste **segue redirects**, então `response.assertStatus(302)`
   após um `POST`/`PUT`/`DELETE` que redireciona vai falhar mostrando o status da página
   final (200) em vez do redirect em si. Encadeie `.redirects(0)` quando quiser inspecionar o
   redirect diretamente (`assertStatus(302)` + `header('location')`); use
   `response.assertRedirectsTo(path)` (sem `.redirects(0)`) quando só quiser confirmar o
   destino final, já que esse helper lê a cadeia de redirects seguida pelo cliente.
2. Exceções "auto-renderizáveis" do VineJS/Bouncer escolhem HTML-com-redirect ou JSON
   olhando o header `Accept` da requisição. Isso é ótimo para a camada web (Inertia recebe um
   redirect "back" com erro em flash), mas errado para uma API REST pura. Por isso
   `app/exceptions/handler.ts` força `Accept: application/json` para qualquer rota sob
   `/api/*` antes de delegar ao handler padrão — sem esse ajuste, um cliente de API que não
   envie `Accept: application/json` explicitamente receberia um redirect em vez de um `403`
   ou `422`.

## E2E

`tests/browser/todos_flow.spec.ts` cobre o fluxo completo pedido no DoD: cadastro → login
implícito → criar/marcar como concluído/editar/excluir um todo → logout.
