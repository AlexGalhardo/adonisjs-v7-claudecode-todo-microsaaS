# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Fixed

- Login social (Google/GitHub) retornava HTTP 500 no callback sem nenhum diagnóstico: erros de
  `provider.user()` (rede, credenciais OAuth ausentes/erradas no ambiente, mudança de resposta da
  API do provedor) agora são capturados, logados no servidor e o usuário é redirecionado ao login
  com uma mensagem amigável em vez de uma tela de erro crua.
- Select de "Subject" na página `/contact` ficava com texto branco em fundo branco no dark theme —
  agora usa cores explícitas (fundo branco, texto preto) independente do tema.
- Modal de criar/editar todo e o menu de ações (Edit/Delete) do item de todo ficavam ilegíveis
  (texto branco em fundo branco) em dark theme.
- Botões da aplicação (variant `primary`/`secondary`) em dark theme agora usam fundo branco/texto
  preto no estado normal e uma cor de destaque com texto branco no hover, em vez de herdar tokens
  de tema que colidiam (texto branco sobre fundo quase branco).
- Qualquer rota inexistente (ex.: `/aposkpas`) redireciona para `/` em vez de mostrar uma página
  de erro 404.

### Added

- Todo: campos `category` (enum fixo) e `dueDate` (data), título com 4–24 caracteres, descrição
  agora opcional (alternável via select) com 4–128 caracteres quando preenchida.
- Dashboard: filtros de busca (título/descrição, categoria, intervalo de datas) e paginação
  (10 itens por página).
- Seed do usuário `admin@gmail.com`: 32 todos gerados aleatoriamente (categorias/datas variadas)
  para testar filtros e paginação.
- Checklist de requisitos de senha (com check/x) abaixo do campo de senha no signup.
- Efeitos de hover nos botões de login/signup social (Google/GitHub) e nos botões de
  login/signup principais.
- Links "Don't have an account yet? Create account" (login) e "Already have an account? Login"
  (signup).
- Navbar: nome do usuário logado ao lado do ícone de perfil; dropdown ganhou links de Contact,
  Terms of Use e Privacy Policy (com ícones), separados do Logout por um `<hr/>`.
- Husky: hooks `pre-commit` (`biome check --staged`), `pre-push` (typecheck + build + testes) e
  `commit-msg` (valida Conventional Commits).

### Changed

- Gestão de 2FA saiu da página dedicada `/settings/two-factor` e virou um modal em `/profile`
  ("Manage"); os endpoints correspondentes agora respondem em JSON (consumidos via `fetch` pelo
  modal) em vez de renderizar uma página Inertia.
- Removido o campo "Confirm password" do formulário de signup (mantido em reset de senha e troca
  de senha no perfil, onde o fluxo é diferente).

### Removed

- Página `/settings/two-factor` (`inertia/pages/settings/two_factor.tsx`).
- Página de erro `errors/not_found` (não é mais renderizada — 404 de rota agora redireciona).
