---
name: update-roadmap
description: Atualiza docs/roadmap/ (status de planos, DoD, descrição de milestone e tabela do README) para refletir o desenvolvimento que avançou de fato. Use depois de implementar/mergear algo que toca uma milestone em andamento, ou quando o usuário pedir para "atualizar o roadmap"/"atualizar a milestone".
---

# Atualizar roadmap

Mantém `docs/roadmap/` honesto com o estado real do código. O roadmap não é
atualizado retroativamente em lote — é atualizado a cada avanço, então cada
edição deve ser pequena e verificada, nunca um reescrever genérico.

## Quando usar

- Logo depois de implementar (ou de o usuário confirmar que já está
  implementado/mergeado) algo que corresponde a um plano de uma milestone.
- Quando o usuário pedir explicitamente para atualizar o roadmap/milestone/DoD.

Não use isso para planejar trabalho novo do zero — é só para refletir avanço
já feito. Se o pedido for "criar um plano novo" ou "redesenhar a milestone",
trate como edição manual de docs, não como este fluxo.

## Passo 0 — Definir o escopo do que mudou

Se o usuário não disse explicitamente o que avançou, descubra antes de tocar
em qualquer arquivo:

- `git log` recente / diff atual / branch em progresso (o gitStatus do
  contexto e `rtk git log`/`rtk git diff` ajudam).
- Se ainda ambíguo, pergunte ao usuário qual plano(s)/milestone isso afeta —
  não adivinhe silenciosamente qual milestone está em jogo.

## Passo 1 — Achar o(s) plano(s) afetados

Em `docs/roadmap/NN-slug-da-milestone/planos/NN-slug-do-plano.md`, ache o
plano certo cruzando:

- a seção **"Onde no código"** de cada plano candidato contra os arquivos
  tocados no diff/commits;
- o título/objetivo técnico do plano contra o que foi implementado.

Pode ser mais de um plano (uma feature às vezes fecha parte de dois planos).
Pode não existir plano nenhum ainda — nesse caso pule para o Passo 5.

## Passo 2 — Atualizar o plano (`planos/NN-slug.md`)

Cada plano tem uma seção `## Status` em prosa (não é checklist). Reescreva
essa prosa para refletir o estado atual, seguindo o tom já usado nos outros
planos da milestone:

- Emoji de abertura da linha de status: `⏳ Pendente` → `🚧 Em andamento` →
  `✅ Feito`, na ordem certa — nunca pule direto pra `✅` se ainda falta algo
  do escopo do plano.
- Descreva o que já existe **citando arquivo/símbolo real** (ex.:
  `` `CityGrid.tsx` ``, `` `SearchLotsUseCase` ``), não em termos vagos tipo
  "quase pronto".
- O que ainda falta, explicitamente, se o plano não fechou.
- Se a implementação real divergiu do que o plano previa originalmente (ex.:
  uma decisão registrada em `docs/decisions/` mudou o approach), diga isso e
  linke a decisão com `[[../../../decisions/NNNN-slug]]`.
- Se o plano tem bullets de escopo com checkmarks (nem todos têm — confira o
  padrão do plano em questão antes de inventar um formato novo), marque os
  que fecharam.

**Antes de marcar algo como `✅ Feito`, verifique de verdade** — leia o
código/teste relevante, não confie só no que o usuário descreveu. Se não dá
pra confirmar com confiança, deixe `🚧 Em andamento` com uma nota de dúvida em
vez de marcar como feito.

## Passo 3 — Atualizar a milestone (`descricao.md` e `dod.md`)

Em `descricao.md`:

- Lista **"## Planos"**: atualize o emoji+status ao lado do plano tocado.
- Seção **"## Escopo"**: cada bullet às vezes termina com uma nota de status
  inline (ex.: "✅ Feito", "🚧 Parcial: ...") — atualize a nota do item
  correspondente, sem reescrever o bullet inteiro.
