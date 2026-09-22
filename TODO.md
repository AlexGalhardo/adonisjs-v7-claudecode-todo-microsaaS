# Faça

IMPORTANTE: 
- Atualize toda a interface da aplicação para ficar em ingles -> crie essa regra no claude.md para os agentes sempre lembrarem;
- Toda a lógica de endpoints, urls, etc devem ficar em inglês;
- Usuários autenticados na aplicação não podem conseguir as páginas de login, signup, forget-password, reset-password e landing page -> devem ser redirecionados para o /app;
- A fonte geral da aplicação deve ser: JetBrains Mono
- Adicione na pasta skills dessa aplicação as skills e use elas quando necessário:
    - https://www.skills.sh/anthropics/skills/frontend-design
    - https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines
    - https://www.skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
    - https://www.skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max
    - https://www.skills.sh/leonxlnx/taste-skill/minimalist-ui

## ANTES DE COMEÇAR AS TAREFAS
- Crie um arquivo chamado PLAN.md na raiz desse projeto e coloque todos as tarefas com o [x] checklist de cada item que tu vai fazer para você não perder o contexto e para futuras sessões se necessário;
- Não se esqueça de usar as melhores práticas de git commit, semver, etc;
- A cada finalização de tarefa, faça o commit e pode fazer o push direto para a master também para guardar o resultado;

## Bug Deploy

