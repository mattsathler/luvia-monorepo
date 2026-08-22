# Plano — Personalização de lote

## Status

⏳ Pendente — adicionado depois da primeira versão desta milestone, que cobria só posse e evolução mecânica do lote, sem nenhuma customização visual (ver nota em [[../descricao]]).

## Objetivo técnico

Diferente da evolução mecânica (plano 05 — melhorias funcionais pré-definidas), este plano é sobre a aparência do lote: o jogador escolhe como a casa dele parece na cidade, dentro de opções fechadas (sem editor livre — ver [[../../../game-design/lots-and-construction]], "nunca utilizar sistemas complexos de construção manual").

## Escopo

- Catálogo fechado de skins/decorações pro lote residencial (ex.: cor da fachada, tipo de telhado — decisão de game design a fechar aqui).
- Campo de personalização no `Lot` (backend) — provavelmente um `appearance` análogo ao do personagem (ver [[../../../decisions/0019-personagem-montado-em-camadas-com-rig-2d]] como precedente de como isso já foi resolvido pra personagem).
- UI de personalização, reaproveitando o padrão de seletor com miniatura já validado no guarda-roupa (`ThumbnailOption`/`LayerOptionPicker` — ver [[../../01-fundacao-e-personagem/planos/04-guarda-roupa]]).
- Refletir a personalização na renderização do `Block` na cidade (plano 01).

## Onde no código

- `apps/api/src/city/domain/entities/lot.entity.ts` (campo de aparência)
- `apps/game/src/pages/city/`

## Depende de

- Lote residencial do jogador (plano 03).

## Referências

- [[../../../game-design/lots-and-construction]]
- [[../../01-fundacao-e-personagem/planos/04-guarda-roupa]]
