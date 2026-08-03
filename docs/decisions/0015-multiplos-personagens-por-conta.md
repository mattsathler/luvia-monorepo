# 0015 — Uma conta pode ter múltiplos personagens

## Contexto

Com a autenticação sendo desenhada ([[0014-autenticacao-jwt-email-senha]]), era necessário decidir a relação entre conta (login) e personagem, já que até então o backend tratava "jogador" e "personagem" como a mesma coisa.

## Decisão

Uma conta pode ter **N personagens, sem limite fixo** (como em Torn e outros RPGs tradicionais), em vez de um único personagem por conta.

## Justificativa

Modelo mais flexível para o jogador, sem custo adicional relevante de implementação: o personagem já passa a ter um `accountId` de qualquer forma para viabilizar autenticação; permitir mais de um por conta é apenas não impor um limite artificial nessa relação.

## Consequências

- `Character` passa a ter um `accountId` obrigatório (dono).
- Existe um endpoint para listar todos os personagens de uma conta autenticada.
- Ações sobre um personagem (ex.: trocar atividade) exigem que a conta autenticada seja a dona daquele personagem especificamente — ser dono da conta não implica ser dono de *todo* personagem, só dos seus.
- **Pendente**: os documentos de game design (ex.: [[../game-design/lots-and-construction]], que diz "cada jogador pode possuir 1 residencial/1 comercial/1 industrial") foram escritos quando "jogador" e "personagem" eram a mesma coisa. Agora que uma conta pode ter vários personagens, não está decidido se esse limite de lotes é por **conta** ou por **personagem**. Não decidir isso por conta própria — aguardar definição.

## Referências

- [[0014-autenticacao-jwt-email-senha]]
- [[../game-design/lots-and-construction]]
