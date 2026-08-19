# Plano — Criação de Personagem

## Status

✅ Concluído

## Objetivo técnico

Permitir que o jogador crie seu personagem: identidade (nome, gênero — não editável depois) e aparência inicial (tom de pele, cabelo, olho), num fluxo em etapas.

## Escopo

- Bounded context `character` (domain/application/infrastructure/presentation).
- `Character.create()`: recebe identidade + aparência inicial, nasce com `happiness`/`energy` em 100 e `money`/`fame` em 0.
- Endpoint `POST /characters`.
- Frontend: fluxo em `LuvStepper` (`CharacterCreatePage`), separado em controller/hook/view (ver [[../../../decisions/0022-paginas-separadas-em-controller-hook-e-view]]).

## Onde no código

- `apps/api/src/character/domain/entities/character.entity.ts`
- `apps/api/src/character/application/use-cases/create-character.use-case.ts`
- `apps/game/src/pages/character-create/`

## Depende de

- Autenticação (plano 02).

## Referências

- [[../../../decisions/0015-multiplos-personagens-por-conta]]
- [[../../../decisions/0022-paginas-separadas-em-controller-hook-e-view]]
