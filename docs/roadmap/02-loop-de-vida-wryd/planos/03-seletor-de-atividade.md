# Plano — Seletor de atividade

## Status

⏳ Pendente

## Objetivo técnico

Deixar o jogador escolher o que o personagem está fazendo — o coração do sistema WRYD (ver [[../../../game-design/wryd-activity-system]]) — que hoje só existe como endpoint, sem nenhuma interface.

## Escopo

- UI com as atividades disponíveis nesta milestone: Ocioso, Descansar, Trabalhar (emprego público), Estudar (plano 04).
- Indicação clara de qual atividade está ativa agora.
- Ao escolher Estudar, exibir o sub-seletor de qual skill estudar (depende do plano 04 e do catálogo de skills — ver [[../../01-fundacao-e-personagem/planos/07-skills-catalogo-e-balanceamento]]).
- Chamada via o cliente de API do plano 01.

## Onde no código

- `apps/game/src/pages/home/` (dentro do dashboard do plano 02)

## Depende de

- Cliente de API para atividade (plano 01).
- Dashboard de necessidades (plano 02).

## Referências

- [[../../../game-design/wryd-activity-system]]
- [[../../../game-design/jobs]]
