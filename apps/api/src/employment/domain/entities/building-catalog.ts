import { SkillId } from '../../../character/domain/entities/skill';

export type CargoDefinition = {
  id: string;
  label: string;
  primarySkillId: SkillId;
  secondarySkillId?: SkillId;
  tertiarySkillId?: SkillId;
  baseHourlyWage: number;
  /** `null` = último cargo da hierarquia — não promove mais. */
  scoreToPromote: number | null;
};

export type BuildingDefinition = {
  /** Precisa bater com `Workplace.buildingTypeId` (bounded context `city`). */
  id: string;
  label: string;
  /** Ordenada — índice 0 é o cargo inicial, todo Contract novo começa nele. */
  cargoHierarchy: CargoDefinition[];
};

/**
 * Catálogo de prédios públicos e cargos — em código (TS const), mesmo padrão
 * de `SKILL_DEFINITIONS` (character/domain/entities/skill.ts): curado pelo
 * game design, muda via deploy (nova entrada = nova PR), sem banco de dados
 * nem JSON carregado em runtime. Ver docs/game-design/jobs.md.
 *
 * Só 1 prédio de exemplo nesta fase (validar o mecanismo) — o catálogo
 * cresce aditivamente quando mais prédios/cargos forem desenhados.
 */
export const BUILDING_CATALOG: BuildingDefinition[] = [
  {
    id: 'city-hall',
    label: 'Prefeitura',
    cargoHierarchy: [
      {
        id: 'intern',
        label: 'Estagiário',
        primarySkillId: 'intelligence',
        secondarySkillId: 'charisma',
        baseHourlyWage: 5,
        scoreToPromote: 100,
      },
      {
        id: 'assistant',
        label: 'Assistente',
        primarySkillId: 'intelligence',
        secondarySkillId: 'charisma',
        baseHourlyWage: 8,
        scoreToPromote: 250,
      },
      {
        id: 'coordinator',
        label: 'Coordenador',
        primarySkillId: 'intelligence',
        baseHourlyWage: 14,
        scoreToPromote: null,
      },
    ],
  },
];

export function findBuilding(buildingTypeId: string): BuildingDefinition | undefined {
  return BUILDING_CATALOG.find((building) => building.id === buildingTypeId);
}

export function findCargo(buildingTypeId: string, cargoId: string): CargoDefinition | undefined {
  return findBuilding(buildingTypeId)?.cargoHierarchy.find((cargo) => cargo.id === cargoId);
}

/** Próximo cargo da hierarquia após `cargoId` — `undefined` se `cargoId` não existir ou já for o último. */
export function nextCargo(buildingTypeId: string, cargoId: string): CargoDefinition | undefined {
  const building = findBuilding(buildingTypeId);
  if (!building) {
    return undefined;
  }

  const currentIndex = building.cargoHierarchy.findIndex((cargo) => cargo.id === cargoId);
  if (currentIndex === -1) {
    return undefined;
  }

  return building.cargoHierarchy[currentIndex + 1];
}
