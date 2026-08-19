# Estilo Visual

## Objetivo

Definir a direção de arte do jogo.

## Decisões consolidadas

- Vetorizado / ilustrado
- Cozy
- Pouco contraste
- Sem cores extremamente saturadas
- Paleta suave
- Ícones seguem o modelo visual do personagem: arredondados, cute, estilo chibi

## Ícones

Ícones (`packages/luv-icons`, ver [[design-system]]) devem seguir o mesmo modelo visual do próprio personagem (`Player` — ver [[../decisions/0019-personagem-montado-em-camadas-com-rig-2d]] e [[../decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area]]): arredondados, cute, estilo chibi. Na prática:

- Formas construídas com primitivas arredondadas (círculos, retângulos com `rx`/`ry` generosos, curvas suaves) — nunca cantos vivos ou polígonos pontudos.
- Silhueta sólida preenchida com `currentColor` (sem contorno separado), para funcionar em qualquer cor de tema/tab.
- Proporções chibi quando o ícone representa uma parte do corpo/roupa: elementos "cabeça"/"topo" maiores e mais arredondados que a base, ecoando a proporção de cabeça grande do `Player`.

## Referências

- [[interface-principles]]
- [[../game-design/city-and-world]]
- [[logo]]
- [[design-system]]
