# 0020 — PNGs do personagem exportados num canvas fixo, com blank area, para composição sem ajuste

## Contexto

[[0019-personagem-montado-em-camadas-com-rig-2d]] já havia decidido que o personagem é montado por peça via ids (`{ skinTone, hairType, eyeType, face, accessory, top, pants, shoes }`), com "PNG por peça com âncora fixa por categoria". Os primeiros PNGs reais chegaram em `apps/game/src/assets/character/`:

```
character/body_types/0.png .. 5.png   (silhueta do corpo, um arquivo por tom de pele)
character/clothes/0.png               (uma peça de roupa)
character/faces/0.png                 (um rosto)
```

Analisando os arquivos (todos PNG RGBA, sem interlace): cada peça é exportada num **canvas idêntico** entre categorias — 662×861px (`body_types/0.png` saiu com 662×860px, 1px a menos de altura; ver Pendências) — mas o desenho de cada peça ocupa só uma fração desse canvas, com uma **blank area** transparente ao redor já posicionando a arte no lugar certo:

| Arquivo | Canvas | Bounding box do conteúdo (x, y) | Tamanho do conteúdo |
| --- | --- | --- | --- |
| `body_types/*.png` | 662×861 | x: 157–508, y: 126–740 | 352×615 |
| `clothes/0.png` | 662×861 | x: 267–412, y: 558–630 | 146×73 |
| `faces/0.png` | 662×861 | x: 249–466, y: 267–402 | 218×136 |

A roupa (`clothes/0.png`, um short) já nasce posicionada na altura do quadril do corpo, e o rosto (`faces/0.png`, olhos/sobrancelhas/blush) já nasce posicionado na altura da cabeça — sem que o código precise saber onde cada peça fica.

## Decisão

1. **Todo PNG de peça do personagem é exportado no mesmo canvas fixo** (mesma largura × altura, mesma origem `(0,0)` no canto superior esquerdo), independente de quão pequena for a peça em si. A posição da arte dentro desse canvas *é* a âncora — não existe (e não deve existir) metadata separada de offset por peça.
2. **A composição empilha as camadas desenhando cada uma em `(0,0)` de um único `<canvas>` (via `CanvasRenderingContext2D.drawImage`), na implementação real em `apps/game/src/lib/image-trim.ts` (`composeAndTrimLayers`)** — não via CSS. [[0018-proibido-scss-customizado-fora-do-luv-ui]] proíbe SCSS/CSS inline fora do Luv.UI, então o empilhamento `position: absolute` cogitado originalmente aqui não é uma opção em `apps/game`; compor num canvas e gerar uma única imagem (data URL) resolvida evita precisar de qualquer CSS novo. Isso tem o efeito colateral útil de permitir recortar a blank area do *conjunto* já composto antes de exibir (ver `trimTransparentPadding`/`composeAndTrimLayers`), deixando a prévia centralizada sem CSS nenhum.
3. **Ordem de empilhamento (z-index) é por categoria, não por arquivo**: `body_types` (base) → `faces` → `pants` → `shoes` → `tops` → demais categorias futuras (`hairType`, `eyeType`, `accessory`). A ordem exata de z-index entre as categorias ainda não foi validada visualmente (ex.: cabelo provavelmente por cima do corpo mas por trás ou na frente do rosto, a depender do estilo; a ordem entre `pants`/`shoes`/`tops` também é um palpite até existir arte real que se sobreponha) — decidir quando os PNGs de cabelo/olho e de guarda-roupa real chegarem.
4. **Convenção de nome de arquivo**: um inteiro por variante dentro da pasta da categoria (`0.png`, `1.png`, ...). Para `body_types`, esse índice já bate com `Appearance.skinTone` (0 = mais claro, sobe até o mais escuro) — não precisa de tabela de tradução id → arquivo, o valor persistido é literalmente o nome do arquivo.
5. **O id nunca tem nome/label associado, em lugar nenhum** — nem no código, nem na UI. `apps/game/src/lib/character-assets.ts` descobre categorias e ids automaticamente varrendo `assets/character/*/*.png` em build time (`import.meta.glob`), então soltar um PNG novo numa pasta já existente disponibiliza a opção sem editar nenhum array hardcoded de `{ id, label }`. Na UI, `ThumbnailOption` (`apps/game/src/pages/character-create/ThumbnailOption.tsx`) mostra só o PNG (recortado) — o id vira `aria-label` (acessibilidade), nunca texto visível.
6. **A composição/prévia é um componente único e reutilizável, `Player`** (`apps/game/src/components/Player/Player.tsx`), não algo específico da tela de criação. Ele recebe `layers: { [categoria]: id }` (ex.: `{ body_types: "3", faces: "0", pants: "0", shoes: "0", tops: "0" }`) e monta sozinho, via `composeAndTrimLayers`. É o mesmo componente que vai renderizar os detalhes de qualquer personagem específico em outras telas do jogo — a tela de criação é só o primeiro uso dele, passando os ids que o jogador está escolhendo naquele momento.
7. **`clothes/0.png` virou três categorias independentes**: `pants/`, `shoes/`, `tops/` — guarda-roupa genérico não é aceitável, cada peça (calça, sapato, blusa) precisa ser trocável separadamente (bate com `Appearance.top`/`Appearance.pants`/`Appearance.shoes`, já modelados como campos independentes desde [[0019-personagem-montado-em-camadas-com-rig-2d]] item 7). `pants/0.png` já tem arte real; `shoes/0.png` e `tops/0.png` nasceram como placeholders totalmente transparentes (mesmo canvas fixo) só pra manter as três pastas presentes e a ordem de empilhamento testável — sem seletor de verdade na UI ainda (ver Pendências).

