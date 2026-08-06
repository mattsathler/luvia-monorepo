# 0019 — Personagem montado em camadas, restrito à aba de detalhes, com animação de idle

## Contexto

A ideia original era ter o personagem customizável do jogador e NPCs genéricos andando pela cidade isométrica (ver [[../game-design/city-and-world]]), usando um rig 2D de rotação de membros (braços/pernas girando por CSS, inspirado em Scribblenauts) para simular caminhada/corrida sem depender de spritesheets de frames. Ao detalhar essa implementação, ficou claro que o custo de arte necessário — pivots consistentes por peça, corte preciso tronco/braço, ajuste fino de amplitude e sincronização de profundidade entre braços — era desproporcional ao retorno, considerando que o desenvolvimento é de uma pessoa só e que essa animação serviria apenas para ambientação (NPCs andando), não para uma mecânica central do jogo.

## Decisão

1. **O personagem não anda pela cidade.** Fica restrito à **aba de detalhes do personagem**, fora da `IsoGrid` — sem posicionamento isométrico, sem coordenadas `--x/--y/--z`, sem depth-sorting com prédios.
2. **NPCs ambiente andando pela cidade são descartados.** Não haverá população ambiente reaproveitando o personagem por ora; se a cidade precisar de "vida" no futuro, será resolvido por outro meio, não pelo rig do personagem.
3. **Pathfinding é descartado** — não há mais necessidade de mover personagem ou NPC pela malha de ruas (`road`/`road-l`/`road-r`/`road-i`).
4. **Todo o rig de caminhada/corrida é substituído por uma animação de idle simples de respiração**: tronco e braços (esquerdo/direito) se movem **juntos, como um grupo único** (ex.: `translateY`/`scale` sutil aplicado a um wrapper que contém as três peças), em vez de cada braço girar de forma independente. Isso evita o gap visual que apareceria no ombro se o tronco "respirasse" e o braço ficasse parado, sem reintroduzir a complexidade da corrida. Isso elimina a necessidade de:
   - girar pernas em torno do quadril — pernas ficam totalmente estáticas;
   - amplitude/fase invertida entre braço e perna (referência Scribblenauts);
   - alternar `z-index` do braço entre frente/trás do tronco (não há mais cruzamento entre braço e tronco no idle, então essa sincronização deixa de ser necessária).
5. **Tronco e braços continuam como peças separadas** (reaproveitando o corte já definido: tronco, braço esquerdo, braço direito, a partir da mesma arte de referência) — não por precisarem de rotação independente, mas para permitir esse movimento leve de respiração sem exigir uma peça só. Pernas + calçado, sem rotação nenhuma no idle, podem voltar a ser tratadas como totalmente estáticas.
6. **O restante da decisão de composição em camadas se mantém**: personagem montado por peça via ids, PNG por peça com âncora fixa por categoria, acessório restrito à cabeça.
7. **Campos de aparência persistidos por personagem**: `skinTone` (tom de pele, escala fixa de `0`, mais claro, a `6`, mais escuro), `hairType` (tipo de cabelo), `eyeType` (tipo de olho), `face` (rosto), `accessory` (acessório de cabeça, opcional — `null` = nenhum equipado), `top` (blusa), `pants` (calça), `shoes` (sapatos). Cada campo guarda o id da peça equipada (ou o índice, no caso de `skinTone`); a resolução do id para o asset/PNG fica na composição (`assembleAvatar`), não no banco. `skinTone`, `hairType` e `eyeType` são escolhidos na criação do personagem; os demais (`face`, `accessory`, `top`, `pants`, `shoes`) nascem com um valor padrão e só são editados depois, pelo guarda-roupa — cada campo é independente dos outros.
8. **Identidade do personagem**: `firstName`, `lastName` e `gender` (`male` | `female` | `other`), definidos na criação e não editáveis pelo guarda-roupa (são identidade, não visual).
9. **Skills são um catálogo dinâmico, não um enum fixo**: `Character.skills` é um mapa livre `{ [skillId]: pontos }`, validado contra `SKILL_DEFINITIONS` (lista de `{ id, label }` em `domain/entities/skill.ts`). Adicionar uma skill nova é só acrescentar uma entrada nessa lista — não exige migração de schema nem mudança de tipo. Na criação, o jogador distribui um orçamento fixo de **4 pontos** entre as skills do catálogo (`INITIAL_SKILL_POINTS_BUDGET`); o backend rejeita alocações com id desconhecido, pontos negativos/fracionários, ou soma diferente de 4. As skills reais ainda não foram definidas pelo game design (ver docs/game-design/skills-and-study.md) — o catálogo atual é só um placeholder para viabilizar a tela de criação.

## Justificativa

Sendo projeto solo, o item mais caro do plano original era puramente de arte e ajuste fino visual (rig de corrida crível, pivots alinhados entre dezenas de combinações de peça) — um investimento que não se paga para um recurso de ambientação que não é core do jogo. Isso está alinhado a [[../vision/principles]] (Idle First: o jogo não é dirigido por tempo real ou fidelidade de movimento). Restringir o personagem à aba de detalhes preserva o que o jogador realmente usa e vê — a customização — e descarta só a parte cara e de menor retorno (o personagem se movimentando pela cidade).

## Consequências

- A cidade isométrica (`IsoGrid`/`Block`) não precisa de nenhuma integração com avatar/personagem — renderiza só o mundo (prédios, ruas). Não há mais decisão pendente de DOM vs Canvas para avatares, porque não existem avatares na cidade.
- A separação de tronco e braços em peças distintas passa a existir só para viabilizar o movimento conjunto de respiração (grupo único), não para rotação independente — o ponto de encaixe no ombro ainda precisa ser consistente entre variações de tronco/roupa, mas não há mais fase/amplitude por lado a calibrar.
- `assembleAvatar` (função pura de composição de camadas por id) continua útil, mas seu único consumidor passa a ser a aba de detalhes do personagem.
- Pernas + calçado deixam de precisar de pivot no quadril — sem rotação, essa peça é tratada como estática como as demais.
- `Character` (backend) ganha um sub-objeto `appearance` com os seis campos do item 7, persistido junto do restante do personagem em `characters`. Troca de aparência é uma operação própria (`PATCH /characters/:id/appearance`), sem relação com o ciclo de recompute de atributos (wryd) — ver `apps/api/src/character`.

## Referências

- [[../game-design/character-needs]]
- [[../game-design/city-and-world]]
- [[../game-design/player-control]]
- [[../ui-ux/visual-art-style]]
- [[../vision/principles]]
- [[0008-luv-ui-como-design-system-obrigatorio]]
