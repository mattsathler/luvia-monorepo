# Plano — Local do evento na cidade

## Status

⏳ Pendente — adicionado ao revisar a integração com a M03: um evento "solto" sem lugar na cidade contradiz a própria ideia de cidade viva (ver [[../../../vision/final-goal]]).

## Objetivo técnico

Eventos acontecem em algum lugar da cidade (ver [[../../../game-design/events]]: festa, feira, festival), não em um menu flutuante desconectado do mundo — a M03 já entregou a cidade navegável, este plano conecta as duas coisas.

## Escopo

- Evento associado a uma posição/lote público na cidade (não um lote de jogador — um espaço público, análogo aos lotes mas sem dono).
- Tela de cidade (M03) mostra eventos ativos/agendados no local correspondente.
- Participar do evento pode ser feito tanto pelo seletor de atividade (plano 03) quanto navegando até o local na cidade — decisão de UX a fechar aqui, mas o dado (local) precisa existir de qualquer forma.

## Onde no código

- `apps/api/src/lot/` (espaço público, se reaproveitar o mesmo conceito de lote) ou modelagem própria
- `apps/game/src/pages/city/`

## Depende de

- Cidade isométrica no jogo (M03, plano 01).
- Catálogo de eventos (plano 01).

## Referências

- [[../../../game-design/events]]
- [[../../../game-design/city-and-world]]
- [[../../03-cidade-e-lar/planos/06-interacao-com-a-metropole]]
