# 0012 — Testes automatizados: Vitest no frontend, Jest no backend

## Contexto

O monorepo tinha dois "lados" sem nenhuma infraestrutura de testes automatizados: o lado frontend (`apps/game`, `apps/docs`, `packages/luv-ui`, todos em Vite) e o backend (`apps/api`, em NestJS). Era necessário decidir a ferramenta de testes de cada lado antes de começar a escrever testes.

## Decisão

- **Frontend** (`apps/game`, `apps/docs`, `packages/luv-ui`): **Vitest**, reaproveitando a configuração do Vite já existente em cada pacote.
- **Backend** (`apps/api`): **Jest**, com um conjunto separado para testes unitários e para testes e2e (convenção padrão do NestJS).

## Justificativa

Vitest reaproveita a mesma configuração/transformação do Vite já usada por `apps/game`, `apps/docs` e `packages/luv-ui`, evitando manter um segundo pipeline de build (Babel/ts-jest) só para os testes do frontend. Jest é o padrão oficial e a integração mais madura com o NestJS (`@nestjs/testing`), incluindo suporte a testes e2e com `supertest`.

## Consequências

- Todo teste de componente/lib no frontend usa Vitest + Testing Library (`@testing-library/react`, `@testing-library/jest-dom`) em ambiente `jsdom`.
- Todo teste no backend usa Jest + `@nestjs/testing`; testes unitários ficam ao lado do código-fonte (`*.spec.ts`), testes e2e ficam em `apps/api/test/*.e2e-spec.ts`.
- A camada `domain` de cada bounded context (ver [[../technical/architecture]]) deve ser testável sem subir o Nest ou o MongoDB — testes unitários de `domain`/`application` não devem depender de infraestrutura real.

## Referências

- [[../technical/architecture]]
- [[0009-ddd-como-arquitetura-principal]]
- [[0011-stack-backend-nestjs-mongodb-rest]]
