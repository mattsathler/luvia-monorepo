# M04 — Clima & Produtividade

## Objetivo

Dar consequência de jogabilidade ao clima, à temperatura e à hora do jogo — hoje puramente cosméticos (ver [[../../decisions/0029-clima-cosmetico-e-cidade-chuvosa]]). Um personagem desconfortável (frio fora de casa, calor preso em casa) perde felicidade; e a produtividade no trabalho passa a refletir o estado real do personagem (energia e felicidade), em vez de uma taxa fixa. Ver [[../../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]] pra decisão completa.

## Status

⏳ Planejada.

## Planos

1. [[planos/01-desconforto-termico-afeta-felicidade]]
2. [[planos/02-produtividade-no-trabalho]]

## Escopo

- **Desconforto térmico**: clima frio (`foggy`) enquanto o personagem está fora de casa (`working`) reduz felicidade; clima quente (`sunny`) enquanto está em casa (`idle`) também reduz. Sem efeito nas demais combinações.
- **Produtividade no trabalho**: a taxa de dinheiro/hora de `working` deixa de ser constante (`RATES_PER_MINUTE.working.money`) e passa a escalar com a energia e a felicidade atuais do personagem — quanto mais cansado/infeliz, menos produtivo.
- **Hora do jogo influencia produtividade**: mecanismo exato (curva por hora do dia) é detalhado no plano 02 — registrado como escopo desta milestone, não como fórmula já fechada.
- Ponto de integração entre `world` (clima/hora) e `character` (felicidade/produtividade) — hoje esses bounded contexts não têm nenhuma dependência entre si.

## Fora do escopo

- Efeito visual de chuva na cidade (continua fora de escopo — ver [[../../technical/clima-e-temperatura]]).
- Mudar os pesos de sorteio de clima ou as faixas de temperatura — isso é tuning, não faz parte desta milestone.
- Qualquer efeito de clima/temperatura sobre atividades além de `working` (ex.: `studying` não ganha esse efeito aqui — se fizer sentido, é uma extensão futura).
- Lotes comerciais/industriais e múltiplos empregos — a produtividade aqui só se aplica ao emprego público genérico que já existe (ver [[../../game-design/jobs]]); lotes de trabalho segmentados por tipo vêm na M07 (Economia de Jogadores).

## Estimativa

**1 semana.** Escopo pequeno e bem contido: não introduz nenhuma entidade nova (clima e hora já existem, `working` já existe) — é uma função de efeito nova (`recomputeUntil`/tick já lê `activity` e já teria acesso ao clima do dia via `world`) mais o ponto de integração entre os dois bounded contexts, que hoje não conversam.

## Referências

- [[../../decisions/0029-clima-cosmetico-e-cidade-chuvosa]]
- [[../../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]]
- [[../../technical/clima-e-temperatura]]
- [[../../technical/relogio-do-mundo]]
- [[../../technical/simulation-tick]]
- [[../../game-design/character-needs]]
- [[../../game-design/jobs]]
- [[../../vision/principles]] (Cozy First)
