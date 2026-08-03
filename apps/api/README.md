# Luvia — API

Backend do jogo Luvia, em NestJS + MongoDB, seguindo DDD como arquitetura principal (ver `docs/technical/architecture.md` e `docs/decisions/0011-stack-backend-nestjs-mongodb-rest.md` na raiz do monorepo).

## Estrutura

Cada bounded context é um módulo NestJS próprio, organizado em quatro camadas:

```text
src/<bounded-context>/
  domain/          # entidades e interfaces de repositório — sem dependências de framework
  application/     # casos de uso, orquestram o domain
  infrastructure/  # implementações (ex.: Mongoose)
  presentation/    # controllers REST e DTOs
```

`Character` é o primeiro bounded context implementado, servindo de referência para os demais (Employment, Company, Economy, City, Relationship, Social, Event — ver `docs/technical/architecture.md`).

## Rodando localmente

1. Suba um MongoDB local (ou use um container).
2. Copie `.env.example` para `.env` e ajuste `MONGODB_URI` se necessário.
3. A partir da raiz do monorepo:

```bash
npm run dev:api     # inicia em modo watch
npm run build:api    # build de produção
```

Ou dentro desta pasta: `npm run dev`, `npm run build`, `npm run start`, `npm run typecheck`.

## Endpoints

- `GET /health` — health check.
- `POST /characters` — cria um personagem (`{ "name": string }`).
- `GET /characters/:id` — busca um personagem pelo id.
