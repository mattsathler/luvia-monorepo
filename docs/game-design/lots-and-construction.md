# Lotes e Construção

## Objetivo

Definir a posse de lotes e como eles evoluem.

## Decisões consolidadas

### Lotes

Existem três tipos:

- Residencial
- Comercial
- Industrial

Cada jogador pode possuir:

- 1 residencial
- 1 comercial
- 1 industrial

### Construção

Os lotes podem ser evoluídos. Construções melhoram funcionalidades.

Nunca utilizar sistemas complexos de construção manual — o jogador escolhe entre presets já desenhados, nunca monta um lote peça por peça.

### Tipos e níveis

Cada lote tem um **Tipo**: um preset concreto dentro da sua macro-categoria (ex.: Comercial → Loja de Móveis; Industrial → Marcenaria; Residencial → Sobrado). O catálogo de Tipos é fechado a cada momento, mas precisa crescer continuamente — novos Tipos são adicionados ao longo do tempo especificamente pra reduzir repetição visual pela cidade, não é um catálogo estático de lançamento.

Cada Tipo evolui em até 10 níveis. Subir de nível melhora, junto, a estética do preset e a mecânica interna (lucro, novos cargos etc.) — não são sistemas separados. A identidade completa de um lote é o par (Tipo, Nível) — ver [[../decisions/0032-lote-tipo-e-nivel-catalogo-expansivel]].

### Prédios públicos (não são lotes)

Prédios de trabalho do governo (ver [[jobs]]) não são lotes — não têm dono, não entram na contagem "1 de cada tipo por jogador" acima. São infraestrutura fixa da cidade, replicada em todo Bairro gerado (ver [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]]).

## Referências

- [[city-and-world]]
- [[companies]]
- [[jobs]]
- [[../decisions/0006-um-lote-de-cada-tipo-por-jogador]]
- [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]]
- [[../decisions/0032-lote-tipo-e-nivel-catalogo-expansivel]]
