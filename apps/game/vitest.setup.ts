import "@testing-library/jest-dom/vitest";

// Node 22+ define um `localStorage` experimental global próprio (por padrão
// ligado, atrás de --no-experimental-webstorage) que ocupa o slot antes do
// jsdom conseguir instalar o dele — sem o `--no-experimental-webstorage` em
// NODE_OPTIONS (ver scripts de teste em package.json), `window.localStorage`
// fica `undefined` em todo teste. Não dá pra corrigir isso aqui: a flag
// precisa existir no boot do processo do Node, antes deste arquivo rodar.
