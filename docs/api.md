# API REST

## Autenticação

A API é autenticada via access tokens (guard `api` do `@adonisjs/auth`), independente da
sessão usada pela camada web (guard `web`). Fluxo:

```
POST /api/login
Body: { "email": "...", "password": "..." }
Resposta 200: { "type": "bearer", "token": "oat_...", "abilities": ["*"], ... }
```

Use o token retornado no header `Authorization: Bearer <token>` em todas as chamadas
seguintes.

```
POST /api/logout            (Authorization: Bearer <token>) -> 204, invalida o token atual
```

## Todos

Todas as rotas abaixo exigem `Authorization: Bearer <token>` e só operam sobre os todos do
usuário autenticado (reforçado por `TodoPolicy` via Bouncer — tentar acessar o todo de outro
usuário retorna `403`).

| Método | Rota              | Descrição                    |
| ------ | ----------------- | ----------------------------- |
| GET    | `/api/todos`      | Lista os todos do usuário     |
| POST   | `/api/todos`      | Cria um todo                  |
| GET    | `/api/todos/:id`  | Detalha um todo                |
| PUT    | `/api/todos/:id`  | Atualiza um todo (parcial)    |
| DELETE | `/api/todos/:id`  | Remove um todo                |

Contrato de request para criar/atualizar:

```json
{
  "title": "Buy milk",
  "description": "Whole milk, 2 liters",
  "completed": false
}
```

`title` é obrigatório ao criar (1–255 caracteres); todos os campos são opcionais ao
atualizar. Um payload inválido retorna `422` com o corpo `{ "errors": [...] }`.

Resposta de um todo serializado (`TodoTransformer`):

```json
{
  "data": {
    "id": 1,
    "title": "Buy milk",
    "description": "Whole milk, 2 liters",
    "completed": false,
    "createdAt": "2026-09-22T12:00:00.000Z",
    "updatedAt": "2026-09-22T12:00:00.000Z"
  }
}
```

`GET /api/todos` retorna `{ "data": [...] }` (array de todos). Erros de validação e de
autorização sempre retornam JSON nesta API — `app/exceptions/handler.ts` força o formato
JSON para qualquer rota sob `/api/*`, independente do header `Accept` enviado pelo cliente
(evita que exceções pensadas para a camada web — que redirecionam de volta com uma
mensagem "flash" — vazem para a API como um redirect/HTML).
