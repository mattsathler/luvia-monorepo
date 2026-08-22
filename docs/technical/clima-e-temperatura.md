# Clima e temperatura

## Status

✅ Implementado. Backend: `apps/api/src/world/domain/entities/weather.entity.ts` (`currentWeather`), embutido na resposta de `GET /world/clock`. Frontend: `apps/game/src/pages/home/hud/WorldClockPanel.tsx` mostra ícone + temperatura + label do clima, ao lado da hora/dia da semana já existentes.

## Objetivo

Definir como o clima e a temperatura do jogo são calculados, e como aparecem pro jogador — só visual nesta fase, sem efeito de jogabilidade (ver [[../decisions/0029-clima-cosmetico-e-cidade-chuvosa]] pras decisões de mais alto nível).

## Contexto

O relógio do mundo ([[relogio-do-mundo]]) já dá ao jogo uma noção de dia/hora global e sincronizada. Clima é o próximo elemento atmosférico — precisa da mesma propriedade de ser único e compartilhado (todo mundo vê o mesmo clima ao mesmo tempo), mas sem precisar de nenhuma infraestrutura nova: pode ser derivado do `day` que o relógio do mundo já expõe.

## Decisões consolidadas

### Função pura, sem estado

`currentWeather(day)` (`weather.entity.ts`) é determinística: o mesmo `day` sempre produz o mesmo `{ type, temperature }`. Não existe persistência, epoch ou tick próprios — diferente até do relógio do mundo (que precisa persistir sua época), clima não precisa de nada disso porque já deriva de um valor (`day`) que outra parte do sistema já persiste. Um hash determinístico simples (mesmo espírito de `city/domain/entities/hash-noise.ts`, mas uma implementação própria — bounded contexts não importam lógica de domínio um do outro) converte `day` + uma seed fixa (`'luvia-weather-v1'`) num número em `[0, 1)`, usado tanto pra sortear o tipo de clima quanto a temperatura dentro da faixa dele.

### Clima muda uma vez por dia de jogo

Junto com `day` (a cada ~96 minutos reais) — não junto com `hour`. Isso é intencional: clima não deveria mudar minuto a minuto.

### Clima determina a temperatura, com peso pra chuva

Três tipos (`WeatherType`): `sunny`, `rainy`, `foggy`. Pesos de sorteio, **não equiprováveis** — Luvia é uma cidade chuvosa (ver [[../game-design/city-and-world]]):

| Tipo | Peso | Faixa de temperatura (°C) |
| --- | --- | --- |
| `rainy` | 55% | 14–20 |
| `sunny` | 30% | 22–30 |
| `foggy` | 15% | 10–16 |

A temperatura é sorteada dentro da faixa do tipo já escolhido — é o clima que determina a temperatura, nunca o contrário.

### Exposto junto com o relógio, não um endpoint à parte

`weather: { type, temperature }` foi embutido na resposta de `GET /world/clock` (não um `GET /world/weather` separado) — o frontend já sincroniza com esse endpoint periodicamente (ver [[relogio-do-mundo]]), e como clima muda na mesma cadência de `day`, não há necessidade de uma chamada de rede a mais só pra isso.

### Frontend: sem chuva visual

`WorldClockPanel.tsx` mostra um ícone (Material Icons: `wb_sunny`/`grain`/`cloud` pra sunny/rainy/foggy) + a temperatura (`"17°C"`) + o nome do clima em português (`formatWeather`) — só isso. Não existe nenhum efeito visual de chuva na cidade (partículas, overlay, som) ainda, mesmo quando o clima é `rainy` — ver Observações.

## Observações

Fora de escopo nesta fase (registrado, não implementado):

- **Efeito visual de chuva na cidade isométrica** (partículas, overlay semi-transparente, som) — Luvia sendo uma cidade chuvosa, isso é um candidato natural de polish visual futuro, mas depende de decisões de arte/performance não fechadas ainda.
- ~~Qualquer efeito de jogabilidade do clima~~ — passou a existir na [[../roadmap/04-clima-e-produtividade/descricao]]: clima/temperatura afetam felicidade (desconforto térmico) e, indiretamente, produtividade no trabalho (ver [[../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]], que revoga o ponto 1 da [[../decisions/0029-clima-cosmetico-e-cidade-chuvosa]]).
- **Ciclo/estação do ano** — clima hoje não varia por estação nem tem tendência de longo prazo, é só um sorteio pesado por dia independente dos dias anteriores.

## Referências

- [[../decisions/0029-clima-cosmetico-e-cidade-chuvosa]]
- [[../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]]
- [[relogio-do-mundo]]
- [[../game-design/city-and-world]]
- [[../roadmap/03-cidade-e-lar/planos/09-clima-e-temperatura]]
- [[../roadmap/04-clima-e-produtividade/descricao]]
