# Plano — Interação com a metrópole

## Status

⏳ Pendente — adicionado depois da primeira versão desta milestone, que só cobria o lote do próprio jogador isolado, sem nenhuma forma de navegar a cidade como espaço compartilhado (ver nota em [[../descricao]]).

## Objetivo técnico

A cidade é única e persistente (ver [[../../../decisions/0005-cidade-unica-persistente]]) — "todos vivem nela". Sem este plano, cada jogador só veria o próprio lote isolado, o que não é uma cidade, é um quintal.

## Escopo

- Tela de cidade (plano 01) renderiza a grade **inteira**, não só o lote do jogador — navegação (pan/zoom ou equivalente) pela cidade completa.
- Lotes de outros jogadores aparecem na grade, com a personalização deles visível (plano 04) — visualização, não interação ainda.
- Jogador consegue abrir o "perfil" de um lote alheio (dono, nível — sem nenhuma ação social ainda, isso é escopo da M05).
- Esta é a infraestrutura de navegação que a M05 (ação "Visitar") vai consumir — este plano não inclui nenhuma ação, só a capacidade de ver e localizar outros lotes.

## Onde no código

- `apps/game/src/pages/city/`
- `apps/api/src/lot/` (endpoint de listagem pública de lotes da cidade)

## Depende de

- Cidade isométrica no jogo (plano 01).
- Personalização de lote (plano 04, pra ter algo visual pra mostrar nos lotes alheios).

## Referências

- [[../../../decisions/0005-cidade-unica-persistente]]
- [[../../../game-design/city-and-world]]
- [[../../05-relacionamentos-e-social/planos/02-acao-visitar]]
