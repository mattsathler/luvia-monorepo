# M06 — Economia de Jogadores

## Objetivo

Jogadores passam a criar e administrar empresas, gerando uma economia real entre eles e a cidade. Maior milestone do roadmap — é onde o jogo deixa de ser só "vida individual + social" e ganha uma camada econômica interdependente.

## Status

⏳ Planejada.

## Planos

1. [[planos/01-lotes-comercial-e-industrial]]
2. [[planos/02-bounded-context-de-empresa]]
3. [[planos/03-producao-industrial]]
4. [[planos/04-comercio-transformacao-e-venda]]
5. [[planos/05-cidade-reguladora]]
6. [[planos/06-empregos-privados]]
7. [[planos/07-contratos-entre-empresas]]
8. [[planos/08-gestao-de-empresa-ui]]

Ordem sugerida de implementação: 1 → 2 → 3 → 4 → 5 antes de 6/7 (o fluxo de produção precisa existir antes de emprego/contrato terem o que mover), com 8 evoluindo em paralelo assim que houver algo pra mostrar.

## Escopo

- **Lotes comercial e industrial**: completa o que a M03 deixou pendente (1 de cada tipo por jogador — ver [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]).
- **Empresas**: comércio e indústria, criadas e administradas por jogadores (ver [[../../game-design/companies]]).
- **Fluxo industrial**: indústria produz matéria-prima → comércio transforma → vende pra cidade (ver [[../../game-design/industry-system]]).
- **Empregos privados**: empresas de jogadores contratam outros jogadores, pagando mais que o emprego público mas dependendo da saúde da economia (ver [[../../game-design/jobs]]).
- **Contratos entre empresas**: produto, quantidade, prazo, valor — com possibilidade de falha (ver [[../../game-design/contracts]]).
- **Cidade como reguladora**: compra e vende produtos, mantém o emprego público disponível (ver [[../../game-design/economy]]).

## Fora do escopo

- Qualquer forma de PvP econômico agressivo (sabotagem, roubo) — não combina com Cozy First.
- Ferramentas avançadas de gestão financeira (gráficos complexos, previsão) — só o necessário pra operar a empresa.
- Efeitos de casamento/relacionamento sobre a economia — avaliar só depois desta milestone, se fizer sentido.

## Estimativa

**4–6 semanas.** De longe a maior milestone: introduz múltiplos bounded contexts novos (empresa, contrato, produção) com dependência circular entre eles (indústria→comércio→cidade), além de todo o balanceamento econômico ser território não-testado ainda. Considerar quebrar esta milestone em sub-entregas internas (ex.: comércio antes de indústria) se o ritmo real divergir muito da estimativa — mas o DoD abaixo só fecha com o fluxo completo funcionando.

## Referências

- [[../../game-design/companies]]
- [[../../game-design/industry-system]]
- [[../../game-design/contracts]]
- [[../../game-design/jobs]]
- [[../../game-design/economy]]
- [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]
