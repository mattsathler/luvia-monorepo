# 0021 — React Router para navegação do `apps/game`

## Contexto

A navegação do `apps/game` era inteiramente feita por estado local em `AppContent` (`App.tsx`): `authView` (`"login" | "register"`), `characterView` (`"select" | "create"`) e `character` (personagem selecionado), decidindo o que renderizar via uma cascata de `if`/`return` — sem URL, sem histórico do navegador, sem back/forward, sem deep link. Cada página recebia callbacks (`onNavigateToRegister`, `onCharacterSelected`, `onCancel`, ...) que só trocavam esse estado local.

## Decisão

1. **`react-router-dom` (v7) substitui a cascata de `if`/`return`** por rotas de verdade: `/login`, `/register`, `/characters`, `/characters/new`, `/play`, com `/` e qualquer rota desconhecida (`*`) resolvidos por `RootRedirect` (login se não autenticado, lista de personagens caso contrário).
2. **Guards como componentes de rota, não `if` inline**: `RequireAuth` (redireciona pra `/login` se não autenticado), `RequireGuest` (redireciona autenticado pra fora de `/login`/`/register`), `RequireCharacter` (redireciona pra `/characters` se não há personagem selecionado). Cada rota protegida é só a composição desses guards.
3. **As páginas em si (`LoginPage`, `RegisterPage`, `CharacterSelectPage`, `CharacterCreatePage`, `HomePage`) continuam com a mesma API de props (`onNavigateToRegister`, `onCharacterSelected`, etc.) — só passam a receber esses callbacks de um componente de rota fino (`LoginRoute`, `CharacterSelectRoute`, ...) que usa `useNavigate()`**, em vez de receber `setState` de `AppContent`. Isso evitou reescrever ou re-testar as páginas — só o "cabeamento" de navegação em `App.tsx` mudou.
4. **O personagem selecionado sai de `useState` dentro de `AppContent` e vira `CharacterContext`** (`apps/game/src/character/CharacterContext.tsx`), no mesmo padrão de `AuthContext`. Necessário porque, com rotas de verdade, mais de um componente de rota (`CharacterSelectRoute`, `CharacterCreateRoute`, `PlayRoute`) precisa ler/escrever esse estado — não dava mais pra just passar como prop a partir de um único componente pai. Continua só em memória (não persiste em localStorage nem na URL): um reload sempre volta pra `/characters`.

## Consequências

- Navegação ganha URL, histórico e back/forward "de graça" (ex.: dar refresh em `/characters/new` continua na tela de criação, não reseta pro login).
- `RootRedirect` só decide com base em `isAuthenticated` — não olha o personagem selecionado, porque `CharacterContext` não persiste entre reloads (numa visita fresca a `/`, o personagem sempre começa nulo; olhar pra ele ali seria um branch morto).
- `PlayRoute` assume (via non-null assertion) que sempre há um personagem, confiando que só é renderizada dentro de `RequireCharacter` — o guard já garante isso antes de qualquer render de `PlayRoute` no mesmo ciclo.
- Testes de `App.tsx` usam `BrowserRouter` de verdade (não `MemoryRouter`) — como o `history` do jsdom persiste entre testes do mesmo arquivo, os testes resetam a URL pra `/` em `beforeEach` (`window.history.pushState(null, "", "/")`) pra cada teste começar determinístico.

## Referências

- [[0019-personagem-montado-em-camadas-com-rig-2d]]
- [[0020-assets-de-personagem-em-canvas-fixo-com-blank-area]]
