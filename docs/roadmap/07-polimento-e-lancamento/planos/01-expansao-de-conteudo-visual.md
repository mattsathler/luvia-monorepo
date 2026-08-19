# Plano — Expansão de conteúdo visual

## Status

⏳ Pendente

## Objetivo técnico

O guarda-roupa (M01) e a personalização de lote (M03) nasceram com o mínimo de opções pra validar o mecanismo — este plano é sobre produzir mais conteúdo em cima da infraestrutura que já existe, sem exigir nenhuma mudança de código.

## Escopo

- Pelo menos o dobro de opções de cabelo/roupa em relação à M01 (basta soltar novas pastas `<id>/` em `assets/character/<categoria>/` — ver [[../../01-fundacao-e-personagem/planos/04-guarda-roupa]], o mecanismo já suporta isso sem editar código).
- Mais opções de skin de lote (M03, plano 04).

## Onde no código

- `apps/game/src/assets/character/`
- `apps/api/src/lot/` (catálogo de skins, se centralizado lá)

## Depende de

- Guarda-roupa (M01, plano 04).
- Personalização de lote (M03, plano 04).

## Referências

- [[../../01-fundacao-e-personagem/planos/04-guarda-roupa]]
- [[../../03-cidade-e-lar/planos/04-personalizacao-de-lote]]
