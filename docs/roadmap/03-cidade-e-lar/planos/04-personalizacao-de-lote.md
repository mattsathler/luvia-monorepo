# Plano — Personalização de lote

## Status

⏳ Pendente — adicionado depois da primeira versão desta milestone, que cobria só posse e evolução mecânica do lote, sem nenhuma customização visual (ver nota em [[../descricao]]).

## Objetivo técnico

Este plano cobre a metade visual do catálogo de Tipo+Nível (ver [[../../../decisions/0032-lote-tipo-e-nivel-catalogo-expansivel]]): o jogador escolhe um **Tipo** de lote residencial (ex.: Sobrado) dentro de um catálogo fechado — nunca um editor livre (ver [[../../../game-design/lots-and-construction]]) — e a aparência daquele Tipo evolui junto com o nível mecânico (plano 05), não como sistema separado.

## Escopo

- Catálogo fechado de Tipos residenciais (ex.: Sobrado, Casa Térrea — decisão de game design a fechar aqui), cada um com até 10 variações visuais correspondendo aos 10 níveis do plano 05.
- Catálogo pensado pra crescer: novo Tipo residencial deve ser um dado novo (arte + entrada de catálogo), não uma mudança estrutural — é requisito de design, não só de arquitetura (ver decisão 0032, regra 3).
- Campos de Tipo (e nível, compartilhado com o plano 05) no `Lot` (backend).
- UI de escolha de Tipo, reaproveitando o padrão de seletor com miniatura já validado no guarda-roupa (`ThumbnailOption`/`LayerOptionPicker` — ver [[../../01-fundacao-e-personagem/planos/04-guarda-roupa]]).
- Refletir Tipo+Nível na renderização do `Block` na cidade (plano 01).

## Onde no código

- `apps/api/src/city/domain/entities/lot.entity.ts` (campos de Tipo/nível)
- `apps/game/src/pages/city/`

## Depende de

- Lote residencial do jogador (plano 03).

## Relacionado

- [[05-evolucao-do-lote]] — mesmo catálogo de Tipo+Nível, metade mecânica.

## Referências

- [[../../../decisions/0032-lote-tipo-e-nivel-catalogo-expansivel]]
- [[../../../game-design/lots-and-construction]]
- [[../../01-fundacao-e-personagem/planos/04-guarda-roupa]]
