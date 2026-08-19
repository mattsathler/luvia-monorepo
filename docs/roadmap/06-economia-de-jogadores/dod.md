# Definition of Done — M06 Economia de Jogadores

## Backend

- [ ] Personagem pode possuir 1 lote comercial e 1 industrial, além do residencial (ver [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]).
- [ ] Jogador cria uma empresa (comércio ou indústria) associada a um lote.
- [ ] Indústria produz matéria-prima ao longo do tempo (mesmo mecanismo de atividade/tick já usado nas milestones anteriores, aplicado à empresa em vez do personagem, ou modelado como nova extensão do domínio — decidir e documentar).
- [ ] Comércio compra matéria-prima da indústria e vende produto transformado.
- [ ] Cidade compra produtos das empresas e mantém empregos públicos disponíveis (ver [[../../game-design/economy]]).
- [ ] Empresa de jogador contrata outro jogador como empregado, com salário definido pelo dono.
- [ ] Contrato entre duas empresas (produto, quantidade, prazo, valor) é criado, cumprido ou falha conforme as condições.

## Frontend

- [ ] Jogador administra sua(s) empresa(s): ver produção, funcionários, contratos ativos.
- [ ] Jogador consegue se candidatar/ser contratado por uma empresa de outro jogador.
- [ ] Jogador cria e acompanha contratos com outras empresas.
- [ ] Estado econômico da empresa (caixa, produção, contratos) é visível e atualiza via o mesmo mecanismo de polling da M02.

## Qualidade

- [ ] Cobertura 100% mantida em todos os pacotes tocados.
- [ ] `npm run build` limpo em `apps/api` e `apps/game`.
- [ ] Teste de ponta a ponta (manual ou automatizado) do fluxo completo: indústria produz → comércio compra e transforma → comércio vende pra cidade → dono da indústria e do comércio recebem dinheiro.
- [ ] `docs/game-design/companies.md`, `industry-system.md`, `contracts.md`, `jobs.md` e `economy.md` atualizados com qualquer decisão de balanceamento/regra fechada durante a implementação.
