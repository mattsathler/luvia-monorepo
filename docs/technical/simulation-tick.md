# Motor de Simulação (Tick)

## Objetivo

Definir como o backend processa a passagem do tempo e atualiza o estado dos personagens.

## Contexto

O jogo é orientado pelo sistema WRYD (ver [[../game-design/wryd-activity-system]]): o jogador define uma atividade, e o personagem "executa" essa atividade sozinho enquanto o tempo passa. Era necessário definir como o backend processa isso sem precisar reagir em tempo real a cada jogador.

## Decisões consolidadas

### Tick global em lotes (batches)

A simulação roda em ticks (intervalo de tempo ainda não definido — **Pendente**). A cada tick, o backend processa a atualização de todos os jogadores em **lotes/porções** (não todos de uma vez), para evitar processar a base inteira de jogadores simultaneamente. Cada lote aplica os efeitos da atividade atual de cada personagem sobre seu estado (habilidade, energia, dinheiro, Fama etc., conforme [[../game-design/wryd-activity-system]]).

### Sincronização por polling

O frontend não recebe atualizações em tempo real (push). O estado atual do personagem é obtido por **polling**: o frontend pergunta periodicamente ao backend o estado do jogador logado, e o backend responde com o estado mais recente. Isso evita manter conexões persistentes (WebSocket/SSE) abertas para cada jogador logado, reduzindo custo de infraestrutura, e é consistente com a decisão de não haver chat/interação em tempo real (ver [[../decisions/0004-sem-chat-em-tempo-real]]).

### Recompute individual sob demanda (lazy tick)

Além do tick em lote, **qualquer acesso ou atualização de um personagem** (login, consulta de estado próprio ou de outro personagem, ou qualquer ação que leia/altere o personagem) primeiro recalcula o estado dele individualmente até o momento atual, antes de prosseguir. Isso garante que o estado retornado/usado esteja sempre atualizado, independente de quando o próximo tick em lote for rodar.

Cada personagem guarda um `last_updated_at`, marcando até quando seu estado já foi processado. Esse campo serve para dois fins:

- **Idempotência/concorrência**: o recompute (individual ou em lote) só aplica o intervalo entre `last_updated_at` e agora, e deve atualizar esse campo de forma atômica (condicionada ao valor antigo). Assim, se o tick em lote e um recompute individual disputarem o mesmo personagem, só um aplica o intervalo — o outro não encontra mais nada pendente.
- **Priorização do lote**: o tick em lote pode pular ou despriorizar personagens cujo `last_updated_at` já está recente (foram sincronizados por um recompute individual há pouco), processando primeiro quem está mais desatualizado.

### Prorata ao trocar de atividade

Não há log de histórico de atividades. Em vez disso, a própria troca de atividade é tratada como uma atualização do personagem (ver seção anterior): ao trocar de atividade, o backend primeiro recalcula e aplica o efeito da atividade **anterior** sobre o intervalo `[last_updated_at, agora]`, atualiza `last_updated_at` para agora, e só então grava a nova atividade. Isso garante que nenhum recompute futuro precise atravessar mais de uma atividade no mesmo intervalo — a troca já "fecha a conta" da atividade anterior no momento em que acontece.

Para atividades com prazo definido pelo sistema (ex.: um evento com horário de término), o personagem guarda um `activity_ends_at`. Se um recompute encontrar `agora > activity_ends_at`, ele aplica o efeito da atividade só até `activity_ends_at` e trata o restante do intervalo como **Ocioso** (a atividade padrão — ver [[../game-design/wryd-activity-system]]), sem precisar de log nem de múltiplos segmentos.

## Observações

Ainda não definidos (**Pendente**):
- Duração do tick em lote.
- Tamanho/critério de particionamento dos lotes.
- Intervalo de polling do frontend.
- Camada/módulo exato onde o job de tick e o recompute individual vivem dentro da arquitetura DDD (ver [[architecture]]).

## Referências

- [[../game-design/wryd-activity-system]]
- [[architecture]]
- [[../decisions/0013-sistema-wryd-tick-em-lotes-e-polling]]
