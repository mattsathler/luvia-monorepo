# API — Índice de Endpoints

## Objetivo

Documentar todos os endpoints REST do backend (`apps/api`), organizados por bounded context. Esta é a fonte de verdade sobre o que a API expõe — deve ser mantida em sincronia com o código.

## Regra

Ver [[../../decisions/0017-documentar-todo-endpoint-na-api]]: **todo endpoint novo, ao ser criado, deve ser adicionado à documentação correspondente aqui antes de ser considerado pronto.**

## Convenções gerais

- **Autenticação**: JWT stateless via header `Authorization: Bearer <token>`. Toda rota é protegida por padrão (guard global); rotas marcadas como públicas são explicitadas em cada documento. Ver [[../../decisions/0014-autenticacao-jwt-email-senha]].
- **Formato de erro padrão** (NestJS): `{ statusCode, message, error }`.
- Nenhuma rota retorna dados sensíveis (ex.: hash de senha).

## Módulos

| Módulo | Documentação |
| --- | --- |
| Account (autenticação) | [[account/endpoints]] |
| Character | [[character/endpoints]] |
| Shared (health check) | [[shared/endpoints]] |

## Referências

- [[../architecture]]
- [[../../decisions/0011-stack-backend-nestjs-mongodb-rest]]
