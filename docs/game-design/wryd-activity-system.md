# Sistema WRYD (What Are You Doing?)

## Objetivo

Definir como o jogador expressa o que seu personagem está fazendo, e como isso afeta o estado do personagem ao longo do tempo.

## Decisões consolidadas

O jogo é organizado em torno do sistema **WRYD** ("What are you doing?"): o jogador define qual atividade seu personagem está executando no momento — por exemplo, estudando, descansando, trabalhando ou participando de um evento.

O personagem permanece nessa atividade até o jogador trocá-la. A cada tick de simulação (ver [[../technical/simulation-tick]]), o backend atualiza o estado do personagem de acordo com a atividade atual:

- Estudando → aumenta habilidade (ver [[skills-and-study]]).
- Descansando → diminui cansaço / aumenta energia (ver [[character-needs]]).
- Trabalhando → gera dinheiro (ver [[jobs]]).
- Participando de um evento → aumenta Fama, relacionamentos ou habilidades (ver [[events]]).

### Atividade padrão: Ocioso

**Ocioso** é a atividade padrão do personagem. Sempre que uma atividade com prazo definido pelo sistema (ex.: um evento) termina e o jogador não escolheu uma próxima atividade, o personagem cai em Ocioso até o jogador definir outra coisa.

## Observações

A lista de atividades e seus efeitos exatos ainda não está fechada — cada bounded context (Employment, Skills, Events etc.) define seus próprios efeitos sobre o personagem quando a atividade correspondente estiver ativa. Novas atividades devem seguir os princípios de [[../vision/principles]] (nada de punições severas, progresso lento).

## Referências

- [[character-needs]]
- [[progression-fame]]
- [[skills-and-study]]
- [[jobs]]
- [[events]]
- [[../technical/simulation-tick]]
- [[../decisions/0013-sistema-wryd-tick-em-lotes-e-polling]]
