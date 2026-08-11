# 0022 — Páginas de `apps/game` separadas em controller hook e view

## Contexto

As páginas de `apps/game/src/pages/**` (`LoginPage`, `RegisterPage`, `CharacterSelectPage`, `CharacterCreatePage`, `HomePage`) tinham todo `useState`/`useEffect`/handlers misturados no mesmo arquivo `.tsx` do JSX. Em `CharacterCreatePage.tsx`, por exemplo, eram ~9 `useState`, um `useEffect` de fetch e 3 handlers antes de qualquer marcação — dificultando enxergar a estrutura visual da página e testar a lógica isoladamente do DOM.

## Decisão

1. **Cada página ganha um `<Page>.controller.ts` ao lado do `<Page>.tsx`**, exportando um hook `use<Page>Controller(...)` que concentra todo `useState`, `useEffect` e handlers da página, e devolve um objeto plano com os valores e funções que a view precisa (`{ firstName, setFirstName, isSubmitting, handleSubmit, ... }`).
2. **`<Page>.tsx` só monta o JSX**: chama o hook uma vez no topo e usa a desestruturação do retorno — nenhum `useState` ou lógica de negócio permanece no arquivo de view.
3. **Configuração estática da página (steps do wizard, opções de gênero, budgets) é exportada como `const` do arquivo `.controller.ts`**, não do hook — não precisa ser recalculada a cada render, e a view importa direto (`import { STEPS, GENDER_OPTIONS } from "./CharacterCreatePage.controller"`).
4. **A API de props da página não muda.** Params do controller espelham as props relevantes (ex.: `useCharacterCreatePageController({ accessToken, onCharacterCreated })`); o padrão de guard-then-content (`if (!accessToken) return null`) continua no componente externo, já que hooks não podem ser chamados condicionalmente — só o componente `*Content` interno passa a delegar sua lógica ao controller.
5. **Nomenclatura**: hook sempre `use<Page>Controller`; arquivo sempre `<Page>.controller.ts` (sem JSX, então `.ts` e não `.tsx`).

## Consequências

- Toda a suíte de testes de página continua sem alteração de estratégia — os testes renderizam a página e interagem via `screen`/`userEvent`, então são cegos a se a lógica está no componente ou num hook ao lado; nenhum teste precisou mockar o controller diretamente.
- Fica possível, no futuro, testar um controller isoladamente com `renderHook` sem precisar montar DOM, se a lógica de alguma página crescer o suficiente para justificar.
- Overhead de um arquivo a mais por página só compensa quando há estado/efeitos reais; `HomePage.controller.ts` ficou reduzido a um repasse de `useAuth().logout` — aceitável pela consistência do padrão, mas não é motivo para forçar um controller em componentes de apresentação pura (ex.: `LayerOptionPicker`, `ThumbnailOption`) que não tocam estado próprio.

## Referências

- [[../technical/code-organization]]
