# Definition of Done — M01 Fundação & Personagem

Todos os itens abaixo já estão marcados — esta milestone está concluída. Fica registrado como referência do que "pronto" significou aqui.

**Nota**: personagem não tem mais alocação inicial de skills — nasce com nível 0 em tudo (ver [[../../decisions/0024-personagem-nasce-sem-skills]]). O item de "Personagem" abaixo foi atualizado pra refletir isso; o catálogo de skills em si continua com plano próprio em aberto (`planos/07-skills-catalogo-e-balanceamento.md`), sem bloquear o fechamento desta milestone.

## Infraestrutura

- [x] Monorepo com npm workspaces (`apps/*`, `packages/*`) funcionando com um único `npm install`.
- [x] `packages/luv-ui` publicando componentes + estilos (`luv-ui`, `luv-ui/styles.css`) consumidos por `apps/game` e `apps/docs`.
- [x] `packages/luv-icons` publicando ícones SVG consumidos via `LuvIcon` (`luv-ui`).
- [x] Backend em NestJS + MongoDB, organizado em DDD (domain/application/infrastructure/presentation por bounded context).

## Autenticação

- [x] Registro de conta por email/senha.
- [x] Login retorna JWT válido.
- [x] Rotas autenticadas rejeitam requisição sem token ou com token inválido/expirado.
- [x] Frontend guarda sessão e redireciona pra login quando expira.

## Personagem

- [x] Jogador cria personagem escolhendo nome, gênero, tom de pele, cabelo, olho — sem nenhuma escolha de skill (personagem nasce em nível 0).
- [x] Backend não aceita nenhum parâmetro de skill na criação (campo removido do DTO; qualquer valor enviado é descartado pelo `ValidationPipe`).
- [x] Jogador troca cada peça do guarda-roupa (corpo, rosto, cabelo, blusa, calça, sapato, sobreposição) com prévia ao vivo.
- [x] Seletor de peças mostra miniatura de cada opção, incluindo um indicador visual claro pro slot "remover peça" (sem quadrado vazio).
- [x] Jogador vê a lista dos seus personagens e seleciona um pra jogar.

## Motor de simulação (backend, sem UI ainda)

- [x] Personagem tem `activity`, `activityEndsAt` e `lastUpdatedAt` persistidos.
- [x] Endpoint `POST /characters/:id/activity` troca a atividade, fechando o efeito da anterior antes.
- [x] Recompute individual (lazy) e tick em lote (scheduler) ambos implementados e não conflitam entre si (condição de corrida tratada via `lastUpdatedAt`).
- [x] Atividades `idle`, `resting`, `working` com efeito por minuto sobre felicidade/energia/dinheiro.

## Qualidade

- [x] Cobertura 100% (statements/branches/functions/lines) em `apps/api`, `apps/game`, `apps/docs`, `packages/luv-ui`, `packages/luv-icons`.
- [x] `npm run build` limpo em todos os pacotes.
- [x] Decisões de arquitetura relevantes registradas em `docs/decisions/`.
