# Plano — Clima e temperatura

## Status

✅ Implementado. Backend: `apps/api/src/world/domain/entities/weather.entity.ts` (`currentWeather`), embutido em `GET /world/clock`. Frontend: `apps/game/src/pages/home/hud/WorldClockPanel.tsx` mostra ícone + temperatura + label do clima. Ver [[../../../technical/clima-e-temperatura]] pro design completo.

## Objetivo técnico

Adicionar um pequeno sistema de clima (Ensolarado, Chuvoso, Neblina) e temperatura (Celsius) ao mundo do jogo, reforçando a identidade de Luvia como cidade chuvosa — só cosmético nesta fase, sem efeito de jogabilidade e sem chuva visual ainda.

## Escopo

- Três tipos de clima, com chuva pesada no sorteio (Luvia é uma cidade chuvosa).
- Temperatura (Celsius) determinada pelo clima do dia — cada tipo tem sua própria faixa.
- Determinístico a partir do `day` já exposto por `GET /world/clock` (mesmo dia = mesmo clima/temperatura pra todo mundo), sem persistência própria.
- HUD (`WorldClockPanel.tsx`) mostra ícone + temperatura + nome do clima, ao lado da hora/dia da semana já existentes.

## Fora de escopo

- Qualquer efeito de jogabilidade do clima (atividades, energia, economia) — ver [[../../../decisions/0029-clima-cosmetico-e-cidade-chuvosa]].
- Efeito visual de chuva na cidade isométrica (partículas, overlay, som) — candidato de polish visual futuro, não implementado agora.
- Estações do ano ou tendência de longo prazo — clima é um sorteio independente por dia.

## Onde no código

- Backend: `apps/api/src/world/domain/entities/weather.entity.ts`, consumido por `get-world-clock.use-case.ts`.
- Frontend: `apps/game/src/lib/api.ts` (`Weather`/`WeatherType`), `apps/game/src/pages/home/useWorldClock.ts` (estado), `apps/game/src/pages/home/hud/WorldClockPanel.tsx` (exibição).

## Depende de

- Relógio do mundo (plano 08) — clima deriva do `day` que esse plano já expõe.

## Referências

- [[../../../decisions/0029-clima-cosmetico-e-cidade-chuvosa]]
- [[../../../technical/clima-e-temperatura]]
- [[08-relogio-do-mundo-e-ciclo-dia-noite]]
