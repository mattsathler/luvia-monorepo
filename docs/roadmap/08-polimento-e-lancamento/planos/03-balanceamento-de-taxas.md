# Plano — Balanceamento de taxas

## Status

⏳ Pendente

## Objetivo técnico

Todas as taxas de efeito introduzidas desde a M01 (`RATES_PER_MINUTE` e equivalentes em eventos/produção/skills) são placeholder — este plano é revisá-las contra "Long Term Progression" de verdade (ver [[../../../vision/principles]]), não em teoria.

## Escopo

- Revisar taxas de: atividades WRYD (M01/M02), eventos (M05), produção industrial (M07), progressão de skill (M01, plano 07, e M02, plano 04).
- Validar que nada é maximizável em poucos dias de jogo real.
- Registrar os valores finais escolhidos e o motivo (mesmo que ainda sujeitos a ajuste pós-lançamento).

## Onde no código

- `apps/api/src/character/domain/entities/activity.ts`, `skill.ts`
- `apps/api/src/company/` (produção)

## Depende de

- Todas as milestones anteriores (M01–M07), já que toca taxa de cada uma.

## Referências

- [[../../../vision/principles]] (Long Term Progression)
- [[../../01-fundacao-e-personagem/planos/07-skills-catalogo-e-balanceamento]]
