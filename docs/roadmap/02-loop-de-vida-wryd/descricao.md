# M02 — Loop de Vida (WRYD) — MVP

## Objetivo

Tornar Luvia jogável de ponta a ponta: o jogador loga, escolhe uma atividade pro personagem, e vê o estado dele mudar sozinho com o tempo. Esta é a milestone de **MVP** — depois dela, Luvia já é um jogo, só que pequeno.

## Status

⏳ Planejada.

## Escopo

- **Dashboard funcional** substituindo o placeholder atual de `HomePage`: mostra felicidade, energia, dinheiro e fama do personagem (ver [[../../game-design/character-needs]]).
- **Seletor de atividade** (ver [[../../game-design/wryd-activity-system]]): jogador escolhe entre Ocioso, Descansar, Trabalhar (emprego público, sempre disponível — ver [[../../game-design/jobs]]) e Estudar.
- **Nova atividade "Estudar"**: adicionar ao backend (`Activity` type, taxa de efeito) — aumenta pontos de uma skill escolhida ao longo do tempo (ver [[../../game-design/skills-and-study]]).
- **Cliente de API no frontend** pra `POST /characters/:id/activity` (hoje só existe no backend).
- **Polling do estado do personagem**: frontend consulta o backend periodicamente pra refletir o efeito do tick sem precisar recarregar a página (ver [[../../technical/simulation-tick]] — intervalo de polling é uma das decisões pendentes desse documento; fechar aqui).
- Indicador de Fama visível na UI (ver [[../../game-design/progression-fame]]) — mesmo sem nenhuma fonte de fama além de um valor inicial fixo por enquanto.

## Fora do escopo

- Cidade, lotes, construção — personagem continua restrito à aba de detalhes (ver [[../../decisions/0019-personagem-montado-em-camadas-com-rig-2d]]).
- Eventos, relacionamentos, empresas, contratos, economia — tudo isso vem depois.
- Múltiplos empregos ou qualquer sistema de emprego privado (só o emprego público genérico existe aqui).
- Balanceamento fino das taxas de efeito — os valores atuais (`RATES_PER_MINUTE`) são placeholder e continuam sendo até M07.

## Estimativa

**1–2 semanas.** A parte estrutural mais arriscada (tick em lote, recompute lazy, prorata de troca de atividade) já foi entregue na M01 e está testada — o trabalho daqui é majoritariamente frontend (dashboard, seletor, polling) mais uma atividade nova no backend (Estudar), que segue o mesmo padrão das duas que já existem.

## Referências

- [[../../game-design/wryd-activity-system]]
- [[../../game-design/character-needs]]
- [[../../game-design/skills-and-study]]
- [[../../game-design/progression-fame]]
- [[../../game-design/jobs]]
- [[../../technical/simulation-tick]]
- [[../../vision/principles]] (Idle First, Cozy First)
