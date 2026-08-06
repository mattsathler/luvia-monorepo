export type SkillDefinition = {
  id: string;
  label: string;
};

/**
 * Catálogo de skills — provisório até o balanceamento de game design ser
 * decidido (ver docs/game-design/skills-and-study.md). Adicionar uma skill
 * nova é só acrescentar uma entrada aqui: `skills` é persistido como um mapa
 * livre (id -> pontos), sem exigir migração de schema.
 */
export const SKILL_DEFINITIONS: SkillDefinition[] = [
  { id: 'intelligence', label: 'Inteligência' },
  { id: 'charisma', label: 'Carisma' },
  { id: 'creativity', label: 'Criatividade' },
  { id: 'strength', label: 'Força' },
];

export const SKILL_IDS = SKILL_DEFINITIONS.map((skill) => skill.id);

export type SkillPoints = Record<string, number>;

/** Total de pontos que o jogador distribui entre as skills na criação do personagem. */
export const INITIAL_SKILL_POINTS_BUDGET = 4;

/**
 * Só aceita ids de skill conhecidos (catálogo acima), valores inteiros não
 * negativos, e a soma exata do orçamento inicial — nem mais, nem menos.
 */
export function isValidInitialSkillAllocation(skills: SkillPoints): boolean {
  const entries = Object.entries(skills);

  if (!entries.every(([id, points]) => SKILL_IDS.includes(id) && Number.isInteger(points) && points >= 0)) {
    return false;
  }

  const total = entries.reduce((sum, [, points]) => sum + points, 0);

  return total === INITIAL_SKILL_POINTS_BUDGET;
}
