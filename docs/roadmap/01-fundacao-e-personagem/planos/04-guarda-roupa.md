# Plano — Guarda-roupa

## Status

✅ Concluído

## Objetivo técnico

Deixar o jogador montar a aparência do personagem por camadas (corpo, rosto, cabelo, blusa, calça, sapato, sobreposição), com prévia ao vivo e um seletor de miniaturas que não confunde "sem peça" com "quadrado vazio".

## Escopo

- Personagem montado em camadas, cada peça um PNG numa pasta própria (`assets/character/<categoria>/<id>/`) com `<id>_model.png` (composição) e `<id>_preview.png` (miniatura no seletor).
- `composeAndTrimLayers`: empilha as camadas num canvas fixo e recorta a blank area do conjunto, pra prévia ao vivo.
- `ThumbnailOption`/`LayerOptionPicker`: grid de miniaturas com layout quadrado (`grid-wrap-3`), incluindo um preview de "X" pros slots que representam "sem peça" (cabelo careca, sem sapato, sem casaco).
- `PATCH /characters/:id/appearance` pra trocar peças fora da criação.

## Onde no código

- `apps/game/src/assets/character/`
- `apps/game/src/lib/character-assets.ts`, `image-trim.ts`, `useComposedCharacterPreview.ts`
- `apps/game/src/pages/character-create/ThumbnailOption.tsx`, `LayerOptionPicker.tsx`
- `apps/api/src/character/application/use-cases/update-appearance.use-case.ts`

## Depende de

- Criação de Personagem (plano 03).

## Referências

- [[../../../decisions/0019-personagem-montado-em-camadas-com-rig-2d]]
- [[../../../decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area]]
- [[../../../decisions/0023-ordem-de-camadas-do-guarda-roupa-e-categoria-overlays]]
