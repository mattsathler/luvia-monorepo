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

## Referências

- [[code-organization]]
- [[../decisions/0007-nao-utilizar-tailwind]]
