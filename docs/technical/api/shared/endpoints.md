# Endpoints — Shared

## Objetivo

Documentar endpoints que não pertencem a um bounded context de jogo específico (infraestrutura transversal).

## `GET /health`

Público (não exige token).

**Resposta (200):**

```json
{ "status": "ok" }
```

**Pontos de importância:**

- Não verifica a conexão com o MongoDB nem outras dependências — só confirma que o processo Nest está de pé.

## Referências

- [[../README]]
