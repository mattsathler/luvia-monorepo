import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export const OUTPUT_PATH = resolve(__dirname, '../../../generated/workplaces.json');

export type WorkplaceSeed = { buildingTypeId: string; x: number; y: number };

export type WorkplaceDocument = { workplaceId: string; buildingTypeId: string; x: number; y: number };

/**
 * Prédios de exemplo pra validar o sistema de empregos (ver
 * docs/game-design/jobs.md) antes de qualquer geração de verdade existir.
 * Posições longe do canto (0,0) de propósito — é de lá que
 * `findFreeBuildablePosition` reivindica lotes residenciais automaticamente
 * (linha a linha), então prédios ali correriam risco de colidir com um lote
 * de personagem eventualmente.
 *
 * Provisório: quando o plano de Bairros existir
 * (docs/decisions/0031-bairros-expansao-do-mundo-sob-demanda.md,
 * docs/roadmap/03-cidade-e-lar/planos/10-bairros-e-expansao-do-mundo.md),
 * `generate-landmarks.ts` assume esse papel de verdade — um Workplace por
 * prédio obrigatório do catálogo, por Bairro. Este script deixa de ser
 * necessário nesse momento.
 */
export const EXAMPLE_WORKPLACES: WorkplaceSeed[] = [
  { buildingTypeId: 'city-hall', x: 20, y: 20 },
  { buildingTypeId: 'hospital', x: 30, y: 20 },
  { buildingTypeId: 'police-station', x: 40, y: 20 },
  { buildingTypeId: 'civil-guard', x: 20, y: 30 },
  { buildingTypeId: 'public-works-department', x: 30, y: 30 },
  { buildingTypeId: 'metal-workshop', x: 40, y: 30 },
  { buildingTypeId: 'treasury-department', x: 20, y: 40 },
  { buildingTypeId: 'municipal-school', x: 30, y: 40 },
];

export function buildWorkplaceDocuments(workplaces: WorkplaceSeed[] = EXAMPLE_WORKPLACES): WorkplaceDocument[] {
  return workplaces.map((workplace) => ({ workplaceId: randomUUID(), ...workplace }));
}

/**
 * Gera os documentos de prédio de exemplo e escreve prontos pra colar no
 * Atlas (collection `workplaces`) — mesmo padrão de `city:generate`
 * (`generate-city-map.script.ts`).
 *
 * Rodar com `npm run city:seed-workplaces` (ver package.json).
 */
export function run(): void {
  const documents = buildWorkplaceDocuments();

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(documents, null, 2)}\n`, 'utf-8');

  // eslint-disable-next-line no-console
  console.log(`${documents.length} prédio(s) de exemplo gerado(s) em ${OUTPUT_PATH}`);
}

run();
