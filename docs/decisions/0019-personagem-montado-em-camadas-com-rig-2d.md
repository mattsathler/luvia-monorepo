# 0019 — Personagem montado em camadas, com rig 2D por rotação de membros

## Contexto

A home do jogo será a cidade isométrica (ver [[../game-design/city-and-world]]), renderizada em DOM (`IsoGrid`/`Block` da luv-ui, tiles como `div` posicionadas por `--x/--y/--z`). Além do personagem customizável do jogador, queríamos NPCs genéricos andando pela cidade só para dar vida ao mundo, sem precisar de arte própria para eles. Era necessário decidir: em que formato as peças do personagem (cabelo, roupa, etc.) chegam como asset, e como a animação de andar/correr é produzida — sem contar com um time de arte dedicado (o desenvolvimento é de uma pessoa só).

## Decisão

1. **Personagem montado em camadas por peça**, cada peça referenciada por um id (`{ hair: 18, hoodie: 42, pants: 7, shoes: 3, accessory: 12 }`), salvos no backend e "encaixados" em ordem no client — sem mudança em relação ao que já estava desenhado para a customização.
2. **Peças como PNG** (não SVG), por causa do estilo de arte pintado/ilustrado (sombra, luz), incompatível com vetores flat.
3. **Catálogo de peças fixado**:
   - Cabelo — estática, fixa à cabeça.
   - Rosto/cabeça — estática.
   - Acessório — estática, **só cabeça** (sem acessórios de corpo).
   - Tronco + braços — desenhados como uma única arte de referência (para manter proporção), depois exportados como **peças separadas** (tronco, braço esquerdo, braço direito) só para permitir animar os braços independentemente do tronco.
   - Pernas + calçado — **peça única** por perna (não se separa em coxa/perna/pé), uma para cada lado.
4. **Animação é um rig 2D de rotação, não spritesheet de frames**: o tronco é a âncora fixa do personagem; braços giram em torno do ombro (`transform-origin` no ombro) e pernas em torno do quadril, via CSS `@keyframes rotate(...)`. Cabelo e roupas do tronco não têm animação própria — seguem o tronco, que é estático.
5. **Inspiração Scribblenauts**: o ciclo de animação usa amplitude de rotação de corrida (maior que um walk cycle comum), mas tocado em velocidade reduzida — dá a leitura de "correndo devagar" sem desenhar frame nenhum, só ajustando amplitude/duração do keyframe. Braço e perna do mesmo lado giram em fase oposta entre si (braço esquerdo synced com perna direita).
6. **Profundidade do braço sincronizada com a rotação**: o `z-index` do braço alterna dentro do mesmo `@keyframes` da rotação (ex.: `z-index: 2` quando à frente, `z-index: -2` quando atrás do tronco), para que o braço que está na fase "de trás" do ciclo realmente fique atrás do tronco, e não sempre na mesma camada.
7. **NPCs de ambiente reaproveitam o mesmo catálogo de peças e o mesmo rig** do personagem do jogador — só que com combinações de ids fixas ou sorteadas no client, sem persistir nada no backend. A montagem (que peças, em que ordem) fica isolada numa função pura (`assembleAvatar(ids) -> layers[]`), consumida tanto pelo personagem do jogador quanto pelos NPCs, para não duplicar a lógica entre os dois usos.
8. **Renderização continua em DOM** (divs), reaproveitando o mesmo esquema de posicionamento isométrico (`--x/--y/--z` → `z-index`) que o `Block` da cidade já usa. Migrar para Canvas/PixiJS fica como otimização futura, só se a contagem de NPCs simultâneos exigir — não é feito preventivamente.

## Justificativa

Sem time de arte, o critério dominante era minimizar o volume de arte necessário: um rig de rotação (em vez de spritesheet de frames por direção) permite animar caminhada/corrida desenhando cada peça **uma única vez**, com o movimento inteiro resolvido em CSS. Reaproveitar o catálogo de peças da customização para os NPCs elimina a necessidade de arte própria para eles — são as mesmas peças, só montadas em combinações não escolhidas pelo jogador. Manter a renderização em DOM em vez de migrar preventivamente para Canvas evita construir dois caminhos de render (e duplicar a lógica de composição) para um problema de performance que ainda não existe — o próprio design pede "poucos elementos animados" (ver [[../ui-ux/visual-art-style]]), não uma cidade lotada de avatares.

## Consequências

- Toda peça nova (de qualquer categoria) precisa nascer no mesmo canvas/ponto de âncora das demais peças da categoria — sem isso, trocar de peça ou girar um membro "descola" visualmente. Isso é uma regra de processo a seguir manualmente em toda peça criada, não algo garantido por ferramenta.
- Braço e tronco precisam ser cortados a partir da mesma arte de referência, preservando o ponto de encaixe no ombro em cada variação de tronco/roupa criada.
- `assembleAvatar` (ou equivalente) deve ser implementado como função pura de dados (ids → lista de camadas), independente de o consumidor renderizar em DOM ou, futuramente, em Canvas.
- NPCs não têm accountId nem persistência — são inteiramente client-side, gerados/sorteados na sessão.
- **Pendente**: [[../ui-ux/visual-art-style]] define o estilo como "Pixel Art", mas as referências usadas para desenhar esse rig são ilustração pintada, não pixel art. Não decidir essa divergência por conta própria — o estilo final da arte do personagem ainda precisa ser fechado.
- **Pendente**: se braços terão amplitude/uso de accessory de corpo no futuro, ou se acessórios continuam restritos à cabeça permanentemente.

## Referências

- [[../game-design/character-needs]]
- [[../game-design/city-and-world]]
- [[../game-design/player-control]]
- [[../ui-ux/visual-art-style]]
- [[0008-luv-ui-como-design-system-obrigatorio]]