- **"## Status"** da milestone (prosa no topo): só toque se o avanço muda o
  quadro geral que essa prosa descreve (não a cada micro-avanço).
- Se o trabalho feito não corresponde a nenhum plano existente (escopo real
  maior que o documentado), siga a orientação do
  `docs/roadmap/README.md`: atualize `descricao.md`/`dod.md` pra refletir o
  escopo real, e considere se precisa de um `planos/NN-slug.md` novo (ver
  Passo 5).

Em `dod.md`:

- Marque `- [x]` os itens que agora são objetivamente verdade — releia o
  texto do item, ele costuma exigir mais de uma coisa (ex.: "endpoint E
  testado E documentado"); só marca se **tudo** aquilo é verdade.
- Para itens parcialmente verdadeiros, mantenha `- [ ]` e acrescente uma nota
  curta descrevendo o que já existe (mesmo padrão que os outros itens do
  arquivo já usam — releia exemplos antes de escrever).
- Nunca marque um item do DoD como concluído só porque o plano relacionado
  progrediu — o DoD é o critério objetivo final, mais rígido que o status do
  plano.

## Passo 4 — Atualizar `docs/roadmap/README.md` (só se o status da milestone mudou)

A tabela de milestones no README só muda quando o **status da milestone como
um todo** muda, não a cada plano:

- `⏳ Planejada` → `🔄 Em andamento`: no primeiro plano que começa a ser
  implementado.
- `🔄 Em andamento` → `✅ Concluída`: só quando **todos os planos** da
  milestone estão `✅ Feito` **e** todo item do `dod.md` está marcado. Não
  feche a milestone com itens pendentes no DoD.
- Ao fechar uma milestone: atualize a coluna "Estimativa" pra "Prazo real"
  (ex.: "01–19 ago (real)", igual à M01), e — seguindo a seção "Base da
  estimativa de prazo" do próprio README — reavalie se o ritmo observado
  diverge muito da estimativa das milestones seguintes; se divergir bastante,
  avise o usuário em vez de reescrever as estimativas sozinho.

## Passo 5 — Escopo novo sem plano correspondente

Se o que foi implementado não tem plano nenhum (feature nova descoberta
durante o desenvolvimento, fora do que a milestone previa originalmente):

1. Não invente silenciosamente — confirme com o usuário que isso é escopo
   novo da milestone antes de criar arquivo.
2. Crie `planos/NN-slug.md` seguindo o número sequencial seguinte e o mesmo
   formato dos planos vizinhos (`## Status`, `## Objetivo técnico`,
   `## Escopo`, `## Onde no código`, `## Depende de`, `## Referências`).
3. Adicione o plano na lista `## Planos` de `descricao.md`, e uma nota curta
   no `## Status` da milestone explicando por que o escopo cresceu (mesmo
   padrão da nota já existente na M03 sobre os planos 04/06).
4. Atualize `dod.md` se o novo escopo implica um critério objetivo novo.

## Regras gerais

- **Português**, no mesmo tom seco e objetivo dos arquivos existentes — sem
  enfeite, sem "quase pronto", sem reescrever parágrafos inteiros que não
  mudaram.
- **Edições cirúrgicas**: mude só as linhas/seções que o avanço real afeta.
  Não é para reescrever um arquivo inteiro nem "melhorar" prosa que já está
  correta.
- **Nunca infira conclusão** — se não deu pra confirmar no código/testes que
  algo está pronto, não marque como pronto.
- Preserve os links `[[caminho/relativo/sem-extensao]]` e a convenção de
  caminho relativo (planos ficam um nível mais fundo que `descricao.md`, e
  dois mais fundo que o `README.md` da raiz do roadmap — confira os `../`
  antes de escrever um link novo).
- No final, mostre um resumo curto do que mudou (quais arquivos, quais
  status) — não é pra rodar `git commit` sozinho, só editar; commit é decisão
  do usuário como qualquer outra mudança de código.
