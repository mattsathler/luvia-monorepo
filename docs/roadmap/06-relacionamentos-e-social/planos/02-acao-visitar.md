# Plano — Ação: Visitar

## Status

⏳ Pendente

## Objetivo técnico

Primeira ação social de verdade — usa a navegação pela cidade que a M03 já deixou pronta (ver [[../../03-cidade-e-lar/planos/06-interacao-com-a-metropole]]) e conecta com o bounded context de relacionamento (plano 01).

## Escopo

- A partir do "perfil" de um lote alheio (M03, plano 06), jogador executa a ação "Visitar".
- Efeito: progride o relacionamento entre os dois personagens (cria como "conhecido" se ainda não existir).
- Limite anti-abuso: visitar repetidamente em sequência não deve progredir o relacionamento sem limite — decisão de game design a fechar aqui (ex.: só conta uma vez por período).

## Onde no código

- `apps/api/src/relationship/`
- `apps/game/src/pages/city/`

## Depende de

- Bounded context de relacionamento (plano 01).
- Interação com a metrópole (M03, plano 06).

## Referências

- [[../../../game-design/social-interactions]]
- [[../../03-cidade-e-lar/planos/06-interacao-com-a-metropole]]
