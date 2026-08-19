# Roadmap

## Objetivo

Definir o caminho do MVP até o produto final de Luvia, em milestones objetivas, com Definition of Done verificável e prazo estimado.

## Como usar isto

Cada milestone vive na sua própria pasta (`NN-slug/`), com dois arquivos:

- `descricao.md` — o que a milestone entrega, o que fica fora dela, e a estimativa de prazo com a justificativa.
- `dod.md` — checklist objetivo do que precisa estar verdadeiro pra considerar a milestone concluída. Nada de "está quase pronto" — ou o item está marcado, ou a milestone não fechou.

As milestones são sequenciais e cumulativas: a M03 assume que tudo da M02 já está pronto, e assim por diante. Não pular a ordem.

## Base da estimativa de prazo

Luvia é desenvolvido por uma pessoa só, em ritmo não-linear (dias cheios de commits intercalados com dias ou semanas sem nenhum). A M01 (fundação — ver abaixo) levou **~19 dias corridos** (01–19 ago) num ritmo assim: a maioria dos dias sem commit nenhum, alguns dias com dezenas. As estimativas das milestones seguintes usam essa M01 como referência de "quanto dá pra entregar" por semana de trabalho ativo, ajustado pelo escopo relativo de cada uma — não são prazos de calendário fechados, são faixas.

**Cada milestone deve recalibrar a estimativa das seguintes ao fechar**, atualizando o "Prazo real" no `descricao.md` dela e revisando as milestones à frente se o ritmo observado divergir muito do estimado.

## Milestones

| # | Milestone | Status | Estimativa |
| --- | --- | --- | --- |
| [01](01-fundacao-e-personagem/descricao.md) | Fundação & Personagem | ✅ Concluída | 01–19 ago (real) |
| [02](02-loop-de-vida-wryd/descricao.md) | Loop de Vida (WRYD) — **MVP** | ⏳ Planejada | 1–2 semanas |
| [03](03-cidade-e-lar/descricao.md) | Cidade & Lar | ⏳ Planejada | 2–3 semanas |
| [04](04-fama-e-eventos/descricao.md) | Fama & Eventos | ⏳ Planejada | 1–2 semanas |
| [05](05-relacionamentos-e-social/descricao.md) | Relacionamentos & Social | ⏳ Planejada | 2–3 semanas |
| [06](06-economia-de-jogadores/descricao.md) | Economia de Jogadores | ⏳ Planejada | 4–6 semanas |
| [07](07-polimento-e-lancamento/descricao.md) | Polimento & Lançamento | ⏳ Planejada | 2–4 semanas |

**Total estimado pós-fundação até "produto final" v1**: ~12–20 semanas de trabalho ativo (não de calendário — no ritmo observado, calendário real deve ser bem mais longo). Ver [[../vision/final-goal]] pra o que "produto final" significa aqui: uma cidade viva, não um jogo "vencível".

A M02 é o marco do **MVP**: é a primeira milestone em que Luvia é jogável de ponta a ponta (login → personagem → decisão de atividade → tempo passa → estado muda). Tudo antes disso é fundação; tudo depois é expansão de escopo sobre um jogo que já funciona.

## Referências

- [[../vision/overview]]
- [[../vision/principles]]
- [[../vision/final-goal]]
