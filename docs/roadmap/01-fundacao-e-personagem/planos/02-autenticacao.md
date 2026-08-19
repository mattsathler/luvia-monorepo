# Plano — Autenticação

## Status

✅ Concluído

## Objetivo técnico

Permitir que uma pessoa crie uma conta e mantenha uma sessão autenticada em todas as chamadas subsequentes.

## Escopo

- Bounded context `account` (domain/application/infrastructure/presentation), seguindo DDD.
- Registro por email/senha (hash de senha, validação de duplicidade).
- Login retorna JWT.
- Guard JWT (`shared/auth`) protegendo rotas autenticadas; decorator `@CurrentAccount()` pra extrair a conta da requisição.
- Frontend: `AuthContext`, persistência de token, redirecionamento pra login em token ausente/expirado (401 tratado centralizadamente em `authFetch`).

## Onde no código

- `apps/api/src/account/`
- `apps/api/src/shared/auth/`
- `apps/game/src/auth/`

## Depende de

Nenhuma.

## Referências

- [[../../../decisions/0014-autenticacao-jwt-email-senha]]
- [[../../../decisions/0009-ddd-como-arquitetura-principal]]
