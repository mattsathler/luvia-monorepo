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

Retorna a grade da cidade inteira — dimensões, o terreno completo (ruas, água, pontos de interesse etc.) e todo lote já reivindicado. Ver [[../../../decisions/0005-cidade-unica-persistente]]: existe apenas uma cidade, então esta rota não recebe nenhum id.

**Resposta (200):**

```json
{
  "width": 40,
  "height": 40,
  "tiles": [
    { "x": 0, "y": 0, "type": "ocean" }
  ],
  "lots": [
    { "id": "uuid", "characterId": "uuid", "type": "residential", "x": 20, "y": 18 }
  ]
}
```

**Pontos de importância:**

- `tiles` sempre tem `width * height` entradas — cobre a grade inteira, terreno gerado uma vez e persistido (não recalculado a cada request; ver [[../../../decisions/0026-terreno-da-cidade-gerado-e-persistido]]).
- `lots` só contém posições já reivindicadas, sempre sobre um tile `grass` de `tiles` — o frontend sobrepõe a posse por cima do terreno pra destacar o lote do jogador.
- Qualquer conta autenticada pode chamar — não é restrito a quem é dono de que lote (necessário para renderizar a cidade inteira, não só o próprio lote).

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
