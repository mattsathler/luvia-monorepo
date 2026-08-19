# M05 — Relacionamentos & Social

## Objetivo

Entregar o pilar Social First do jogo (ver [[../../vision/principles]]): jogadores passam a se conectar entre si através de ações do jogo, sem chat.

## Status

⏳ Planejada.

## Planos

1. [[planos/01-bounded-context-de-relacionamento]]
2. [[planos/02-acao-visitar]]
3. [[planos/03-acao-presentear]]
4. [[planos/04-convite-para-evento]]
5. [[planos/05-efeito-de-evento-compartilhado]]
6. [[planos/06-listagem-de-relacionamentos-ui]]

## Escopo

- **Bounded context de relacionamento**: níveis progressivos — conhecido, amigo, melhor amigo, namoro, casamento (ver [[../../game-design/relationships]]).
- **Interações via ação, não texto**: ex. visitar o lote de outro jogador, convidar pra evento, presentear — cada ação evolui (ou não) o relacionamento. Explicitamente **sem chat em tempo real, sem chat global, sem chat privado** (ver [[../../decisions/0004-sem-chat-em-tempo-real]]).
- **Eventos passam a afetar relacionamento**: fecha a lacuna deixada pela M04 (evento já afetava Fama/skills, agora também relacionamento entre quem participou junto).
- Listagem de relacionamentos do personagem (quem é amigo, cônjuge, etc.) na UI.

## Fora do escopo

- Qualquer forma de mensagem de texto livre entre jogadores.
- Presença em tempo real ("fulano está online agora").
- Efeitos mecânicos profundos de casamento (ex.: economia compartilhada) — fica pra M06 se fizer sentido depois que empresas existirem.

## Estimativa

**2–3 semanas.** Escopo novo de verdade (não reaproveita tanto quanto M03/M04): modelar relacionamento como grafo entre personagens, decidir as regras de progressão entre níveis, e desenhar a UI de interação sem cair em chat. É a primeira milestone genuinamente multiplayer (depende de outro personagem existir e agir).

## Referências

- [[../../game-design/relationships]]
- [[../../game-design/social-interactions]]
- [[../../game-design/events]]
- [[../../decisions/0004-sem-chat-em-tempo-real]]
- [[../../vision/principles]] (Social First)
