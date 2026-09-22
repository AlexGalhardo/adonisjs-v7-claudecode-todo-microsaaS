# Arquitetura

## Visão geral

MVC estrito, seguindo exatamente o que o AdonisJS v7 impõe — nenhuma camada extra foi
inventada. Para cada domínio (hoje só `Todo`, mas o padrão se repete):

```
Requisição
  → Rota (start/routes.ts, nomeada automaticamente por convenção)
  → Middleware (auth/guest/bouncer/CSRF, registrados em start/kernel.ts)
  → Controller (fino: valida, chama o service, decide a resposta)
  → Validator (VineJS, app/validators/)
  → Service (regra de negócio, app/services/)
  → Model (Lucid, app/models/ — sempre uma subclasse da *Schema auto-gerada)
  → Policy (Bouncer, autorização, app/policies/)
  → Transformer (formata a saída para Inertia/JSON, app/transformers/)
```

Ver `.claude/skills/how-to-add-a-crud-resource.md` para o passo a passo completo de como
adicionar um novo recurso seguindo exatamente esse fluxo.

## Por que um model auto-gerado (`database/schema.ts`)

Convenção nova do AdonisJS v7: rodar `node ace migration:run` escaneia o schema real do
banco e gera `database/schema.ts` com uma classe `<Nome>Schema` por tabela — colunas,
tipos e decorators `@column` ficam sincronizados com a migration automaticamente, sem
escrever isso à mão duas vezes. O model de verdade (`app/models/todo.ts`, por exemplo)
estende essa classe gerada e só adiciona o que não dá para inferir do schema: relações
(`@belongsTo`/`@hasMany`) e getters. `database/schema_rules.ts` (conectado via
`config/database.ts` → `schemaGeneration.rulesPaths`) permite customizar como colunas
específicas são geradas — usado aqui para marcar `two_factor_secret` e
`two_factor_recovery_codes` como `serializeAs: null`, o mesmo tratamento que `password` já
recebe por padrão.

## Por que uma camada de serviço

Controllers ficam finos de propósito: validam a entrada, delegam a lógica para uma classe
de serviço (`TodoService`, `AuthTokenService`, `TwoFactorService`, `TotpService`) e decidem
a resposta (redirect, render, JSON). Isso mantém a lógica de negócio testável isoladamente
(testes unitários chamam o service direto, sem precisar de uma requisição HTTP) e
reutilizável entre a camada web e a API — `TodosController` (web) e `ApiTodosController`
ambos usam o mesmo `TodoService`.

Serviços que um controller resolve via injeção de dependência no construtor **precisam** do
decorator `@inject()` (`import { inject } from '@adonisjs/core'`) na classe do controller —
sem isso o container não consegue instanciá-lo (erro em tempo de execução, não de
compilação: `Cannot construct "[class X]" ... Did you forget to use @inject() decorator?`).

## Autenticação: dois guards, dois propósitos

- **`web`** (sessão, cookie) — usado por toda a camada Inertia. `SessionController`,
  `NewAccountController`, os fluxos de recuperação de senha/magic link/2FA/login social
  todos autenticam usando esse guard.
- **`api`** (access tokens, `Authorization: Bearer`) — usado só pela API REST em
  `/api/*`. Emitido via `POST /api/login`, revogado via `DELETE /api/logout`.

Os dois guards nunca se misturam numa mesma rota. `config/shield.ts` desliga CSRF para
`/api/*` (via uma função preditora — `exceptRoutes` só faz match exato de padrão de rota,
não aceita glob) já que tokens não dependem de cookie de sessão.

`app/exceptions/handler.ts` força `Accept: application/json` para qualquer rota `/api/*`
antes de delegar ao handler padrão — sem isso, exceções que "se auto-renderizam" (erro de
validação do VineJS, falha de autorização do Bouncer) escolhem HTML-com-redirect por
padrão (correto para a camada web, errado para uma API pura). Ver `docs/testing.md` para o
detalhe completo.

## Autorização

`TodoPolicy` (Bouncer) garante que cada usuário só acessa seus próprios todos —
reaproveitável em qualquer novo recurso do mesmo jeito (ver
`.claude/skills/how-to-add-a-crud-resource.md`).

## Banco de dados dual

Um único `config/database.ts` define as conexões `sqlite` e `pg` lado a lado; qual delas é
usada depende só de `DB_CONNECTION` no `.env`. Ver `docs/database.md` para os detalhes e a
validação prática (mesma migration rodando sem alteração nos dois drivers).

## Frontend

Inertia v3 + React 19 — sem API REST intermediária para a própria UI, cada página React
recebe suas props tipadas diretamente do controller (o tipo é inferido a partir da própria
assinatura de props do componente React, via `database/schema.ts`-style codegen em
`.adonisjs/server/pages.d.ts`; rodar `node ace codegen` depois de criar uma página nova ou
alterar suas props).

- **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-first via `@theme` em
  `inertia/css/app.css`) para todo o estilo utilitário.
- **Base UI** só onde o comportamento realmente precisa de um primitivo headless
  (`Dialog` para criar/editar todo, `Checkbox` para marcar concluído, `Menu` para as ações
  de cada item) — não foi usado em lugares onde um elemento nativo já resolve (inputs de
  texto, por exemplo), para não introduzir uma dependência sem necessidade real.
- Componentes simples e reutilizáveis (`Button`, `TextField`) ficam em
  `inertia/components/`; páginas ficam em `inertia/pages/<domínio>/`, uma pasta por
  domínio (`auth/`, `todos/`, `settings/`).

## Testes

Ver `docs/testing.md` para a estratégia completa (unit/functional/browser, isolamento de
banco e de rate limiting, gotchas encontrados testando rotas autenticadas). Filosofia
seguida em todo o projeto: nenhum recurso foi considerado "pronto" sem rodar de verdade —
migrations testadas contra os dois drivers reais, Docker buildado e executado de ponta a
ponta, os 6 scripts de setup rodados contra bancos reais, cada fluxo de autenticação
verificado tanto por teste automatizado quanto (quando fazia sentido, como QR code e login
social) por uma captura de tela real via Playwright.
