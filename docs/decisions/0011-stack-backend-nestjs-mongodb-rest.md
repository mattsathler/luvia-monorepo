# 0011 — Stack do backend: NestJS, MongoDB e REST

## Contexto

Com o backend decidido para viver no mesmo monorepo ([[0010-backend-no-mesmo-monorepo]]) e usando DDD como arquitetura principal ([[0009-ddd-como-arquitetura-principal]]), era necessário escolher o framework, o banco de dados e o estilo de API do backend.

## Decisão

- **Framework**: NestJS.
- **Banco de dados**: MongoDB.
- **Estilo de API**: REST.

## Justificativa

NestJS já organiza a aplicação em módulos com injeção de dependência, o que mapeia bem para bounded contexts e para a separação de camadas `domain/application/infrastructure/presentation` definida em [[../technical/architecture]]. REST foi escolhido por ser simples e suficiente enquanto o domínio do jogo ainda está se formando.

## Consequências

- `apps/api` é um projeto NestJS, com um módulo Nest por bounded context.
- A camada `domain` de cada bounded context permanece livre de dependências do NestJS/Mongoose — apenas classes e interfaces puras de TypeScript.
- A camada `infrastructure` usa `@nestjs/mongoose` para persistência; a camada `presentation` usa controllers REST do NestJS.
- Trocar de banco (ex.: para Postgres) ou de estilo de API no futuro exige apenas reescrever a camada `infrastructure`/`presentation` de cada contexto — a camada `domain` não deve precisar mudar.

## Referências

- [[0009-ddd-como-arquitetura-principal]]
- [[0010-backend-no-mesmo-monorepo]]
- [[../technical/architecture]]
