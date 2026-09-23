# Pagamentos (Stripe)

## Visão geral

Micro-SaaS: 10 todos grátis por usuário (`stripeConfig.freeTodoLimit`, `config/stripe.ts`);
depois disso, criar um todo exige assinatura ativa. Um único plano ("Pro"), duas variantes de
cobrança — mensal ($2.99) e anual ($29.90) — como duas Prices do mesmo Product na Stripe (não
dois Products separados; ver "Traps to avoid" na skill `stripe-best-practices`).

Frontend de pagamento: Stripe Checkout (hosted, `mode: 'subscription'`) — nunca coleta dados
de cartão diretamente. Gestão da assinatura (trocar cartão, cancelar, ver faturas): Stripe
Customer Portal, também hosted.

## Arquitetura

- `config/stripe.ts` — config estático (chaves, price ids, `freeTodoLimit`), sem depender do
  pacote `stripe`. Tudo `optional()` em `start/env.ts`: a app sobe normalmente sem Stripe
  configurado (mesmo padrão do Google/GitHub OAuth) — `/checkout` e a seção de billing do
  perfil só mostram "not configured".
- `app/services/stripe_service.ts` — único lugar que instancia o SDK (`new Stripe(secretKey)`,
  nunca o padrão global deprecated `Stripe.setApiKey`). Métodos: criar/reaproveitar customer,
  criar Checkout Session, criar Billing Portal Session, verificar assinatura de webhook,
  sincronizar o estado da assinatura no `User`, logar transação em `payment_transactions`.
- `app/policies/todo_policy.ts` — `create(user)` nega (com mensagem, via
  `AuthorizationResponse.deny`) quando o usuário está no plano grátis e já tem
  `freeTodoLimit` todos. Assinantes (`active`/`trialing`) pulam a contagem.
- `app/controllers/checkout_controller.ts` — `/checkout` (mostra os 2 planos; redireciona pra
  `/profile` se já tem assinatura ativa), `POST /checkout/:plan` (cria a Checkout Session e
  redireciona via `inertia.location`, já que é uma URL externa `checkout.stripe.com`).
- `app/controllers/billing_portal_controller.ts` — `POST /billing/portal`, mesmo padrão de
  redirect externo.
- `app/controllers/stripe_webhooks_controller.ts` — `POST /webhooks/stripe`, público (sem
  auth, sem CSRF — excluído em `config/shield.ts` — autenticado pela própria assinatura do
  webhook). Único lugar que muda `subscriptionStatus`/`subscriptionPlan`/`currentPeriodEnd`
  no `User`.

## Por que o webhook, nunca a success page

A página de sucesso do Checkout (`/checkout/success`) só flasheia uma mensagem e redireciona —
ela **nunca** ativa a assinatura. O navegador pode fechar a aba, cair a rede, etc. antes de
chegar lá, e trocas de plano/cancelamento/falha de pagamento acontecem depois, de forma
assíncrona, sem o usuário estar navegando a aplicação. Por isso a fonte de verdade é sempre o
webhook:

- `checkout.session.completed` / `checkout.session.async_payment_succeeded` (gated em
  `payment_status !== 'unpaid'`) — busca o usuário (`client_reference_id` ou customer id),
  busca a subscription completa e sincroniza.
- `customer.subscription.created` / `customer.subscription.updated` /
  `customer.subscription.deleted` — sincroniza o estado (cobre upgrade/downgrade,
  cancelamento, `past_due`, etc. — `created` cobre qualquer assinatura que venha a existir
  fora do fluxo de Checkout).
- `invoice.paid` / `invoice.payment_failed` — só loga a transação em `payment_transactions`
  (idempotente por `stripeEventId`, já que a Stripe reenvia entregas que não respondem 2xx).

## Setup (credenciais necessárias)

Tudo em modo sandbox/test primeiro. Preencha em `.env` (nunca commitado — ver `.gitignore`):

```
STRIPE_SECRET_KEY=sk_test_...      # ou rk_test_... (restricted key, recomendado)
STRIPE_PUBLISHABLE_KEY=pk_test_...  # não é usado pelo backend hoje (Checkout é hosted), mas
                                     # documentado para uma futura integração com Stripe.js
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
```

1. **Conta/sandbox**: `stripe login` (CLI) ou `stripe sandbox create` para um ambiente de
   teste sem precisar de conta prévia. Se você tem mais de uma conta/sandbox Stripe, confira
   qual está ativa com `stripe login list` / `stripe switch <account_id>` — **Product, Prices,
   webhook e a API key precisam todos ser da mesma conta**, ou o Checkout falha com
   `No such price: ...` mesmo o preço existindo (só que em outra conta).
2. **Product + 2 Prices**: um Product ("Pro"), duas Prices recorrentes nele — mensal
   ($2.99/mês) e anual ($29.90/ano). Copie os dois `price_...` ids.
3. **Webhook local**: `stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed --forward-to localhost:3333/webhooks/stripe`
   — imprime o `whsec_...` a usar em dev (a partir da v1.51 do CLI, `--events` é obrigatório).
   Em produção, cadastre o endpoint `https://<seu-dominio>/webhooks/stripe` no Dashboard e
   assine os mesmos eventos.
4. **Chave da API**: prefira uma Restricted Key (`rk_test_...`) com permissão só no que é
   usado — Write em Customers, Checkout Sessions, Billing Portal (Customer Portal),
   Subscriptions e Webhook Endpoints; Read em Products, Prices e Invoices — em vez da Secret
   Key completa. A criação da key em si só pode ser feita pelo Dashboard
   (`dashboard.stripe.com/test/apikeys`) — a Stripe não expõe criação nem leitura de chaves
   via API, por segurança, então esse é o único passo do setup que não dá pra automatizar via
   CLI/MCP.

## Testando o fluxo (sandbox)

Com as credenciais acima em `.env`, cartão de teste `4242 4242 4242 4242`, qualquer data
futura e CVC — ver skill `stripe:test-cards` para outros cenários (recusado, exige 3DS, etc.).

Fluxo verificado de ponta a ponta (checkout session → customer criado e persistido →
assinatura ativa → webhook real assinado processado pelo app → `subscriptionStatus`/
`subscriptionPlan`/`currentPeriodEnd` sincronizados → transação logada em
`payment_transactions` → sessão do billing portal → cancelamento → webhook de cancelamento
sincronizado) usando o Stripe MCP (Product/Prices) e o Stripe CLI (`stripe listen`) direto
contra a sandbox real, sem precisar completar um Checkout pelo navegador — uma assinatura foi
criada via API com o cartão de teste universal (`pm_card_visa`), o que já é suficiente para
dar gatilho aos mesmos webhooks que um Checkout real dispara.
