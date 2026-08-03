# 0014 — Autenticação: JWT stateless com email e senha

## Contexto

O backend não tinha nenhum conceito de conta/login — todos os endpoints eram anônimos. Era necessário decidir como o jogador se autentica antes de iniciar qualquer fluxo de jogo real.

## Decisão

- **Estratégia**: JWT stateless. O backend emite um token assinado no login; o token é enviado no header `Authorization: Bearer <token>` em toda requisição autenticada. Não há sessão guardada no servidor.
- **Credenciais**: email e senha. A senha é armazenada com hash (bcrypt), nunca em texto puro.

## Justificativa

JWT stateless combina com a arquitetura REST + polling já decidida ([[0011-stack-backend-nestjs-mongodb-rest]], [[0013-sistema-wryd-tick-em-lotes-e-polling]]): o backend não mantém nenhuma conexão persistente por jogador, e um token sem estado no servidor segue essa mesma filosofia (nada de sessão para gerenciar/escalar). Email e senha foi escolhido por ser o método mais simples de implementar agora, sem fechar a porta para login social no futuro.

## Consequências

- Toda rota da API é protegida por padrão (guard global); rotas que precisam ser públicas (health check, registro, login) são marcadas explicitamente.
- O token carrega apenas o id da conta (`sub`); a verificação do token não consulta o banco — é puramente criptográfica (stateless de verdade).
- Revogar um token antes do seu vencimento não é possível nesse modelo (sem sessão/blocklist). Se isso vier a ser necessário, é uma decisão futura separada.
- Senhas nunca devem ser logadas, retornadas em respostas de API, ou armazenadas fora do hash.

## Referências

- [[0011-stack-backend-nestjs-mongodb-rest]]
- [[0013-sistema-wryd-tick-em-lotes-e-polling]]
- [[0015-multiplos-personagens-por-conta]]