## Pendências

- **`body_types` só tem 6 variantes (índices `0`–`5`)**, mas o domínio (`SKIN_TONES` em `apps/api/src/character/domain/entities/appearance.ts`, decidido em [[0019-personagem-montado-em-camadas-com-rig-2d]] item 7) define uma escala de `0` a `6` — **7 valores**. Precisa decidir: encomendar o 7º tom, ou reduzir `SKIN_TONES`/o schema para 6 valores (`0`–`5`). Não ajustado agora para não adivinhar a intenção de arte.
- **`shoes/0.png` e `tops/0.png` são placeholders transparentes**, sem arte real ainda — substituir assim que a arte de guarda-roupa chegar. `pants/0.png` já é arte real, mas ainda sem uma segunda variante.
- **Nenhuma das três categorias de guarda-roupa tem seletor na UI** — `CharacterCreatePage` não renderiza `LayerOptionPicker` pra `pants`/`shoes`/`tops`, e `CreateCharacterInput`/`create-character.dto.ts` na API não aceitam esses campos na criação (só existem via `PATCH` de `UpdateAppearanceDto`, ainda não chamado pelo frontend). `Player` sempre usa o id `"0"` fixo pra essas três camadas (mesmo padrão hoje usado por `faces`, ver item 6). Adicionar o seletor de verdade (e o fluxo de submissão) é trabalho futuro, quando a arte de guarda-roupa trocável existir.
- **`hairType` e `eyeType` ainda não têm PNG real** — como o catálogo de assets é descoberto dinamicamente (item 5), a tela de criação (`CharacterCreatePage`, via `LayerOptionPicker`) simplesmente não mostra nenhum seletor para essas categorias enquanto `assets/character/hair_types/` e `assets/character/eye_types/` não existirem — nada de placeholder fake. Os campos continuam sendo enviados pro backend com um valor default (`"0"`) até existir arte pra escolher de verdade. Assim que os PNGs chegarem nessas pastas, o seletor (e a camada na prévia via `Player`) aparecem sozinhos, sem mudança de código.
- **`accessory` ainda não tem nenhum PNG** — esse campo de `Appearance` continua sem asset real (fica no valor default `null`).
- **`body_types/0.png` tem 662×860px**, 1px mais baixo que as outras 5 variantes (662×861px) — provável cochilo na exportação; alinhar antes de empilhar em produção, senão essa variante especificamente fica 1px deslocada verticalmente em relação às demais camadas.

## Consequências

- A composição não precisa de nenhuma tabela de offsets por peça — é puramente "desenhe cada PNG ativo em `(0,0)` do mesmo canvas, nessa ordem de z-index, recorte a blank area do resultado". Isso mantém a composição simples mesmo quando novas categorias/variantes forem adicionadas (basta soltar o PNG na pasta certa com o índice certo).
- Qualquer PNG novo de peça de personagem **precisa seguir o mesmo canvas** (662×861, salvo decisão futura de mudar o tamanho de referência) para continuar encaixando sem ajuste. Isso é uma restrição para quem exporta a arte, não para o código.
- A malha de 1px de diferença em `body_types/0.png` é o tipo de erro que esse convenção deveria eliminar — vale um passo de validação (ex.: checar dimensões de todo PNG novo contra o canvas de referência) antes de aceitar um asset novo.
- **Primeiro consumidor real**: `CharacterCreatePage` usa `LayerOptionPicker` (um seletor de miniaturas por categoria, que já se esconde sozinho se a categoria não tem asset — ver item 5) para tom de pele/cabelo/olho, e `Player` (item 6) pra prévia ao vivo, empilhando `body_types/{id}` → `faces/0` → `pants/0` → `shoes/0` → `tops/0` a cada troca de tom de pele.

## Referências

- [[0019-personagem-montado-em-camadas-com-rig-2d]]
- [[../ui-ux/visual-art-style]]