1 - Corrija esse problema de deploy no [galaxy cloud](https://galaxycloud.app/) usando sqlite dentro do contexto do Docker:

```
17:13:31.443ERROR: failed to build: failed to solve: process "/bin/sh -c npm i" did not complete successfully: exit code: 117:13:31.457✗ Build failed: Docker build failed: #0 building with "default" instance using docker driver
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 582B done
#1 DONE 0.0s
#2 [internal] load metadata for docker.io/meteor/galaxy-node:24.13.0
#2 DONE 0.1s
#3 [internal] load .dockerignore
#3 transferring context: 108B done
#3 DONE 0.0s
#4 [base 1/1] FROM docker.io/meteor/galaxy-node:24.13.0@sha256:17e97d77cf88f942e6f0f214ef4dfaff695d96c717d6799888f253574d078d25
#4 DONE 0.0s
#5 [deps 1/4] WORKDIR /app
#5 CACHED
#6 [internal] load build context
#6 transferring context: 711.43kB 0.0s done
#6 DONE 0.0s
#7 [deps 2/4] ADD package.json package-lock.json ./
#7 DONE 0.1s
#8 [deps 3/4] ADD .npmrc ./
#8 DONE 0.0s
#9 [deps 4/4] RUN npm i
#9 7.252 npm error code 1
#9 7.252 npm error path /app/node_modules/better-sqlite3
#9 7.252 npm error command failed
#9 7.252 npm error command sh -c node-gyp rebuild
#9 7.256 npm error gyp info it worked if it ends with ok
#9 7.256 npm error gyp info using node-gyp@11.4.2
#9 7.256 npm error gyp info using node@24.13.0 | linux | x64
#9 7.256 npm error gyp ERR! find Python 
#9 7.256 npm error gyp ERR! find Python Python is not set from command line or npm configuration
#9 7.256 npm error gyp ERR! find Python Python is not set from environment variable PYTHON
#9 7.256 npm error gyp ERR! find Python checking if "python3" can be used
#9 7.256 npm error gyp ERR! find Python - executable path is ""
#9 7.256 npm error gyp ERR! find Python - "" could not be run
#9 7.256 npm error gyp ERR! find Python checking if "python" can be used
#9 7.256 npm error gyp ERR! find Python - executable path is ""
#9 7.256 npm error gyp ERR! find Python - "" could not be run
#9 7.256 npm error gyp ERR! find Python 
#9 7.256 npm error gyp ERR! find Python **********************************************************
#9 7.256 npm error gyp ERR! find Python You need to install the latest version of Python.
#9 7.256 npm error gyp ERR! find Python Node-gyp should be able to find and use Python. If not,
#9 7.256 npm error gyp ERR! find Python you can try one of the following options:
#9 7.256 npm error gyp ERR! find Python - Use the switch --python="/path/to/pythonexecutable"
#9 7.256 npm error gyp ERR! find Python (accepted by both node-gyp and npm)
#9 7.256 npm error gyp ERR! find Python - Set the environment variable PYTHON
#9 7.256 npm error gyp ERR! find Python - Set the npm configuration variable python:
#9 7.256 npm error gyp ERR! find Python npm config set python "/path/to/pythonexecutable"
#9 7.256 npm error gyp ERR! find Python For more information consult the documentation at:
#9 7.256 npm error gyp ERR! find Python https://github.com/nodejs/node-gyp#installation
#9 7.256 npm error gyp ERR! find Python **********************************************************
#9 7.256 npm error gyp ERR! find Python 
#9 7.256 npm error gyp ERR! configure error 
#9 7.256 npm error gyp ERR! stack Error: Could not find any Python installation to use
#9 7.256 npm error gyp ERR! stack at PythonFinder.fail (/usr/local/lib/node_modules/npm/node_modules/node-gyp/lib/find-python.js:306:11)
#9 7.256 npm error gyp ERR! stack at PythonFinder.findPython (/usr/local/lib/node_modules/npm/node_modules/node-gyp/lib/find-python.js:164:17)
#9 7.256 npm error gyp ERR! stack at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
#9 7.256 npm error gyp ERR! stack at async configure (/usr/local/lib/node_modules/npm/node_modules/node-gyp/lib/configure.js:27:18)
#9 7.256 npm error gyp ERR! stack at async run (/usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js:81:18)
#9 7.256 npm error gyp ERR! System Linux 6.8.0-90-generic
#9 7.256 npm error gyp ERR! command "/usr/local/bin/node" "/usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
#9 7.256 npm error gyp ERR! cwd /app/node_modules/better-sqlite3
#9 7.256 npm error gyp ERR! node -v v24.13.0
#9 7.256 npm error gyp ERR! node-gyp -v v11.4.2
#9 7.256 npm error gyp ERR! not ok
#9 7.257 npm notice
#9 7.257 npm notice New minor version of npm available! 11.6.2 -> 11.19.1
#9 7.257 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.19.1
#9 7.257 npm notice To update run: npm install -g npm@11.19.1
#9 7.257 npm notice
#9 7.258 npm error A complete log of this run can be found in: /root/.npm/_logs/2026-09-22T20_13_24_203Z-debug-0.log
#9 ERROR: process "/bin/sh -c npm i" did not complete successfully: exit code: 1
------
 > [deps 4/4] RUN npm i:
7.256 npm error gyp ERR! cwd /app/node_modules/better-sqlite3
7.256 npm error gyp ERR! node -v v24.13.0
7.256 npm error gyp ERR! node-gyp -v v11.4.2
7.256 npm error gyp ERR! not ok
7.257 npm notice
7.257 npm notice New minor version of npm available! 11.6.2 -> 11.19.1
7.257 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.19.1
7.257 npm notice To update run: npm install -g npm@11.19.1
7.257 npm notice
7.258 npm error A complete log of this run can be found in: /root/.npm/_logs/2026-09-22T20_13_24_203Z-debug-0.log
------
Dockerfile:8
--------------------
   6 |     ADD package.json package-lock.json ./
   7 |       ADD .npmrc ./
   8 | >>>   RUN npm i
   9 |     
  10 |     FROM base AS production-deps
--------------------
Dockerfile:15
--------------------
  13 |       ADD .npmrc ./
  14 |     
  15 | >>>     RUN npm i
  16 |     
  17 |     FROM base AS build
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c npm i" did not complete successfully: exit code: 1
```

2 - Envio de Emails

- Retire a lógica de SMTP no envio de emails, e use o Resend no lugar com essas .envs aqui que já estão setadas:

```bash
RESEND_API_KEY=re_WJUSU4P6_HqVZNAK4gQPo9hmSdbcNqPwu
MAIL_FROM_ADDRESS=onboarding@resend.dev
MAIL_FROM_NAME=Todo
```
- Use o https://react.email/ em todos os emails enviados nessa aplicação

3 - Interface web para ver dados do banco de dados

Siga essa solução que o claude me recomendou para ver os dados em uma interface web:

- Usar o Drizzle Studio só como visualizador (o mais parecido com o que você quer)

Você não troca o Lucid por nada. Instala o drizzle-kit apenas como dependência de desenvolvimento, aponta para o mesmo banco e usa só o Studio.

bash
npm i -D drizzle-kit drizzle-orm

Crie um drizzle.config.ts na raiz. Exemplo para PostgreSQL:

ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})

Para SQLite, troque por dialect: 'sqlite' e dbCredentials: { url: './tmp/db.sqlite3' }, usando o caminho que está no seu config/database.ts.

Depois rode:

bash
npx drizzle-kit pull    # lê o banco e gera um schema na pasta ./drizzle
npx drizzle-kit studio  # abre a interface web

As migrations continuam sendo do Lucid (node ace migration:run). Sempre que mudar o banco, rode o pull de novo para o Studio enxergar as tabelas novas. Coloque a pasta ./drizzle no .gitignore se não quiser versioná-la.


4 - Na página de /login:

