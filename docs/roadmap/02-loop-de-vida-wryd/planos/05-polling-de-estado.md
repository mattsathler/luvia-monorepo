# Plano — Polling de estado

## Status

⏳ Pendente

## Objetivo técnico

Fechar a decisão pendente de intervalo de polling em [[../../../technical/simulation-tick]], e implementá-la — sem isso, o jogador só veria o efeito do tick recarregando a página manualmente.

## Escopo

- Decidir e documentar o intervalo de polling do frontend (hoje marcado "Pendente" na doc técnica).
- Hook de polling (ex.: `usePolledCharacter`) que consulta `GET /characters/:id` periodicamente e atualiza o estado exibido no dashboard.
- Pausar/reduzir o polling quando a aba não está visível (`document.visibilitychange`), pra não desperdiçar chamadas com o jogador ausente.
- Cada `GET /characters/:id` já dispara o recompute lazy no backend (plano 06 da M01) — o polling só precisa consumir o resultado, não recalcular nada no cliente.

## Onde no código

- `apps/game/src/lib/` (novo hook)
- `apps/game/src/pages/home/`

## Depende de

- Dashboard de necessidades (plano 02).

## Referências

- [[../../../technical/simulation-tick]]
