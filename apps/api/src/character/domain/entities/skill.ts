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
export const SKILL_DEFINITIONS = [
  { id: 'intelligence', label: 'Inteligência' },
  { id: 'charisma', label: 'Carisma' },
  { id: 'creativity', label: 'Criatividade' },
  { id: 'strength', label: 'Força' },
  { id: 'dexterity', label: 'Destreza' },
  { id: 'endurance', label: 'Resistência' },
  { id: 'discipline', label: 'Disciplina' },
  { id: 'leadership', label: 'Liderança' },
  { id: 'medicine', label: 'Medicina' },
  { id: 'law', label: 'Direito' },
  { id: 'investigation', label: 'Investigação' },
  { id: 'marksmanship', label: 'Pontaria' },
  { id: 'tactics', label: 'Tática' },
  { id: 'accounting', label: 'Contabilidade' },
  { id: 'bureaucracy', label: 'Burocracia' },
  { id: 'construction', label: 'Construção Civil' },
  { id: 'engineering', label: 'Engenharia' },
  { id: 'metallurgy', label: 'Metalurgia' },
  { id: 'mechanics', label: 'Mecânica' },
  { id: 'electronics', label: 'Eletrônica' },
  { id: 'teaching', label: 'Docência' },
] as const satisfies readonly SkillDefinition[];

/** Union literal dos ids de skill — usado pelo catálogo de cargos (employment) pra referenciar skills com segurança de tipo em compile-time, sem precisar validar em runtime. */
export type SkillId = (typeof SKILL_DEFINITIONS)[number]['id'];

export const SKILL_IDS: SkillId[] = SKILL_DEFINITIONS.map((skill) => skill.id);

/**
 * Mapa skillId -> pontos. Todo personagem nasce sem nenhuma entrada aqui
 * (nível 0 em tudo) — não existe alocação inicial de pontos, ver
 * docs/decisions/0024-personagem-nasce-sem-skills.md. Skills só crescem
 * jogando (ex.: atividade "Estudar", ainda não implementada).
 */
export type SkillPoints = Record<string, number>;
