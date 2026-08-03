# 0013 — Sistema WRYD, tick em lotes e sincronização por polling

## Contexto

O jogo precisava de um motor central que ligasse a decisão do jogador (o que seu personagem está fazendo) à simulação idle do mundo (ver [[../vision/principles]] — Idle First). Era necessário decidir como o jogador expressa essa decisão, como o backend processa a passagem do tempo para todos os jogadores, e como o frontend fica sabendo do resultado.

## Decisão

1. **WRYD ("What are you doing?")**: o jogador define a atividade atual do personagem (estudando, descansando, trabalhando, em um evento etc.). O personagem permanece nessa atividade até o jogador trocá-la.
2. **Tick em lotes**: a cada tick de simulação, o backend processa a atualização de todos os jogadores dividida em lotes/porções, evitando processar a base inteira de uma vez.
3. **Sincronização por polling**: o frontend obtém o estado atual do personagem perguntando periodicamente ao backend (polling), em vez de o backend empurrar atualizações em tempo real.
4. **Recompute individual sob demanda**: qualquer acesso ou atualização de um personagem (login, consulta de estado próprio ou de outro, qualquer ação sobre ele) recalcula o estado dele individualmente até o momento atual antes de prosseguir, usando um campo `last_updated_at` para saber até quando o personagem já foi processado.
5. **Prorata por fechamento no momento da troca**: não há log de histórico de atividades. Trocar de atividade é, em si, uma atualização do personagem — por isso ela recalcula e fecha o efeito da atividade anterior sobre `[last_updated_at, agora]` antes de gravar a nova atividade. Atividades com prazo definido pelo sistema (ex.: eventos) guardam um `activity_ends_at`; se o recompute encontrar `agora > activity_ends_at`, aplica o efeito só até lá e trata o restante como **Ocioso**, a atividade padrão do personagem.

## Justificativa

Processar em lotes evita picos de carga a cada tick e permite escalar o processamento conforme a base de jogadores cresce. Polling foi escolhido em vez de push (WebSocket/SSE) porque o jogo não é orientado a tempo real — é consistente com a ausência de chat em tempo real ([[0004-sem-chat-em-tempo-real]]) e mais barato de operar do que manter conexões persistentes por jogador logado. O recompute individual sob demanda resolve a tensão entre tick pequeno (mais fiel, mais caro) e tick grande (mais barato, mais desatualizado): o personagem fica sempre atualizado no momento em que é acessado, e o tick em lote vira apenas uma rede de segurança para quem não está sendo acessado. Fechar o efeito da atividade anterior no momento da troca evita precisar de um log de histórico de atividades e de segmentar o intervalo em múltiplas atividades durante o recompute — o intervalo entre dois `last_updated_at` nunca atravessa mais de uma atividade.

## Consequências

- O estado do personagem (ver [[../game-design/character-needs]]) é recalculado tanto pelo tick em lote quanto sob demanda a cada acesso/atualização — nunca fica desatualizado quando lido.
- O backend só precisa responder com o estado atual de jogadores **logados** no momento do polling — jogadores offline não geram tráfego de sincronização, e seu estado só é recalculado quando o tick em lote alcançá-los.
- O `last_updated_at` deve ser atualizado de forma atômica (condicionada ao valor anterior), para que o tick em lote e um recompute individual concorrentes não apliquem o mesmo intervalo de tempo duas vezes.
- O tick em lote pode usar `last_updated_at` para priorizar quem está mais desatualizado, pulando quem já foi sincronizado recentemente por um recompute individual.
- O particionamento em lotes deve ser levado em conta desde o desenho do job de tick, para não exigir retrabalho quando a base de jogadores crescer.
- Toda troca de atividade deve passar pelo mesmo fluxo de recompute-antes-de-atualizar; nunca deve gravar a nova atividade sem antes fechar o efeito da anterior.
- Duração do tick, critério de particionamento dos lotes e intervalo de polling ficam **Pendentes** (ver [[../technical/simulation-tick]]).

## Referências

- [[../game-design/wryd-activity-system]]
- [[../technical/simulation-tick]]
- [[../vision/principles]]
- [[0004-sem-chat-em-tempo-real]]
- [[0009-ddd-como-arquitetura-principal]]
