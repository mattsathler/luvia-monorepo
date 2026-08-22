# 0030 — Clima, temperatura e hora do jogo passam a afetar felicidade e produtividade

## Contexto

A [[0029-clima-cosmetico-e-cidade-chuvosa]] fixou clima e temperatura como puramente cosméticos, explicitamente registrando que dar a eles efeito de jogabilidade "exigiria uma decisão nova, revogando esta". Esta é essa decisão.

## Decisão

1. **Revoga o ponto 1 da [[0029-clima-cosmetico-e-cidade-chuvosa]]** — clima, temperatura e hora do jogo deixam de ser puramente cosméticos e passam a influenciar diretamente a felicidade e a produtividade no trabalho do personagem. Os demais pontos de 0029 (três tipos de clima, temperatura em °C determinada pelo clima, Luvia como cidade chuvosa, sem chuva visual, determinístico a partir de `day`) continuam valendo — só o efeito de jogabilidade muda.
2. **Desconforto térmico reduz felicidade**: clima frio (`foggy`, a faixa de temperatura mais baixa) enquanto o personagem **não está em casa** reduz felicidade; clima quente (`sunny`, a faixa mais alta) enquanto o personagem **está em casa** também reduz felicidade. "Em casa" é `idle`/`resting` (no lote residencial); "fora de casa" é `working` (única atividade que hoje tira o personagem de casa — ver [[../technical/api/city/endpoints.md]] e `GetCurrentLotUseCase`). Sem desconforto térmico nas demais combinações (calor fora de casa, frio em casa não penalizam).
3. **Produtividade no trabalho é estritamente função de energia e felicidade** — a taxa de dinheiro/hora enquanto `working` deixa de ser uma constante fixa (`RATES_PER_MINUTE.working.money`) e passa a escalar com o estado atual de energia e felicidade do personagem. Clima/temperatura afetam produtividade **indiretamente**, através do efeito que têm sobre a felicidade (ponto 2) — não existe um segundo multiplicador de clima direto sobre a taxa de trabalho.
4. **Hora do jogo também influencia produtividade** — o mecanismo exato (ex.: curva de produtividade por hora do dia, se existe penalidade trabalhando de madrugada) é um ponto em aberto, a ser fechado ao detalhar o plano de implementação desta milestone (ver [[../roadmap/04-clima-e-produtividade/planos/02-produtividade-no-trabalho]]) — registrado aqui como parte do escopo, não como fórmula fechada.

## Justificativa

Cozy First ainda é o princípio, mas "cozy" não significa "sem consequência nenhuma" — um personagem desconfortável (com frio fora de casa, com calor preso em casa) perder felicidade, e um personagem infeliz/cansado produzir menos no trabalho, são efeitos legíveis e coerentes com a fantasia do jogo (viver na cidade, não simular economia abstrata). Substitui uma taxa de trabalho constante por uma que reage ao estado do personagem, dando mais peso a WRYD (dormir e ficar feliz passam a ter retorno econômico direto, não só cosmético).

## Consequências

- `apps/api/src/world/domain/entities/weather.entity.ts` e `character.entity.ts`/`activity.ts` passam a ter uma dependência de domínio que não existia (`world` → efeito sobre `character`) — precisa de um ponto de integração novo (provavelmente no recompute/tick do personagem, que já lê `activity` a cada intervalo).
- `docs/technical/clima-e-temperatura.md` precisa perder a nota "sem efeito de jogabilidade" nas Observações — ver [[../roadmap/04-clima-e-produtividade/descricao]].
- `RATES_PER_MINUTE.working.money` deixa de ser uma constante fixa — qualquer lugar que hoje assume isso (testes, balanceamento) precisa ser revisado.
- Não afeta os pesos de sorteio de clima nem a decisão de não ter chuva visual — isso continua sendo tuning/decisão separada.

## Referências

- [[0029-clima-cosmetico-e-cidade-chuvosa]]
- [[../roadmap/04-clima-e-produtividade/descricao]]
- [[../technical/clima-e-temperatura]]
- [[../game-design/character-needs]]
- [[../game-design/jobs]]
- [[../vision/principles]] (Cozy First)
