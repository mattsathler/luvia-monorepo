# Estudos e Habilidades

## Objetivo

Definir como o jogador desenvolve habilidades.

## Decisões consolidadas

Todo personagem nasce com nível 0 em todas as habilidades — não existe alocação inicial de pontos na criação (ver [[../decisions/0024-personagem-nasce-sem-skills]]). O jogador pode estudar. Estudar aumenta habilidades.

**O mecanismo de "Estudar" precisa de refino antes de ser implementado** — a ideia original (jogador escolhe "Estudar" como atividade, feito em casa, ganha pontos de skill passivamente) foi descartada por ser rasa demais (bastaria clicar e esperar). O desenho anterior dessa atividade (que existia como plano da M02) foi removido do roadmap — ver [[../roadmap/02-loop-de-vida-wryd/descricao]]. Um novo desenho fica pendente; o próximo marco grande do jogo é Trabalho (ver [[jobs]]), não Estudo.

Habilidades permitem:

- melhores empregos
- promoções
- abrir empresas
- produzir melhor

Nunca existem classes.

O catálogo de skills (`SKILL_DEFINITIONS`, `apps/api/src/character/domain/entities/skill.ts`) tem hoje 21 entradas, desenhadas contra os cargos de emprego público que existem em [[jobs]] (cada skill serve de principal/secundária/terciária em pelo menos um cargo) — deixou de ser as 4 skills de validação inicial, mas os pesos/nomes ainda são **placeholder de balanceamento**, como qualquer taxa do jogo.

## Referências

- [[jobs]]
- [[companies]]
- [[../game-design/player-control]] (sem classes)
- [[../decisions/0024-personagem-nasce-sem-skills]]
