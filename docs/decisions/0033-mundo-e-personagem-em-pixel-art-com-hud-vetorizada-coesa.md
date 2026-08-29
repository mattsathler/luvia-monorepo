# 0033 — Mundo e personagem migram para pixel art; HUD permanece vetorizada, coesa por paleta e borda

## Contexto

[[../ui-ux/visual-art-style]] fixava um único estilo — vetorizado/ilustrado, cozy, chibi — pra tudo: mundo, personagem e HUD/ícones. Duas pressões concretas colocaram isso em questão:

1. **Produção e manutenção do catálogo.** [[0032-lote-tipo-e-nivel-catalogo-expansivel]] exige crescimento contínuo de Tipos de lote (arte nova, recorrente, não só na implementação inicial). A ferramenta usada até aqui (CorelDRAW, vetorial) não tem grid axonométrico nativo, o que torna caro manter ângulo e iluminação consistentes entre dezenas de peças desenhadas à mão, e a produção de cada variação de fachada é trabalho manual completo por peça.
2. **Mecanismo de renderização não depende do estilo de arte.** A cidade (`IsoGrid`/`Block`, `packages/luv-ui/src/city`) é feita de `<div>`s com `clip-path` recortando faces, cada face usando uma `background-image` (a textura do tile) misturada via `color-mix`/`multiply` com a cor do sol (`DayCycleControl`). Esse mecanismo de iluminação dia/noite opera sobre qualquer imagem de origem — trocar a textura por um sprite pixel art não quebra o efeito, só exige `image-rendering: pixelated` pra evitar que o navegador borre o sprite ao escalar.

Avaliada a troca, pixel art com uma ferramenta dedicada a grid isométrico (Aseprite) resolve os dois problemas — paleta indexada facilita reaproveitar cor entre variações de nível de um mesmo Tipo, e o grid trava o ângulo. O tradeoff descartado foi migrar a HUD junto: ela já é uma camada React independente do mundo isométrico, validada, e pixel art nela não traria benefício de produção (não há catálogo de HUD crescendo do mesmo jeito que o de lotes).

## Decisão

1. **Mundo (tiles: grama, ruas, lagoa, prédios/lotes) e personagem (peças do guarda-roupa) migram para pixel art.** O mecanismo isométrico (`IsoGrid`/`Block`, `--x/--y/--z`, faces top/left/right, iluminação por `color-mix`) não muda — só a imagem de origem de cada face/peça passa a ser desenhada em pixel art em vez de vetor/ilustração.
2. **HUD (`apps/game/src/pages/home/hud/*`) e ícones (`packages/luv-icons`) permanecem vetorizados/arredondados/estilo chibi.** Não há reskin da HUD para pixel art.
3. **Coesão entre HUD e mundo passa a vir de paleta compartilhada e acento de borda, não de técnica de desenho igual.** HUD e mundo usam a mesma paleta base (cozy, pouco contraste, sem cores extremamente saturadas — herdada de [[../ui-ux/visual-art-style]]); painéis da HUD ganham uma borda fina "crisp" (sem anti-aliasing, estilo nine-slice) como aceno ao pixel art do mundo, mantendo os cantos internos e o preenchimento arredondados como hoje.
4. **Arquitetura de camadas do personagem se mantém.** [[0019-personagem-montado-em-camadas-com-rig-2d]], [[0020-assets-de-personagem-em-canvas-fixo-com-blank-area]] e [[0023-ordem-de-camadas-do-guarda-roupa-e-categoria-overlays]] continuam valendo como estão (composição por id, canvas fixo 662×861, ordem de camadas) — só o conteúdo de cada PNG passa a ser pixel art em vez de ilustração vetorial exportada.
5. **Ferramenta de produção muda de CorelDRAW para um editor pixel dedicado (Aseprite, com LibreSprite como alternativa gratuita).** Grid isométrico configurado como um tile mestre único (ex. diamante de topo 32×16) reaproveitado por todo o catálogo, pra travar ângulo e evitar inconsistência entre peças desenhadas em momentos diferentes. Paleta indexada e fixa (~16-32 cores, sem entrar em número exato aqui) reaproveitada entre variações de nível de um mesmo Tipo (0032), reduzindo o custo de cada novo nível a um palette swap quando a mudança for só de cor.
6. **[[../ui-ux/visual-art-style]] deixa de se aplicar a mundo e personagem.** "Vetorizado/ilustrado" nesse documento passa a valer só para HUD/ícones — ver atualização feita nele e em [[../game-design/city-and-world]] junto com esta decisão.

## Justificativa

Pixel art com ferramenta dedicada resolve o problema real (consistência de ângulo/iluminação e custo de manter um catálogo crescente) sem exigir mudança na renderização (o mecanismo `IsoGrid`/`color-mix` é agnóstico ao estilo de arte da imagem de origem — não existe custo técnico de mudar a textura). Manter a HUD como está evita o retrabalho e o risco de regressão numa camada já validada, e o risco de dissonância visual ("HUD arredondada colada num mundo pixelado") é mitigado por paleta compartilhada e um acento de borda, que é o denominador comum observado em jogos que combinam um mundo estilizado com uma UI de linguagem diferente (ex.: Habbo Hotel, Two Point Hospital), em vez de forçar as duas camadas a usar a mesma técnica de desenho.

## Consequências

- Todo o catálogo de assets existente do mundo (texturas de tile: grama, ruas, lagoa) e do personagem (`apps/game/src/assets/character/{body_types,faces,hair_types,tops,pants,shoes,overlays}`) precisa ser redesenhado em pixel art — trabalho de conteúdo contínuo, não uma migração de um PR só.
- CSS dos elementos de tile/personagem precisa ganhar `image-rendering: pixelated`.
- A lógica de zoom/escala do grid (`--size` em `IsoGrid`) precisa passar a variar em múltiplos inteiros do tile base, pra não borrar o pixel art ao escalar — hoje é fluido/responsivo sem essa restrição.
- Novos Tipos de lote ([[0032-lote-tipo-e-nivel-catalogo-expansivel]]) daqui pra frente são produzidos em pixel art, não vetor.
- `packages/luv-icons` e os componentes de HUD não precisam de nenhuma mudança de conteúdo — só os componentes de painel/moldura ganham a borda crisp descrita no item 3, quando essa parte for implementada.
- [[../ui-ux/visual-art-style]] e [[../game-design/city-and-world]] atualizados nesta mesma mudança pra refletir a divisão de estilo entre mundo/personagem (pixel art) e HUD/ícones (vetorizado).

## Referências

- [[../ui-ux/visual-art-style]]
- [[../game-design/city-and-world]]
- [[0018-proibido-scss-customizado-fora-do-luv-ui]]
- [[0019-personagem-montado-em-camadas-com-rig-2d]]
- [[0020-assets-de-personagem-em-canvas-fixo-com-blank-area]]
- [[0023-ordem-de-camadas-do-guarda-roupa-e-categoria-overlays]]
- [[0026-terreno-da-cidade-gerado-e-persistido]]
- [[0032-lote-tipo-e-nivel-catalogo-expansivel]]
