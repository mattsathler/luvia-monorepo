# Plano — Participação em evento (UI)

## Status

⏳ Pendente

## Objetivo técnico

Deixar o jogador ver e entrar num evento pela interface — reaproveitando o seletor de atividade já construído na M02.

## Escopo

- Lista de eventos disponíveis agora, integrada ao seletor de atividade (M02, plano 03).
- Ao participar, UI mostra claramente até quando o personagem está ocupado (`activityEndsAt`).
- Local do evento indicado (depende do plano 05).

## Onde no código

- `apps/game/src/pages/home/` (seletor de atividade da M02) ou tela própria se o catálogo crescer demais pra caber ali

## Depende de

- Atividade evento (plano 02).
- Seletor de atividade da M02.

## Referências

- [[../../02-loop-de-vida-wryd/planos/03-seletor-de-atividade]]
