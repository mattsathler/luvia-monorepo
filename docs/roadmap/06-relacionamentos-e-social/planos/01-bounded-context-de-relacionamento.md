# Plano — Bounded context de relacionamento

## Status

⏳ Pendente

## Objetivo técnico

Modelar o relacionamento entre dois personagens como uma entidade própria, com nível e histórico de progressão.

## Escopo

- Entidade `Relationship`: par de personagens, nível (conhecido, amigo, melhor amigo, namoro, casamento — ver [[../../../game-design/relationships]]), pontos/contador de progresso pro próximo nível.
- Regras de transição: o que evolui o nível, se existe regressão por inatividade (decisão de game design a fechar aqui — "Long Term Progression" sugere que não deveria ser fácil regredir nem avançar, ver [[../../../vision/principles]]).
- Casamento como caso especial: provavelmente exclusivo (um personagem só pode ter um cônjuge por vez) — decidir e validar.
- Endpoints básicos: consultar relacionamento entre dois personagens, listar os relacionamentos de um personagem.

## Onde no código

- Novo: `apps/api/src/relationship/` (domain/application/infrastructure/presentation)

## Depende de

Nenhuma.

## Referências

- [[../../../game-design/relationships]]
- [[../../../vision/principles]] (Social First, Long Term Progression)
