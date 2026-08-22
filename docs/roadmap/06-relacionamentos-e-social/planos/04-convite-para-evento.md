# Plano — Convite para evento

## Status

⏳ Pendente

## Objetivo técnico

Terceira ação social, conectando com o sistema de eventos da M04.

## Escopo

- Jogador convida outro personagem (com quem já tem relacionamento) pra um evento que ele mesmo está participando ou vai participar.
- Convidado recebe uma notificação/indicação (dentro do jogo, sem push/tempo real — ver [[../../../decisions/0004-sem-chat-em-tempo-real]]) e pode aceitar entrando no mesmo evento.

## Onde no código

- `apps/api/src/relationship/` ou `apps/api/src/character/` (dependendo de onde o evento acabou modelado na M04)

## Depende de

- Bounded context de relacionamento (plano 01).
- Atividade evento (M04, plano 02).

## Referências

- [[../../../game-design/events]]
- [[../../04-fama-e-eventos/planos/02-atividade-evento]]
