# Definition of Done — M04 Clima & Produtividade

## Backend

- [ ] Clima frio (`foggy`) reduz felicidade do personagem enquanto ele está `working` (fora de casa).
- [ ] Clima quente (`sunny`) reduz felicidade do personagem enquanto ele está `idle` (em casa).
- [ ] Nenhum efeito de desconforto térmico nas demais combinações (calor fora de casa, frio em casa).
- [ ] `working` deixa de usar uma taxa de dinheiro/hora fixa — a taxa escala com a energia e a felicidade atuais do personagem no momento do cálculo.
- [ ] Hora do jogo tem algum efeito mensurável sobre a produtividade (mecanismo definido no plano 02).
- [ ] Testes cobrindo os novos efeitos, incluindo o caso de prorata (clima/hora mudando no meio de um intervalo de recompute).

## Qualidade

- [ ] Cobertura 100% mantida em `apps/api`.
- [ ] `npm run build` limpo em `apps/api`.
- [ ] Documentação atualizada: `docs/technical/clima-e-temperatura.md` perde a nota "sem efeito de jogabilidade" nas Observações; `docs/game-design/character-needs.md`/`jobs.md` refletem o novo efeito, se fizer sentido.
