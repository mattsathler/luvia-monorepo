# 0017 — Todo endpoint da API deve ser documentado em docs/technical/api

## Contexto

O backend já tem endpoints reais (`Account`, `Character`, health check) sem nenhuma documentação centralizada — a única forma de saber o que a API expõe era ler o código dos controllers. Isso não escala conforme mais bounded contexts forem implementados.

## Decisão

Toda vez que um endpoint novo for criado (ou um existente mudar de contrato), ele **deve** ser documentado em `docs/technical/api/`, na pasta do seu bounded context correspondente. A estrutura segue uma pasta por módulo (`docs/technical/api/<módulo>/endpoints.md`), espelhando os bounded contexts definidos em [[../technical/architecture]].

## Justificativa

Uma doc de API só é confiável se for mantida em sincronia com o código no momento em que ele muda — documentar depois, em lote, tende a ficar defasado. Separar por pasta/módulo mantém a doc organizada conforme novos bounded contexts (Employment, Company, Economy etc.) forem implementados.

## Consequências

- Nenhum endpoint deve ser considerado "pronto" sem sua entrada correspondente em `docs/technical/api/<módulo>/endpoints.md`.
- Cada entrada de endpoint deve cobrir: método + rota, autenticação exigida, body/resposta, erros possíveis, e pontos de importância (efeitos colaterais, regras de posse, decisões referenciadas).
- Ao criar um bounded context novo, criar a pasta correspondente em `docs/technical/api/` e adicioná-la à tabela em `docs/technical/api/README.md`.

## Referências

- [[../technical/api/README]]
- [[../technical/architecture]]
