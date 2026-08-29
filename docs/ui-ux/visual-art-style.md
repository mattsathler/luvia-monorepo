# Estilo Visual

## Objetivo

Definir a direção de arte do jogo.

## Decisões consolidadas

### Mundo e personagem

- Pixel art — substitui o estilo vetorizado/ilustrado original (ver [[../decisions/0033-mundo-e-personagem-em-pixel-art-com-hud-vetorizada-coesa]])
- Isométrico (mecanismo de tiles e iluminação não muda, só a técnica de desenho da imagem de origem)
- Cozy
- Pouco contraste
- Sem cores extremamente saturadas
- Paleta suave

### HUD e ícones

- Vetorizado / ilustrado, arredondado, estilo chibi — **não** migra para pixel art junto com mundo/personagem
- Coesão com o mundo pixel art vem de paleta de cor compartilhada e de uma borda fina "crisp" (sem anti-aliasing) nos painéis, não de usar a mesma técnica de desenho (ver [[../decisions/0033-mundo-e-personagem-em-pixel-art-com-hud-vetorizada-coesa]])

## Ícones

Ícones (`packages/luv-icons`, ver [[design-system]]) seguem o estilo arredondado/chibi da HUD. Antes de [[../decisions/0033-mundo-e-personagem-em-pixel-art-com-hud-vetorizada-coesa]] essa regra existia pra espelhar o próprio personagem (`Player`); com o personagem migrando pra pixel art, os ícones mantêm a regra por si só — ela descreve o estilo da HUD, não mais uma cópia do estilo do mundo. Na prática:

- Formas construídas com primitivas arredondadas (círculos, retângulos com `rx`/`ry` generosos, curvas suaves) — nunca cantos vivos ou polígonos pontudos.
- Silhueta sólida preenchida com `currentColor` (sem contorno separado), para funcionar em qualquer cor de tema/tab.
- Proporções chibi quando o ícone representa uma parte do corpo/roupa: elementos "cabeça"/"topo" maiores e mais arredondados que a base.

## Referências

- [[interface-principles]]
- [[../game-design/city-and-world]]
- [[logo]]
- [[design-system]]
- [[../decisions/0033-mundo-e-personagem-em-pixel-art-com-hud-vetorizada-coesa]]
