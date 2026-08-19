# M01 — Fundação & Personagem

## Objetivo

Ter o monorepo, o design system e a autenticação prontos, e permitir que um jogador crie e visualize seu personagem — sem nenhum gameplay ainda. Base técnica pra tudo que vem depois.

## Status

✅ **Concluída** — 01 a 19 de agosto (~19 dias corridos, ritmo bursty solo — ver [[../README]]). O plano de skills (`planos/07-skills-catalogo-e-balanceamento.md`) mudou de escopo depois de fechado: não existe mais alocação inicial de pontos — personagem nasce com nível 0 em tudo (ver [[../../decisions/0024-personagem-nasce-sem-skills]]). O plano continua em aberto, mas agora é só sobre manter o catálogo (`SKILL_DEFINITIONS`) pronto pra quando skills crescerem jogando.

## Planos

Ver [[planos/01-monorepo-e-design-system]], [[planos/02-autenticacao]], [[planos/03-criacao-de-personagem]], [[planos/04-guarda-roupa]], [[planos/05-selecao-de-personagem]], [[planos/06-motor-de-simulacao-wryd]] (todos ✅) e [[planos/07-skills-catalogo-e-balanceamento]] (⏳, único em aberto).

## Escopo

- Monorepo (npm workspaces): `apps/game`, `apps/docs`, `apps/api`, `packages/luv-ui`, `packages/luv-icons`.
- Design system **Luv.UI**: tokens de cor (claro/escuro), componentes base (Button, Input, Modal, Stepper, Tabs, Snackbar, Checkbox, SlideToggle, DatePicker), helpers de layout em SCSS.
- Biblioteca de ícones própria (**luv-icons**): SVGs no estilo arredondado/chibi do personagem, carregados via `LuvIcon`.
- Backend (NestJS + MongoDB + DDD): bounded contexts `account` (registro/login/JWT) e `character` (ver abaixo).
- **Autenticação**: registro e login por email/senha, sessão via JWT.
- **Criação de personagem**: nome, gênero, tom de pele, cabelo, olho. Sem skills — personagem nasce com nível 0 em tudo (ver [[../../decisions/0024-personagem-nasce-sem-skills]]).
- **Guarda-roupa completo**: corpo, rosto, cabelo, blusa, calça, sapato, sobreposição — com prévia ao vivo do personagem montado (composição de camadas em canvas) e seletor com miniaturas.
- **Seleção de personagem**: lista de personagens da conta, prévia de cada um.
- **Motor de simulação WRYD no backend** (ver [[../../technical/simulation-tick]] e [[../../decisions/0013-sistema-wryd-tick-em-lotes-e-polling]]): tick em lote, recompute individual sob demanda (lazy), troca de atividade com prorata da atividade anterior, atividades `idle`/`resting`/`working` já com efeito sobre felicidade/energia/dinheiro. **Sem nenhuma UI no frontend ainda** — é infraestrutura pronta, esperando a M02.
- Cobertura de testes 100% (statements/branches/functions/lines) em todos os pacotes — ver [[../../decisions/0016-cobertura-de-testes-obrigatoria-100]].

## Fora do escopo

- Qualquer tela de jogo além de criar/selecionar personagem — `HomePage` hoje é um placeholder (nome do personagem + botão de sair).
- Atividade "estudar" (skills não crescem ainda — nascem em 0 e ficam paradas até a M02).
- Cidade, lotes, economia, eventos, relacionamentos — nada disso existe ainda, nem como stub.

## Estimativa

Não aplicável (concluída). Serve de referência de ritmo pras milestones seguintes: em ~19 dias corridos (a maioria sem commit), essa milestone entregou toda a base técnica (monorepo, design system, ícones, auth, DDD no backend) **e** o motor de simulação inteiro — o que deixa a M02 mais leve do que pareceria à primeira vista, já que a parte mais arriscada dela (o tick) já está pronta e testada.

## Referências

- [[../../decisions/0008-luv-ui-como-design-system-obrigatorio]]
- [[../../decisions/0009-ddd-como-arquitetura-principal]]
- [[../../decisions/0013-sistema-wryd-tick-em-lotes-e-polling]]
- [[../../decisions/0014-autenticacao-jwt-email-senha]]
- [[../../decisions/0019-personagem-montado-em-camadas-com-rig-2d]]
- [[../../decisions/0024-personagem-nasce-sem-skills]]
- [[../../ui-ux/design-system]]
- [[../../ui-ux/visual-art-style]]
