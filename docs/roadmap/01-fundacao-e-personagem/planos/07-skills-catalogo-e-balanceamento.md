# Plano — Skills: catálogo e balanceamento

## Status

⏳ Pendente — escopo revisado: não existe mais alocação inicial de pontos (ver [[../../../decisions/0024-personagem-nasce-sem-skills]]). Personagem nasce com nível 0 em tudo; este plano agora é só sobre o catálogo em si, não mais sobre balancear um orçamento de criação.

## Objetivo técnico

O catálogo de skills (`SKILL_DEFINITIONS`) é um placeholder de game design, não uma decisão fechada — precisa amadurecer antes (ou durante) da M02. A atividade "Estudar" (que faria skills crescerem passivamente) foi descartada como próximo marco — hoje as skills que mais importam são as que os cargos de emprego público exigem (ver [[../../../game-design/jobs]]), não um mecanismo de estudo à parte.

## Escopo

- `SKILL_DEFINITIONS` hoje é uma lista fixa e provisória (`intelligence`, `charisma`, `creativity`, `strength`) — revisar contra o game design real (que cargos de emprego cada skill deve destravar/beneficiar, ver [[../../../game-design/jobs]]) antes de tratar como catálogo final.
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
