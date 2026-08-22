# Plano — Operação e backup

## Status

⏳ Pendente

## Objetivo técnico

Garantir que o jogo pode ser operado com segurança depois de lançado — hoje não existe nenhum processo de backup, monitoramento ou rollback documentado.

## Escopo

- Backup automático do MongoDB, com restauração testada de verdade (não só configurada).
- Monitoramento básico: erros e uptime da API.
- Plano de rollback de deploy, testado ao menos uma vez.

## Onde no código

- Infraestrutura de deploy (fora do código do monorepo em si).

## Depende de

Nenhuma tecnicamente, mas só faz sentido fechar depois que o jogo tiver algo de valor real pra proteger (pós M07).

## Referências

- [[../../../technical/tech-stack]]
