# M03 — Cidade & Lar

## Objetivo

Dar ao jogador um lugar: a cidade única e persistente de Luvia (ver [[../../game-design/city-and-world]]) passa a existir de verdade dentro do jogo, e cada jogador possui um lote residencial nela.

## Status

⏳ Planejada.

## Escopo

- **Cidade no jogo**: hoje `IsoGrid`/`Block`/`DayCycleControl` (grid isométrico, blocos, ciclo dia/noite) só existem como showcase em `apps/docs` — passam a ser usados de verdade numa tela de cidade em `apps/game`.
- **Bounded context `city`/`lot` no backend**: persistência de lotes, dono, tipo, posição na grade.
- **Lote residencial**: todo personagem recebe (ou reivindica) 1 lote residencial (ver [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]) — sem lote comercial/industrial ainda, esses vêm na M06 junto com empresas.
- **Evolução simples do lote**: melhorias pré-definidas (não construção manual livre — ver [[../../game-design/lots-and-construction]]), refletidas visualmente na cidade.
- Navegação: jogador consegue ir da tela de vida (M02) pra cidade e ver seu lote nela.

## Fora do escopo

- Lote comercial e industrial (dependem de empresas — M06).
- Qualquer forma de construção manual/livre — explicitamente proibido pelo game design.
- NPCs ou outros jogadores visíveis andando na cidade (descartado — ver [[../../decisions/0019-personagem-montado-em-camadas-com-rig-2d]], item 2).
- Interação social dentro da cidade (M05).

## Estimativa

**2–3 semanas.** Os componentes visuais de grid isométrico já existem e estão testados (`packages/luv-ui`), o que remove a maior incerteza técnica (renderização isométrica). O trabalho novo é: bounded context de lotes no backend (seguindo o mesmo padrão DDD já estabelecido por `account`/`character`), e a tela de cidade no frontend consumindo isso.

## Referências

- [[../../game-design/city-and-world]]
- [[../../game-design/lots-and-construction]]
- [[../../decisions/0005-cidade-unica-persistente]]
- [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]
- [[../../decisions/0009-ddd-como-arquitetura-principal]]