- Coloque aquele ícone de olho no input de senha para o usuário poder ver ou não sua senha digitada
- O input da senha ter no mínimo 8 characteres e no máximo 32 characteres
- Retire a navbar dessa página e adicione apenas O título da página centralizado em cima do formulario para o usuário ir para a landing page;
- Mantenha essa página em modo dark theme padrão;

5 - Na página /signup:

- O input de full name deve começar cada inicio de nome com letra maiuscula UPPERCASE -> Exemplo: alex galhardo -> Alex Galhardo
- O input de full name deve ter no mínimo 4 characteres e no máximo 24 characters;
- Coloque aquele ícone de olho no input de senha para o usuário poder ver ou não sua senha digitada
- A senha do usuário deve ter no mínimo 8 characteres e no máximo 32 characteres, seguindo as regras: pelo menos 1 letra UPPERCASE, 1 letra lowercase, pelo menos 1 número, e pelo menos 1 character especial;
- Mude os textos dos buttons de criar conta do github e google para -> Create Account with GitHub/Google e coloque o ícone de cada no inicio do texto;
- Retire a navbar dessa página e adicione apenas O título da página centralizado em cima do formulario para o usuário ir para a landing page;
- Mantenha essa página em modo dark theme padrão;




6 - Na página /forget-password:
- Retire a navbar dessa página e adicione apenas O título da página centralizado em cima do formulario para o usuário ir para a landing page;
- Mantenha essa página em modo dark theme padrão;

7 - Na página landing page index /:
- Retire o botão 'começar agora'
- Melhore a interface da landing page para ficar com viewport (usuário não consegue dar scroll) com efeito de 'matrix' no fundo caindo os números 1 e 0, em modo dark theme padrão;
- Crie um titulo atraente no grid da esquerda (metade da página) e na direita deixe uma imagem placeholder (vou colocar um gif depois da aplicação funcionando)
- Estilize os botões de Signup com cor verde 'matrix' de terminal com efeito de hover e o de login em cor branca com efeito de hover também;
- No footer, na esquerda deixe os 'Todos os direitos reservados' e na direita deixe os 3 links em ordem: Contact, Terms Of Use, e Privacy Policy

8 - Página de contato /contact:
- Crie essa página com 3 inputs:
    - Full name (se usuário já autenticado, deixar pré-preenchido, com input disabled mas que pode ser enviado no envio da mensagem)
    - Email (se usuário já autenticado, deixar pré-preenchido, com input disabled mas que pode ser enviado no envio da mensagem)
    - Select para escolher assunto: Bug/Problema técnico, sugestão ou dúvida, Outros assuntos
    - TextArea com 7 rows (usuário tem que digitar no mínimo 32 characteres e no máximo 512 characteres) -> coloque um [x]/512 characteres cound para o usuário ver quanto ele pode digitar ainda;
    - Botão com hover na cor verde matrix

9 - Na página /todos:
- Mude o caminho dessa página para ficar como -> /dashboard;
- Coloque na navbar apenas o título da aplicação na extrema esquerda e na extrema direita deixe apenas o icone de usuário com um dropdown com 3 botões: Profile, API, Toggle light/dark theme e logout

10 - Página de /profile/api:
- Crie essa página para o usuário ver a documentação da API rest para que ele possa usar os endpoints;
- Essa página deve gerar os token de api do usuário;
- Use a lib clipboardjs para copiar essas tokens, urls, códigos exemplo etc (não se esqueça do toast avisando que foi copiado);
- Use a lib @scalar/api-reference-react para criar essa documentação
- Não se esqueça de colocar exemplos práticos usando cURL e javascript com fetch nativo usando essas API REST;

11 - Página de profile /profile:
- Crie essa página de profile para o usuário poder editar seu nome
- Input de email com email prépreenchido disabled (usuário naõ pode mudar email)
- Formulário para usuário poder trocar sua senha
- Botão para usuário poder excluir sua conta (abrir modal com coldown de 10 segundos mostrando na tela, informando que o usuário pode relogar em sua conta em até 30 dias antes de exclusão permanente)
- Formulário sobre informações de 2FA

12 - BiomeJS v2
- Retire o lint e o format padrão do adonisjs e coloque o biomejs v2 no lugar para corrigir problemas de linter e formatação

13 - Hooks Git usando Husky
- Adicione o husky na aplicação e crie os arquivos pre-commit e pre-push e verifique quando necessário detalhes de formater, linter, build, testes, commit semantic, semver, etc

14 - CI/CD Github integrado com o https://galaxycloud.app/ usando GitHub Actions:
- Crie todo o fluxo necessário para eu fazer deploy dessa aplicação com ci/cd integrado com o github actions na galaxy cloud;
- Peça todas as permissões e configurações necessárias no chat se precisar para você poder fazer tudo isso sozinho;
- Não se esqueça de criar a documentação no docs/ e skill necessário se considerar útil
