# Stack Tecnológica

## Objetivo

Definir a stack e a estrutura de pastas do projeto.

## Decisões consolidadas

O projeto é um monorepo com packages separados:

```text
packages/
apps/
```

Estrutura observada:

- `apps/game` — aplicação principal do jogo
- `apps/docs` — aplicação de documentação/showcase de componentes
- `packages/luv-ui` — design system (ver [[../ui-ux/design-system]])

Bibliotecas:

- React
- TypeScript
- Vite
- SCSS

Não utilizar Tailwind.

### Backend

O backend do jogo será implementado no mesmo monorepo (não em repositório separado). A estrutura exata (nome do app/pacote, organização das camadas DDD entre frontend e backend) ainda não foi definida — **Pendente**.

## Referências

- [[code-organization]]
- [[architecture]]
- [[../decisions/0007-nao-utilizar-tailwind]]
- [[../decisions/0009-ddd-como-arquitetura-principal]]
- [[../decisions/0010-backend-no-mesmo-monorepo]]
