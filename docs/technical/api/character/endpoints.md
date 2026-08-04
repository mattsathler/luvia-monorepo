# Endpoints — Character

## Objetivo

Documentar os endpoints do bounded context Character. Ver [[../../game-design/wryd-activity-system]] para o sistema de atividades (WRYD) e [[../../technical/simulation-tick]] para o motor de tick por trás desses endpoints.

## Base

`/characters`

Todas as rotas exigem autenticação (`Authorization: Bearer <token>`).

## Formato do personagem

Todas as respostas abaixo retornam (ou uma lista de) objetos nesse formato:

```json
{
  "id": "uuid",
  "accountId": "uuid-da-conta-dona",
  "name": "Ana",
  "happiness": 100,
  "energy": 100,
  "money": 0,
  "fame": 0,
  "activity": "idle",
  "activityEndsAt": null,
  "lastUpdatedAt": "2026-01-01T00:00:00.000Z"
}
```

## `POST /characters`

Cria um novo personagem para a conta autenticada.

**Body:**

```json
{ "name": "Ana" }
```

**Resposta (201):** o personagem criado (ver formato acima), com `activity: "idle"` e stats padrão (100/100/0/0).

**Pontos de importância:**

- Uma conta pode ter múltiplos personagens, sem limite fixo — ver [[../../decisions/0015-multiplos-personagens-por-conta]].
- `accountId` vem do token (`@CurrentAccount()`), não do body — não é possível criar um personagem para outra conta.

## `GET /characters/mine`

Lista todos os personagens da conta autenticada.

**Resposta (200):** array de personagens (ver formato acima).

**Pontos de importância:**

- Precisa estar registrada **antes** de `GET /characters/:id` na definição das rotas — senão `mine` seria interpretado como um `:id` literal.
- Cada personagem retornado é recomputado (ver abaixo) antes de ser incluído na resposta — é o mecanismo usado pelo polling do frontend (ver [[../../decisions/0013-sistema-wryd-tick-em-lotes-e-polling]]).

## `GET /characters/:id`

Busca um personagem pelo id.

**Resposta (200):** o personagem (ver formato acima).

**Erros:**

- `404` — personagem não existe.

**Pontos de importância:**

- **Não é restrito ao dono**: qualquer conta autenticada pode ver qualquer personagem (necessário para relacionamentos/perfis sociais já documentados). Só a autenticação é exigida, não a posse.
- Qualquer leitura recomputa o personagem até o momento atual antes de retornar (lazy tick) — o estado nunca está desatualizado.

## `POST /characters/:id/activity`

Troca a atividade atual do personagem (WRYD).

**Body:**

```json
{
  "activity": "working",
  "activityEndsAt": "2026-01-01T01:00:00.000Z"
}
```

`activity` é um de `idle`, `resting`, `working`. `activityEndsAt` é opcional (ISO date) — usado por atividades com prazo definido pelo sistema (ex.: eventos, quando esse bounded context existir).

**Resposta (200):** o personagem atualizado (ver formato acima).

**Erros:**

- `403` — a conta autenticada não é dona desse personagem.
- `404` — personagem não existe.
- `400` — `activity` desconhecida ou `activityEndsAt` inválido.

**Pontos de importância:**

- Antes de aplicar a nova atividade, o efeito da atividade **anterior** é calculado e fechado sobre o intervalo decorrido (ver [[../../technical/simulation-tick]]) — nunca perde tempo de simulação.
- Estudar ainda não está implementado como atividade (pendente de o sistema de habilidades ser desenhado — ver [[../../game-design/wryd-activity-system]]).

## Referências

- [[../README]]
- [[../../game-design/wryd-activity-system]]
- [[../../technical/simulation-tick]]
- [[../../decisions/0013-sistema-wryd-tick-em-lotes-e-polling]]
- [[../../decisions/0015-multiplos-personagens-por-conta]]
