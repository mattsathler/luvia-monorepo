# 0029 — Clima e temperatura são cosméticos, e Luvia é uma cidade chuvosa

> **Superada parcialmente pela [[0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]]**: o ponto 1 (sem efeito de jogabilidade) foi revogado. Os demais pontos desta decisão continuam valendo.

## Contexto

O jogo já tem um relógio de mundo global ([[0028-relogio-do-mundo-global-sincronizado-do-backend]]), mas nenhuma noção de clima/temperatura. Era necessário definir se clima afeta jogabilidade (mecânicas, atividades, economia) ou é só um elemento visual/atmosférico, e como ele se relaciona com o próprio nome do jogo — "Luvia" remete a "chuva".

## Decisão

1. **Clima e temperatura são puramente cosméticos nesta fase** — não afetam nenhuma mecânica (atividades, WRYD, economia, energia/felicidade do personagem etc.). Só aparecem na HUD.
2. **Três tipos de clima**: Ensolarado (`sunny`), Chuvoso (`rainy`), Neblina (`foggy`).
3. **Temperatura em Celsius**, e é o clima que determina a temperatura (cada tipo tem sua própria faixa), não o contrário.
4. **Luvia é uma cidade chuvosa** — chuva é o clima mais comum (peso maior no sorteio), não uma entre três opções equiprováveis. Reforça a identidade do próprio nome do jogo (ver [[../game-design/city-and-world]]).
5. **Sem chuva visual ainda** — nenhum efeito visual de chuva (partículas, overlay, som) é implementado nesta fase, mesmo quando o clima sorteado é `rainy`. Só o ícone/texto na HUD muda.
6. **Determinístico, sem estado próprio** — clima é uma função pura do `day` do relógio do mundo (mesmo dia sempre produz o mesmo clima/temperatura, pra todo mundo), sem tick, sem persistência — ver [[../technical/clima-e-temperatura]].

## Justificativa

Cozy First: clima que afetasse mecânicas de jogo (ex.: penalidade de energia na chuva) adicionaria fricção e imprevisibilidade num jogo que busca ser tranquilo — fica reservado como decisão futura deliberada, não um efeito colateral de adicionar clima. Manter clima determinístico (em vez de aleatório a cada chamada) preserva a consistência do mundo único e compartilhado ([[0005-cidade-unica-persistente]]): todos os jogadores veem o mesmo clima ao mesmo tempo, como já acontece com hora/dia da semana.

## Consequências

- Nenhuma feature deve assumir que o clima afeta stats, custos ou disponibilidade de atividades — isso exigiria uma decisão nova, revogando esta.
- Efeito visual de chuva (partículas, som, overlay na cidade) fica registrado como trabalho futuro — ver [[../technical/clima-e-temperatura]], seção Observações.
- Mudar os pesos de sorteio (ex.: se chuva ficar rara demais ou comum demais na prática) é um ajuste de tuning, não uma mudança de decisão.

## Referências

- [[../technical/clima-e-temperatura]]
- [[0028-relogio-do-mundo-global-sincronizado-do-backend]]
- [[0005-cidade-unica-persistente]]
- [[../game-design/city-and-world]]
