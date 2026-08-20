# Endpoints — City

## Objetivo

Documentar os endpoints do bounded context City. Ver [[../../../game-design/city-and-world]] e [[../../../game-design/lots-and-construction]] para o design por trás da cidade e dos lotes.

## Base

`/city`

Todas as rotas exigem autenticação (`Authorization: Bearer <token>`).

## Formato do lote

```json
{
  "id": "uuid",
  "characterId": "uuid-do-dono",
  "type": "residential",
  "x": 0,
  "y": 0
}
```

`type` só assume `residential` nesta milestone (ver [[../../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]) — `commercial`/`industrial` entram na M06, junto com empresas.

## Formato do tile de terreno

```json
{ "x": 0, "y": 0, "type": "ocean" }
```

`type` é um de: `grass`, `ocean` (lagoa — atualmente **desativada** na geração, ver [[../../../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]), `road-r`, `road-l`, `road-i`, `landmark`. Só `grass` é reivindicável como lote. Quando a lagoa voltar, nenhuma rua deve cruzá-la (sem pontes).

## `GET /city`

Retorna só as **dimensões** da grade. Ver [[../../../decisions/0005-cidade-unica-persistente]]: existe apenas uma cidade, então esta rota não recebe nenhum id.

Desde [[../../../technical/lowys-carregamento-em-chunks]] (LOWYS), este endpoint **não** devolve mais `tiles`/`lots` — isso agora é `GET /city/chunks/:x/:y`, pedido sob demanda por região conforme o jogador rola a tela. `GET /city` serve só pra saber o tamanho total da grade (necessário pra calcular quantos chunks existem e dimensionar a área de scroll no frontend).

**Resposta (200):**

```json
{ "width": 40, "height": 40 }
```

**Pontos de importância:**

- Qualquer conta autenticada pode chamar.
- Chamado uma vez, não em loop — o resultado não muda depois que o terreno já foi gerado (ver [[../../../decisions/0026-terreno-da-cidade-gerado-e-persistido]]).

## `GET /city/chunks/:x/:y`

Retorna o terreno e os lotes de um **chunk** — um recorte quadrado de `CHUNK_SIZE` × `CHUNK_SIZE` tiles da grade (`CHUNK_SIZE = 10` — ver [[../../../technical/lowys-carregamento-em-chunks]]). `:x`/`:y` são a **coordenada do chunk**, não do tile — o chunk `(cx, cy)` cobre os tiles `[cx·10, cx·10+10) × [cy·10, cy·10+10)`.

**Resposta (200):**

```json
{
  "tiles": [
    { "x": 0, "y": 0, "type": "grass" }
  ],
  "lots": [
    { "id": "uuid", "characterId": "uuid", "type": "residential", "x": 7, "y": 7 }
  ]
}
```

**Pontos de importância:**

- Uma coordenada de chunk fora da grade real (ou uma grade menor que `CHUNK_SIZE`, num ambiente de teste por exemplo) devolve `{ "tiles": [], "lots": [] }`, sem erro — sem validação de limite.
- `lots` só contém as posições já reivindicadas **dentro desse chunk**, sempre sobre um tile `grass` de `tiles` — o frontend sobrepõe a posse por cima do terreno do próprio chunk pra destacar o lote do jogador.
- Qualquer conta autenticada pode chamar — não é restrito a quem é dono de que lote.
- Cada chamada busca o documento `city_maps` inteiro e a coleção `lots` inteira do Mongo e filtra em memória pelo chunk pedido — não é uma query por região de verdade. Aceitável na escala atual (uma cidade, pré-lançamento); revisitar se a carga de jogadores concorrentes crescer.

## `GET /city/lots/:characterId`

Retorna o lote residencial do personagem. Se ele ainda não tiver um, esta leitura já reivindica a primeira posição `grass` (terreno reivindicável) livre da grade e persiste — mesmo padrão de efeito colateral em leitura usado por `RecomputeCharacterUseCase` (ver [[../../../technical/simulation-tick]]).

**Resposta (200):** o lote (ver formato acima).

**Erros:**

- `409` — a cidade não tem mais posições `grass` livres para novos lotes residenciais.

**Pontos de importância:**

- Idempotente após a primeira chamada: uma vez que o personagem tem um lote, chamadas seguintes sempre retornam o mesmo, sem criar um segundo (ver [[../../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]).
- **Não é restrito ao dono**: qualquer conta autenticada pode consultar o lote de qualquer personagem — mesma política de `GET /characters/:id` (ver [[../character/endpoints]]).
- A grade tem `CITY_WIDTH x CITY_HEIGHT` posições (40x40 nesta milestone, sem borda de oceano fixa — ver [[../../../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]); a primeira posição `grass` livre é escolhida varrendo a grade linha a linha — nunca cai em rua, lagoa ou ponto de interesse.

## Referências

- [[../README]]
- [[../../../game-design/city-and-world]]
- [[../../../game-design/lots-and-construction]]
- [[../../../decisions/0005-cidade-unica-persistente]]
- [[../../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]
- [[../../../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../../../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]
- [[../../../technical/lowys-carregamento-em-chunks]]
