# 0023 — Ordem de camadas do guarda-roupa e categoria `overlays`

## Contexto

[[0020-assets-de-personagem-em-canvas-fixo-com-blank-area]] item 3 deixou a ordem de z-index entre `pants`/`shoes`/`tops` e a posição de `hairType` como pendência, "a decidir quando os PNGs de cabelo/olho e de guarda-roupa real chegarem". `hairType` também nunca entrou em `LAYER_ORDER`/`PlayerLayers` (`apps/game/src/components/Player/Player.tsx`) — existia só como campo de `Appearance` enviado à API, sem camada visual correspondente em `Player`.

Faltava também uma categoria pra jaqueta/casaco (peça de sobreposição que cobre o resto do look), que não existia nem como campo de `Appearance` nem como pasta de asset.

## Decisão

1. **Ordem de empilhamento final (de trás pra frente):** `body_types` → `faces` → `hair_types` → `tops` (blusa) → `pants` (calça) → `shoes` → `overlays` (jaqueta/casaco). Cabelo fica na frente do rosto; a blusa sempre por baixo da calça; `overlays` é sempre a última camada, cobrindo tudo — ver `LAYER_ORDER` em `apps/game/src/components/Player/Player.tsx`.
2. **`hairType` passa a ter camada visual em `Player`**, via categoria `hair_types` — antes só existia como campo enviado à API, sem aparecer na composição do personagem.
3. **Nova categoria de asset `overlays`** (pasta `apps/game/src/assets/character/overlays/`, ainda sem PNG real) e novo campo `Appearance.overlay` (backend e frontend), seguindo o mesmo padrão de `face`/`top`/`pants`/`shoes`: só existe via `PATCH /characters/:id/appearance` (`UpdateAppearanceDto`), não na criação do personagem.
4. **Ordem das abas no seletor da criação de personagem é independente da ordem de z-index** — é só a ordem de exibição em `CharacterCreatePage.tsx`: Corpo → Cabelo → Rosto → Sobreposição → Calça → Blusa → Sapato. Não confundir uma com a outra ao adicionar categoria nova: z-index vive em `LAYER_ORDER`, ordem de abas vive na ordem dos `<Tab>` no JSX.
5. **`eye_types` continua fora do empilhamento** — mesma situação de antes, sem PNG real ainda (ver Pendências em [[0020-assets-de-personagem-em-canvas-fixo-com-blank-area]]).

## Consequências

- `characterToPlayerLayers` (`apps/game/src/components/Player/characterToPlayerLayers.ts`) mapeia `hairType`/`overlay` junto dos demais campos de `Appearance`, com o mesmo fallback pro id `"0"` quando o valor ainda é o placeholder `"default"` (personagens criados antes dessas camadas existirem).
- `overlays` e `hair_types` sem PNG real simplesmente não aparecem — nem aba selecionável (`LayerOptionPicker` se esconde sozinho, ver item 5 de [[0020-assets-de-personagem-em-canvas-fixo-com-blank-area]]), nem camada desenhada (`getLayerSrc` não resolve, `Player` ignora). Nenhuma mudança de código será necessária quando a arte chegar.

## Referências

- [[0020-assets-de-personagem-em-canvas-fixo-com-blank-area]]
- [[0019-personagem-montado-em-camadas-com-rig-2d]]
- [[0033-mundo-e-personagem-em-pixel-art-com-hud-vetorizada-coesa]]
