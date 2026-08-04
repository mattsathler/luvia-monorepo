# Endpoints — Account

## Objetivo

Documentar os endpoints do bounded context Account (registro e login). Ver [[../../architecture]] para a arquitetura do módulo.

## Base

`/auth`

## `POST /auth/register`

Público (não exige token).

**Body:**

```json
{
  "email": "ana@example.com",
  "password": "senha-com-8-caracteres-ou-mais"
}
```

**Validação**: `email` precisa ser um email válido; `password` precisa ter no mínimo 8 caracteres.

**Resposta (201):**

```json
{
  "id": "uuid",
  "email": "ana@example.com"
}
```

**Erros:**

- `400` — validação falhou (email inválido, senha curta).
- `409` — já existe uma conta com esse email.

**Pontos de importância:**

- A senha é convertida em hash (bcrypt) antes de salvar — nunca é armazenada nem retornada em texto puro.
- Não cria nenhum personagem automaticamente — ver [[../../decisions/0015-multiplos-personagens-por-conta]], criar personagem é uma chamada separada (`POST /characters`).
- Sem 2FA (decisão explícita, por enquanto).

## `POST /auth/login`

Público (não exige token).

**Body:**

```json
{
  "email": "ana@example.com",
  "password": "senha"
}
```

**Resposta (200):**

```json
{
  "accessToken": "jwt...",
  "account": { "id": "uuid", "email": "ana@example.com" }
}
```

**Erros:**

- `401` — email ou senha inválidos (mensagem genérica, não revela qual dos dois está errado).

**Pontos de importância:**

- O `accessToken` é um JWT stateless (ver [[../../decisions/0014-autenticacao-jwt-email-senha]]) contendo apenas o id da conta (`sub`), sem estado no servidor.
- Deve ser enviado em requisições subsequentes via `Authorization: Bearer <accessToken>`.

## Referências

- [[../README]]
- [[../../decisions/0014-autenticacao-jwt-email-senha]]
- [[../../decisions/0015-multiplos-personagens-por-conta]]
