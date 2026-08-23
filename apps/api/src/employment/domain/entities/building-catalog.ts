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
  /**
   * Vagas concorrentes nesse cargo, por instância de `Workplace` (prédio físico
   * — lembrar que o catálogo aqui é o *tipo* de prédio, replicado por Bairro).
   * `null` = ilimitado, sempre o caso do cargo de entrada (índice 0): emprego
   * público é "sempre disponível" (ver docs/game-design/jobs.md). Cargos de
   * promoção acima têm um teto — se todas as vagas estiverem ocupadas por
   * outros `Contract`s ativos nesse mesmo prédio, o personagem elegível fica
   * represado no cargo atual (sem perder score) até uma vaga abrir.
   */
  vacancySlots: number | null;
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
 * Convenção de vagas: cargo de entrada sempre `null` (ilimitado); daí em
 * diante os tetos seguem 6 → 4 → 2 → 1, terminando sempre em 1 vaga no cargo
 * final (só um chefe por prédio) — placeholder de balanceamento, como
 * qualquer taxa/threshold deste catálogo.
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
        vacancySlots: null,
      },
      {
        id: 'assistant',
        label: 'Assistente',
        primarySkillId: 'intelligence',
        secondarySkillId: 'charisma',
        baseHourlyWage: 8,
        scoreToPromote: 250,
        vacancySlots: 6,
      },
      {
        id: 'coordinator',
        label: 'Coordenador',
        primarySkillId: 'intelligence',
        baseHourlyWage: 14,
        scoreToPromote: null,
        vacancySlots: 1,
      },
    ],
  },
  {
    id: 'hospital',
    label: 'Hospital Municipal',
    cargoHierarchy: [
      {
        id: 'nursing-assistant',
        label: 'Auxiliar de Enfermagem',
        primarySkillId: 'medicine',
        secondarySkillId: 'dexterity',
        baseHourlyWage: 6,
        scoreToPromote: 120,
        vacancySlots: null,
      },
      {
        id: 'nursing-technician',
        label: 'Técnico de Enfermagem',
        primarySkillId: 'medicine',
        secondarySkillId: 'dexterity',
        tertiarySkillId: 'discipline',
        baseHourlyWage: 9,
        scoreToPromote: 260,
        vacancySlots: 6,
      },
      {
        id: 'nurse',
        label: 'Enfermeiro',
        primarySkillId: 'medicine',
        secondarySkillId: 'intelligence',
        baseHourlyWage: 13,
        scoreToPromote: 420,
        vacancySlots: 4,
      },
      {
        id: 'resident-doctor',
        label: 'Médico Residente',
        primarySkillId: 'medicine',
        secondarySkillId: 'intelligence',
        tertiarySkillId: 'dexterity',
        baseHourlyWage: 18,
        scoreToPromote: 650,
        vacancySlots: 2,
      },
      {
        id: 'chief-doctor',
        label: 'Médico-Chefe',
        primarySkillId: 'medicine',
        secondarySkillId: 'leadership',
        baseHourlyWage: 26,
        scoreToPromote: null,
        vacancySlots: 1,
      },
    ],
  },
  {
    id: 'police-station',
    label: 'Delegacia de Polícia',
    cargoHierarchy: [
      {
        id: 'recruit',
        label: 'Recruta',
        primarySkillId: 'discipline',
        secondarySkillId: 'strength',
        baseHourlyWage: 6,
        scoreToPromote: 120,
        vacancySlots: null,
      },
      {
        id: 'officer',
        label: 'Policial',
        primarySkillId: 'discipline',
        secondarySkillId: 'marksmanship',
        tertiarySkillId: 'strength',
        baseHourlyWage: 9,
        scoreToPromote: 280,
        vacancySlots: 6,
      },
      {
        id: 'investigator',
        label: 'Investigador',
        primarySkillId: 'investigation',
        secondarySkillId: 'intelligence',
        baseHourlyWage: 14,
        scoreToPromote: 450,
        vacancySlots: 4,
      },
      {
        id: 'sergeant',
        label: 'Sargento',
        primarySkillId: 'discipline',
        secondarySkillId: 'leadership',
        baseHourlyWage: 19,
        scoreToPromote: 650,
        vacancySlots: 2,
      },
      {
        id: 'chief',
        label: 'Delegado',
        primarySkillId: 'law',
        secondarySkillId: 'leadership',
        tertiarySkillId: 'investigation',
        baseHourlyWage: 28,
        scoreToPromote: null,
        vacancySlots: 1,
      },
    ],
  },
  {
    id: 'civil-guard',
    label: 'Guarda Municipal',
    cargoHierarchy: [
      {
        id: 'recruit',
        label: 'Recruta',
        primarySkillId: 'discipline',
        secondarySkillId: 'strength',
        baseHourlyWage: 6,
        scoreToPromote: 120,
        vacancySlots: null,
      },
      {
        id: 'guard',
        label: 'Guarda',
        primarySkillId: 'discipline',
        secondarySkillId: 'strength',
        tertiarySkillId: 'endurance',
        baseHourlyWage: 9,
        scoreToPromote: 260,
        vacancySlots: 6,
      },
      {
        id: 'corporal',
        label: 'Cabo',
        primarySkillId: 'tactics',
        secondarySkillId: 'discipline',
        baseHourlyWage: 13,
        scoreToPromote: 430,
        vacancySlots: 4,
      },
      {
        id: 'sergeant',
        label: 'Sargento',
        primarySkillId: 'tactics',
        secondarySkillId: 'leadership',
        baseHourlyWage: 18,
        scoreToPromote: 620,
        vacancySlots: 2,
      },
      {
        id: 'captain',
        label: 'Capitão da Guarda',
        primarySkillId: 'leadership',
        secondarySkillId: 'tactics',
        baseHourlyWage: 27,
        scoreToPromote: null,
        vacancySlots: 1,
      },
    ],
  },
  {
    id: 'public-works-department',
    label: 'Secretaria de Obras Públicas',
    cargoHierarchy: [
      {
        id: 'construction-helper',
        label: 'Ajudante de Obras',
        primarySkillId: 'strength',
        secondarySkillId: 'dexterity',
        baseHourlyWage: 6,
        scoreToPromote: 140,
        vacancySlots: null,
      },
      {
        id: 'bricklayer',
        label: 'Pedreiro',
        primarySkillId: 'construction',
        secondarySkillId: 'strength',
        baseHourlyWage: 10,
        scoreToPromote: 300,
        vacancySlots: 6,
      },
      {
        id: 'construction-foreman',
        label: 'Mestre de Obras',
        primarySkillId: 'construction',
        secondarySkillId: 'leadership',
        baseHourlyWage: 15,
        scoreToPromote: 480,
        vacancySlots: 4,
      },
      {
        id: 'civil-engineer',
        label: 'Engenheiro Civil',
        primarySkillId: 'engineering',
        secondarySkillId: 'construction',
        tertiarySkillId: 'intelligence',
        baseHourlyWage: 22,
        scoreToPromote: 680,
        vacancySlots: 2,
      },
      {
        id: 'chief-engineer',
        label: 'Engenheiro-Chefe',
        primarySkillId: 'engineering',
        secondarySkillId: 'leadership',
        baseHourlyWage: 32,
        scoreToPromote: null,
        vacancySlots: 1,
      },
    ],
  },
  {
    id: 'metal-workshop',
    label: 'Oficina Municipal de Metalurgia',
    cargoHierarchy: [
      {
        id: 'metalworking-apprentice',
        label: 'Aprendiz de Metalurgia',
        primarySkillId: 'strength',
        secondarySkillId: 'dexterity',
        baseHourlyWage: 6,
        scoreToPromote: 140,
        vacancySlots: null,
      },
      {
        id: 'metalworker',
        label: 'Metalúrgico',
        primarySkillId: 'metallurgy',
        secondarySkillId: 'strength',
        baseHourlyWage: 10,
        scoreToPromote: 300,
        vacancySlots: 6,
      },
      {
        id: 'welder',
        label: 'Soldador Especializado',
        primarySkillId: 'metallurgy',
        secondarySkillId: 'dexterity',
        tertiarySkillId: 'mechanics',
        baseHourlyWage: 15,
        scoreToPromote: 470,
        vacancySlots: 4,
      },
      {
        id: 'maintenance-technician',
        label: 'Técnico de Manutenção',
        primarySkillId: 'mechanics',
        secondarySkillId: 'metallurgy',
        tertiarySkillId: 'electronics',
        baseHourlyWage: 21,
        scoreToPromote: 660,
        vacancySlots: 2,
      },
      {
        id: 'workshop-supervisor',
        label: 'Supervisor de Oficina',
        primarySkillId: 'metallurgy',
        secondarySkillId: 'leadership',
        baseHourlyWage: 30,
        scoreToPromote: null,
        vacancySlots: 1,
      },
    ],
  },
  {
    id: 'treasury-department',
    label: 'Secretaria da Fazenda',
    cargoHierarchy: [
      {
        id: 'administrative-assistant',
        label: 'Auxiliar Administrativo',
        primarySkillId: 'bureaucracy',
        secondarySkillId: 'intelligence',
        baseHourlyWage: 6,
        scoreToPromote: 140,
        vacancySlots: null,
      },
      {
        id: 'junior-accountant',
        label: 'Contador Júnior',
        primarySkillId: 'accounting',
        secondarySkillId: 'intelligence',
        baseHourlyWage: 10,
        scoreToPromote: 310,
        vacancySlots: 6,
      },
      {
        id: 'accountant',
        label: 'Contador',
        primarySkillId: 'accounting',
        secondarySkillId: 'bureaucracy',
        baseHourlyWage: 15,
        scoreToPromote: 490,
        vacancySlots: 4,
      },
      {
        id: 'tax-auditor',
        label: 'Auditor Fiscal',
        primarySkillId: 'accounting',
        secondarySkillId: 'investigation',
        tertiarySkillId: 'law',
        baseHourlyWage: 21,
        scoreToPromote: 680,
        vacancySlots: 2,
      },
      {
        id: 'treasury-secretary',
        label: 'Secretário da Fazenda',
        primarySkillId: 'accounting',
        secondarySkillId: 'leadership',
        baseHourlyWage: 30,
        scoreToPromote: null,
        vacancySlots: 1,
      },
    ],
  },
  {
    id: 'municipal-school',
    label: 'Escola Municipal',
    cargoHierarchy: [
      {
        id: 'classroom-monitor',
        label: 'Monitor de Sala',
        primarySkillId: 'charisma',
        secondarySkillId: 'creativity',
        baseHourlyWage: 6,
        scoreToPromote: 130,
        vacancySlots: null,
      },
      {
        id: 'assistant-teacher',
        label: 'Professor Auxiliar',
        primarySkillId: 'teaching',
        secondarySkillId: 'charisma',
        baseHourlyWage: 9,
        scoreToPromote: 280,
        vacancySlots: 6,
      },
      {
        id: 'teacher',
        label: 'Professor',
        primarySkillId: 'teaching',
        secondarySkillId: 'creativity',
        tertiarySkillId: 'intelligence',
        baseHourlyWage: 14,
        scoreToPromote: 450,
        vacancySlots: 4,
      },
      {
        id: 'pedagogical-coordinator',
        label: 'Coordenador Pedagógico',
        primarySkillId: 'teaching',
        secondarySkillId: 'leadership',
        tertiarySkillId: 'bureaucracy',
        baseHourlyWage: 20,
        scoreToPromote: 640,
        vacancySlots: 2,
      },
      {
        id: 'school-principal',
        label: 'Diretor Escolar',
        primarySkillId: 'leadership',
        secondarySkillId: 'teaching',
        baseHourlyWage: 29,
        scoreToPromote: null,
        vacancySlots: 1,
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
