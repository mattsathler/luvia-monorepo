# Arquitetura (DDD)

## Objetivo

Definir a arquitetura de software principal do projeto e como o código deve ser organizado em torno dela.

## Contexto

O projeto é um monorepo (`apps/game`, `apps/docs`, `packages/luv-ui`). Era necessário definir uma arquitetura única para evitar que cada app/pacote organizasse regras de negócio de forma diferente.

## Decisões consolidadas

### Domain-Driven Design como arquitetura principal

Domain-Driven Design (DDD) é a arquitetura principal do jogo. Todos os componentes, rotas e implementações devem seguir rigorosamente essa arquitetura, em todo o monorepo (`apps/game`, `apps/docs` e `packages/luv-ui`).

### Camadas

Cada bounded context deve ser organizado em quatro camadas:

- **domain** — entidades, value objects e regras de negócio. Não depende de nenhuma outra camada.
- **application** — casos de uso que orquestram o domínio.
- **infrastructure** — integrações externas, persistência e detalhes técnicos.
- **presentation** — componentes React e rotas (frontend) ou controllers REST (backend). Depende da camada application, nunca acessa infrastructure diretamente.

Em `packages/luv-ui`, a camada `presentation` corresponde aos componentes visuais do design system; o `domain` desse pacote descreve os conceitos próprios de UI/renderização da cidade (ex.: tiles, grid).

Em `apps/api`, cada bounded context é um módulo NestJS próprio, com as quatro camadas como subpastas (`domain/`, `application/`, `infrastructure/`, `presentation/`). Ver [[../decisions/0011-stack-backend-nestjs-mongodb-rest]].

### Bounded contexts

Os bounded contexts seguem as áreas de jogo já documentadas em `docs/game-design/`:

| Bounded context | Documentação de referência |
| --- | --- |
| Character | [[../game-design/character-needs]], [[../game-design/progression-fame]], [[../game-design/skills-and-study]], [[../game-design/player-control]] |
| Employment | [[../game-design/jobs]] |
| Company | [[../game-design/companies]], [[../game-design/contracts]] |
| Economy | [[../game-design/economy]], [[../game-design/industry-system]] |
| City | [[../game-design/city-and-world]], [[../game-design/lots-and-construction]] |
| Relationship | [[../game-design/relationships]] |
| Social | [[../game-design/social-interactions]] |
| Event | [[../game-design/events]] |

## Observações

A divisão exata de pastas dentro de cada bounded context no frontend (`apps/game`, `packages/luv-ui`) — ex.: onde ficam testes, DTOs, mappers — ainda não foi definida — **Pendente**. No backend (`apps/api`), a convenção já está em uso (ver acima).

## Referências

- [[tech-stack]]
- [[code-organization]]
- [[../decisions/0009-ddd-como-arquitetura-principal]]
- [[../decisions/0011-stack-backend-nestjs-mongodb-rest]]
