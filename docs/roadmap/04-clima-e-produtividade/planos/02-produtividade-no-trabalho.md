# Plano — Produtividade no trabalho

## Status

⏳ Pendente

## Objetivo técnico

Substituir a taxa de dinheiro/hora fixa de `working` (`RATES_PER_MINUTE.working.money`) por uma taxa que escala com o estado real do personagem — energia e felicidade —, e incorporar um efeito mensurável da hora do jogo.

## Escopo

- Definir uma função de produtividade `productivity(energy, happiness) → multiplicador` aplicada sobre a taxa-base de `working.money` (ex.: baixa energia/felicidade reduz o multiplicador; alta energia/felicidade aumenta, dentro de um teto razoável — valores exatos ficam para o plano de balanceamento da M08, aqui só o mecanismo).
- Fechar o mecanismo exato de como a hora do jogo entra nessa conta — em aberto (ver [[../../../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]], ponto 4): candidatos incluem uma curva de produtividade por hora do dia (ex.: menor de madrugada) aplicada como multiplicador adicional, ou incorporada na mesma função de energia/felicidade. Decisão de qual abordagem fica registrada aqui quando este plano for implementado, não antes.
- Clima/temperatura **não** entram diretamente nesta função — o efeito deles é só via felicidade (plano 01).
- Testes cobrindo: produtividade baixa com energia/felicidade baixas, produtividade alta com ambas altas, e o caso de prorata (energia/felicidade mudando minuto a minuto durante o próprio trabalho, já que `working` também consome energia).

## Onde no código

- `apps/api/src/character/domain/entities/activity.ts` (`RATES_PER_MINUTE`, `applyActivityEffect`)
- `apps/api/src/character/domain/entities/character.entity.ts` (`recomputeUntil`)
- `apps/api/src/world/domain/entities/world-clock.entity.ts` (hora do jogo, já exposta)

## Depende de

[[01-desconforto-termico-afeta-felicidade]] — não é uma dependência técnica dura, mas faz sentido implementar depois: valida o ponto de integração `world`→`character` com o caso mais simples (felicidade) antes de tocar a taxa de dinheiro (efeito econômico direto, mais sensível a acertar).

## Referências

- [[../../../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]]
- [[../../../technical/simulation-tick]]
- [[../../../technical/relogio-do-mundo]]
- [[../../../game-design/jobs]]
- [[../../08-polimento-e-lancamento/planos/03-balanceamento-de-taxas]]
