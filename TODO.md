# Faça

- [x] 1 - Existe um 'detalhe/erro/bug' na redenrização do front-end em 2 cenários:
  - [x] a. Logo após eu faço social login -> a tela principal do /dashboard fica menor, sem navbar como visto no print;
  - [x] b. Logo após eu filtro algum todo -> a tela principal do /dashboard fica menor, sem navbar como visto no print novamente também;

  > Corrigido em `inertia/layouts/default.tsx` (matcher de rota comparava a URL completa em vez do
  > pathname, então qualquer query string — OAuth callback ou filtro — quebrava a detecção de rota)
  > e `app/controllers/social_auths_controller.ts` (`withQs(false)` para não repassar a query string
  > do provedor OAuth pro redirect de `/dashboard`). Ver CHANGELOG.md.

- [x] 2 - Nos scripts shell .sh dentro de setups/, altere o script de forma que eu consiga ver os logs
      que estão acontecendo depois de subir a aplicação -> atualmente, abre um git bash aqui no meu
      windows 11 e logo depois fecha, eu não consigo ver os logs no terminal para debugar a aplicação
      se acontecer algum problema. Corrija esse problema.

  > Corrigido nos 6 scripts em `setups/`: cada um agora pausa com "Press any key to close" ao sair
  > (sucesso ou erro) e termina rodando `npm run dev` em foreground.

---

- [x] 1 - Novo problema no contexto do oauth social login & sqlite em produção: `SQLITE_CANTOPEN: unable to open database file`.

  > Causa raiz: `tmp/` (onde mora o `db.sqlite3`) nunca ia para o build de produção — Galaxy Cloud
  > builda com `node ace build` direto, sem passar pelo `infra/Dockerfile` (o único lugar que criava
  > o diretório). Corrigido em `adonisrc.ts` (metaFiles) e `config/database.ts` (`mkdirSync`
  > defensivo). Ver `docs/deployment.md#galaxy-cloud` e CHANGELOG.md.

- [x] 2 - Mantenha o padrão dos title e descrições dos todos SEMPRE para salvar em UPPERCASE -> o
      frontend deve formatar enquanto usuário digita para ficar em UPPERCASE TAMBÉM; O filtro deve se
      atentar a isso também.

  > Feito: uppercase forçado no frontend (`todo_dialog.tsx`) e garantido no backend (validator +
  > hook `@beforeSave` no model `Todo`); busca do filtro compara em uppercase (`todo_service.ts`).

- [x] 3 - No /dashboard:
  - [x] a. Retire o botão de 3 pontinhos '...' e coloque 2 ícones na mesma linha na extrema direita: um pencil (editar) e uma lixeira (exluir);
  - [x] b. Na ação de excluir todo, abra um modal para o usuário confirmar exclusão -> não exclua de uma vez sem confirmar antes;
  - [x] c. Diminua width do botão do filtro de categoria e aumente ambos os botões dos filtros de calendário;
  - [x] d. Adicione a categoria de todo 'Other' e faça no modal de criar todo, alguma categoria ser selecionada como obrigatório para criar o todo;

- [x] 4 - Fluxo completo: Pagamentos com Stripe
  - Crie um fluxo completo para que essa aplicação seja um micro-saas, seguindo os requisitos:
  - [x] a. Ter 2 planos: Mensal $2.99 e anual $ 29.90
  - [x] b. Configurar e pedir todas as credenciais do stripe para você mesmo configurar tudo: cli, webhooks, secrets, plans, ci/cd, etc
  - [x] c. O usuário só pode criar 10 todos grátis -> após esse uso, ele deve ter algum plano pago da stripe;
  - [x] d. Coloque um formulário no perfil do usuário para ele poder informações do seu plano atual e um botão para gerenciar sua assinatura direto la na stripe, quando tiver plano ativo;
  - [x] e. O fluxo deve criar o customer la na stripe e salvar todas as principais informações da stripe do banco de dados também (customerId, logs de transações de pagamentos, etc)
  - [x] f. Crie uma nova página chamada /checkout para o usuário ver os 2 cards dos planos (se usuário já tiver plano ativo, ele não pode mais acessar essa página /checkout)
  - [x] g. O fluxo atual será todo em sandbox, então não tem problemas testar todo o fluxo você mesmo;

  > Código completo em `app/services/stripe_service.ts`, `app/controllers/checkout_controller.ts`,
  > `app/controllers/billing_portal_controller.ts`, `app/controllers/stripe_webhooks_controller.ts`,
  > `app/policies/todo_policy.ts` (limite de 10 todos grátis), migrations de `users`/
  > `payment_transactions`. Testes cobrindo o gate do limite grátis, redirect de `/checkout` para
  > assinantes, e rejeição de webhook sem assinatura válida.
  >
  > Credenciais configuradas de ponta a ponta via Stripe MCP + Stripe CLI (instalado via winget):
  > Product "Pro" com as 2 Prices (mensal/anual) criados via API, webhook secret via
  > `stripe listen`. A API key em si precisou ser criada manualmente no Dashboard (a Stripe não
  > expõe criação/leitura de chaves via API, por segurança) — único passo que não deu pra
  > automatizar. Fluxo completo testado de ponta a ponta em sandbox real (checkout session →
  > customer criado e persistido → assinatura real via API de teste → webhook real assinado
  > processado pelo app rodando → `subscriptionStatus`/`plan`/`currentPeriodEnd` sincronizados →
  > transação logada em `payment_transactions` → billing portal → cancelamento → webhook de
  > cancelamento sincronizado corretamente). Ver `docs/billing.md`.

- [x] 5 - Melhore O README.md, como se fosse um projeto open source:
  - [x] a. Colocar nome da aplicação 'AdonisJS v7 ClaudeCode ToDo MicroSaaS' centralizado no meio;
  - [x] b. Colocar os checks de status lá famoso em outros repo;
  - [x] c. Colocar uma introdução sobre esse projeto: (Algo como 'projeto criado com o intuito de aprender o framework adonisjs, junto com inertia com o código 99% feito por claude code...')
  - [x] d. Tech stack desse projeto e ferramentas usadas como stripe e galaxy cloud;
  - [x] e. Uma seção para setup de desenvolvimento -> linka para os arquivos dentro de setups/
  - [x] f. Uma seção sobre documentações -> linka para os arquivos dentro de docs/
  - [x] g. Créditos finais e MIT LICENSE (adicione esse arquivo na raiz também)
  - [x] h. Aproveite e adicione o arquivo CONTRIBUTE.md na raiz desse projeto e linke no README.md também
