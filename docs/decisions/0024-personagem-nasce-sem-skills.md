# 0024 — Personagem nasce sem skills, sem alocação inicial de pontos

## Contexto

A criação de personagem (ver [[0019-personagem-montado-em-camadas-com-rig-2d]]) incluía um passo em que o jogador distribuía um orçamento fixo de pontos (`INITIAL_SKILL_POINTS_BUDGET`, 4 pontos) entre as skills do catálogo (`intelligence`, `charisma`, `creativity`, `strength`). Era uma decisão provisória, já marcada como placeholder no código, aguardando o game design de [[../game-design/skills-and-study]] amadurecer.

## Decisão

Não existe mais alocação inicial de pontos de skill na criação de personagem. Todo personagem nasce com nível 0 em todas as skills (mapa `skills` vazio). Skills só crescem jogando — a atividade "Estudar" foi descartada como mecanismo (ver [[../game-design/skills-and-study]]); hoje o caminho mais concreto é a eficiência de trabalho em empregos públicos, que depende das skills do cargo (ver [[../roadmap/02-loop-de-vida-wryd/planos/04-empregos-publicos-e-hierarquia-de-cargos]]).

## Justificativa

Remove uma decisão de otimização (alocar pontos "certos" logo na criação, sem contexto nenhum do jogo ainda) que não se sustenta bem contra Cozy First (ver [[../vision/principles]]): o jogador mal conhece o jogo e já precisaria tomar uma decisão de build permanente. Progressão de skill vem só de jogar.

## Consequências

- `POST /characters` não aceita mais um campo `skills` — qualquer valor enviado é ignorado (`ValidationPipe` com `whitelist: true`).
- `CreateCharacterUseCase`/`Character.create()` sempre criam o personagem com `skills: {}`.
- A tela de criação de personagem perdeu o passo "Skills" — só restam "Informações" e "Personalização".
- `SKILL_DEFINITIONS`/`SKILL_IDS` (catálogo de skills) continuam existindo — ainda necessários pro endpoint `GET /characters/skills` e pra quando "Estudar" for implementado.
- `INITIAL_SKILL_POINTS_BUDGET` e `isValidInitialSkillAllocation` foram removidos do domínio — não existe mais orçamento inicial pra validar.

## Referências

- [[../game-design/skills-and-study]]
- [[../vision/principles]]
- [[../roadmap/01-fundacao-e-personagem/planos/07-skills-catalogo-e-balanceamento]]
