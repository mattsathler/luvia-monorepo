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

/**
 * Mapa skillId -> pontos. Todo personagem nasce sem nenhuma entrada aqui
 * (nível 0 em tudo) — não existe alocação inicial de pontos, ver
 * docs/decisions/0024-personagem-nasce-sem-skills.md. Skills só crescem
 * jogando (ex.: atividade "Estudar", ainda não implementada).
 */
export type SkillPoints = Record<string, number>;
