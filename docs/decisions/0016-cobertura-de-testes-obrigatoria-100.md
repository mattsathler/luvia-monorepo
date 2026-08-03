# 0016 — Cobertura de testes automatizados obrigatória de 100%

## Contexto

A infraestrutura de testes automatizados já existe (Vitest no frontend, Jest no backend — ver [[0012-testes-automatizados-vitest-jest]]), mas não havia nenhuma política sobre quanto do código precisa estar coberto por testes.

## Decisão

Toda feature ou refactor **exige 100% de cobertura de testes automatizados** antes de ser considerada concluída.

## Consequências

- Nenhuma feature nova ou refactor deve ser dado como pronto sem testes automatizados cobrindo 100% do código novo/alterado.
- Aplica-se a todo o monorepo: frontend (`apps/game`, `apps/docs`, `packages/luv-ui`, via Vitest) e backend (`apps/api`, via Jest).
- **Pendente**: quais métricas exatas de cobertura contam (statements, branches, functions, lines — ou todas), se existem exceções (ex.: arquivos de wiring como `main.ts`, módulos NestJS que só declaram `providers`/`imports`, DTOs sem lógica própria), e como isso será verificado automaticamente (depende do CI, ainda não configurado). Não decidir isso agora — aguardar definição.

## Referências

- [[0012-testes-automatizados-vitest-jest]]
