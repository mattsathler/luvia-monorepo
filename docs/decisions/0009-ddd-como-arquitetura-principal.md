# 0009 — DDD como arquitetura principal do projeto

## Contexto

O monorepo possui múltiplos apps e pacotes (`apps/game`, `apps/docs`, `packages/luv-ui`) e um domínio de jogo com várias áreas já documentadas (personagem, empresas, economia, cidade, relacionamentos, eventos). Era necessário definir uma arquitetura única para organizar regras de negócio, casos de uso e UI de forma consistente.

## Decisão

Domain-Driven Design (DDD) é a arquitetura principal do jogo. Todos os componentes, rotas e implementações devem seguir rigorosamente essa arquitetura, em todo o monorepo.

Cada bounded context é organizado em quatro camadas: `domain`, `application`, `infrastructure` e `presentation`. Os bounded contexts seguem as áreas de jogo já documentadas em `docs/game-design/` (Character, Employment, Company, Economy, City, Relationship, Social, Event).

## Justificativa

Garante consistência arquitetural entre `apps/game`, `apps/docs` e `packages/luv-ui`, e mantém as regras de negócio isoladas de detalhes de UI e infraestrutura, o que suporta o princípio de baixo acoplamento já registrado em [[../technical/code-organization]].

## Consequências

- Nenhuma regra de negócio deve ser implementada diretamente em componentes de `presentation` (rotas, componentes React); ela pertence à camada `domain`/`application`.
- Novas features devem ser mapeadas para um bounded context existente antes de serem implementadas; a criação de um novo bounded context deve ser registrada como uma nova decisão.
- A camada `domain` não pode depender de `application`, `infrastructure` ou `presentation`.
- A estrutura de pastas dentro de cada camada ainda não foi definida em detalhe (ver [[../technical/architecture]], seção Observações).

## Referências

- [[../technical/architecture]]
- [[../technical/code-organization]]
- [[../technical/tech-stack]]
