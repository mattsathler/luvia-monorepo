# AGENTS.md

## Luvia

Este arquivo é a **porta de entrada** para qualquer agente de IA (Claude, ChatGPT, Gemini, etc.) trabalhando neste projeto.

A documentação oficial do projeto vive em `docs/` e é a **fonte de verdade** sobre visão, mecânicas de jogo, UI/UX, decisões técnicas e lore. Antes de propor ou implementar qualquer funcionalidade, leia os documentos relevantes.

## Ordem de prioridade

1. **`docs/decisions/`** — decisões definitivas (ADRs). Prioridade máxima. Nunca contradizer uma decisão registrada aqui.
2. **`docs/vision/`** — visão geral e princípios que todo o resto deve seguir.
3. **`docs/game-design/`** — mecânicas de jogo já definidas.
4. **`docs/ui-ux/`** — princípios de interface, arte e design system.
5. **`docs/technical/`** — stack, organização de código e convenções.
6. **`docs/lore/`** — narrativa e universo (hoje: pendente).

## Regras para agentes

- Nunca contradizer uma decisão registrada em `docs/decisions/`.
- Em caso de conflito entre documentos, `docs/decisions/` sempre vence.
- Se um assunto estiver marcado como **Pendente** em algum documento, não decidir por conta própria — sinalizar a lacuna ao usuário.
- Ao propor uma nova funcionalidade, verificar se ela respeita os princípios em `docs/vision/principles.md` (Cozy First, Idle First, Social First, Long Term Progression). Se algum princípio for violado, a proposta deve ser rejeitada.
- Não inventar mecânicas, lore ou decisões técnicas que não estejam documentadas.
