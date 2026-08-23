# Plano — Skills: catálogo e balanceamento

## Status

🔄 Catálogo de conteúdo fechado (21 skills, desenhadas contra a hierarquia de cargos de [[../../02-loop-de-vida-wryd/planos/04-empregos-publicos-e-hierarquia-de-cargos]]) — falta só o balanceamento fino (M08, ver `Depende de` abaixo). Personagem nasce com nível 0 em tudo (ver [[../../../decisions/0024-personagem-nasce-sem-skills]]); este plano é só sobre o catálogo em si, não sobre um orçamento de criação.

## Objetivo técnico

O catálogo de skills (`SKILL_DEFINITIONS`) tem os nomes/pesos ainda como placeholder de balanceamento (como qualquer taxa do jogo), mas o **conteúdo** (quais skills existem, e pra quais cargos cada uma importa) já reflete o game design real — não é mais só as 4 skills de validação do mecanismo. A atividade "Estudar" (que faria skills crescerem passivamente) segue descartada, sem redesenho — hoje as skills só afetam eficiência de trabalho (ver [[../../../game-design/jobs]]), sem nenhum jeito de subir de nível ainda.

## Escopo

- `SKILL_DEFINITIONS` tem 21 entradas: as 4 originais de validação (`intelligence`, `charisma`, `creativity`, `strength`) mais 17 novas (`dexterity`, `endurance`, `discipline`, `leadership`, `medicine`, `law`, `investigation`, `marksmanship`, `tactics`, `accounting`, `bureaucracy`, `construction`, `engineering`, `metallurgy`, `mechanics`, `electronics`, `teaching`) — cada uma usada por pelo menos um cargo do catálogo de prédios (ver [[../../../game-design/jobs]]).
- Definir se o catálogo pode crescer depois do lançamento sem migração (hoje `skills` já é um mapa livre `id -> pontos`, então tecnicamente sim — só falta a decisão de produto).
- Nenhum orçamento inicial pra balancear mais — o balanceamento relevante agora é como as skills afetam a eficiência de trabalho (M02, plano 04 — empregos públicos e hierarquia de cargos) e, mais tarde, o balanceamento fino da M08.

## Onde no código

- `apps/api/src/character/domain/entities/skill.ts`

## Depende de

Nenhuma pra começar, mas o balanceamento de crescimento de verdade só faz sentido depois que empregos públicos existirem — ver [[../../02-loop-de-vida-wryd/planos/04-empregos-publicos-e-hierarquia-de-cargos]] e [[../../08-polimento-e-lancamento/planos/03-balanceamento-de-taxas]].

## Referências

- [[../../../decisions/0024-personagem-nasce-sem-skills]]
- [[../../../game-design/skills-and-study]]
- [[../../../game-design/jobs]]
