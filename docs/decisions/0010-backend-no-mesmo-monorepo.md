# 0010 — Backend no mesmo monorepo

## Contexto

O projeto já é um monorepo (`apps/game`, `apps/docs`, `packages/luv-ui`) e adota DDD como arquitetura principal ([[0009-ddd-como-arquitetura-principal]]). Era necessário decidir onde o backend do jogo seria implementado.

## Decisão

O backend será implementado no mesmo monorepo do frontend, e não em um repositório separado.

## Justificativa

Com DDD já adotado como arquitetura principal, a camada `domain` de cada bounded context pode ser compartilhada entre frontend e backend sem duplicar regras de negócio e tipos. Manter tudo em um único monorepo simplifica esse compartilhamento.

## Consequências

- Build, testes e CI passam a rodar por workspace (não todo o monorepo de uma vez), para não acoplar o ciclo de deploy do backend ao do frontend.
- A camada `domain` de cada bounded context deve poder ser reaproveitada entre frontend e backend, evitando duplicação de regras de negócio.
- A estrutura exata do backend (nome do app/pacote, se a camada `domain` fica em um pacote compartilhado ou dentro de cada app) ainda não foi definida — **Pendente**.

## Referências

- [[0009-ddd-como-arquitetura-principal]]
- [[../technical/architecture]]
- [[../technical/tech-stack]]
