import { chebyshevDistance, computeDistanceFactor, computeEfficiency, computeSkillEfficiency } from './efficiency';
import { CargoDefinition } from './building-catalog';

function cargo(overrides: Partial<CargoDefinition> = {}): CargoDefinition {
  return {
    id: 'cargo-1',
    label: 'Cargo',
    primarySkillId: 'intelligence',
    baseHourlyWage: 10,
    scoreToPromote: 100,
    vacancySlots: null,
    ...overrides,
  };
}

describe('computeSkillEfficiency', () => {
  it('uses only the primary skill, at full weight, when no secondary/tertiary is defined', () => {
    const result = computeSkillEfficiency({ intelligence: 80 }, cargo());

    expect(result).toBe(80);
  });

  it('renormalizes weights between primary and secondary when tertiary is absent', () => {
    const result = computeSkillEfficiency(
      { intelligence: 80, charisma: 40 },
      cargo({ secondarySkillId: 'charisma' }),
    );

    // (0.6/0.85)*80 + (0.25/0.85)*40
    expect(result).toBeCloseTo(68.235, 2);
  });

  it('uses all three weights as-is when primary/secondary/tertiary are all defined (they already sum to 1)', () => {
    const result = computeSkillEfficiency(
      { intelligence: 80, charisma: 40, creativity: 20 },
      cargo({ secondarySkillId: 'charisma', tertiarySkillId: 'creativity' }),
    );

    expect(result).toBe(0.6 * 80 + 0.25 * 40 + 0.15 * 20);
  });

  it('treats a skill the character has no points in as 0', () => {
    const result = computeSkillEfficiency({}, cargo());

    expect(result).toBe(0);
  });

  it('treats missing secondary/tertiary skill points as 0 even when the cargo defines those skills', () => {
    const result = computeSkillEfficiency(
      { intelligence: 80 },
      cargo({ secondarySkillId: 'charisma', tertiarySkillId: 'creativity' }),
    );

    expect(result).toBe(0.6 * 80 + 0.25 * 0 + 0.15 * 0);
  });
});

describe('chebyshevDistance', () => {
  it('is the max of the absolute differences on each axis', () => {
    expect(chebyshevDistance({ x: 0, y: 0 }, { x: 3, y: 7 })).toBe(7);
    expect(chebyshevDistance({ x: 0, y: 0 }, { x: 7, y: 3 })).toBe(7);
  });

  it('is 0 for the same position', () => {
    expect(chebyshevDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });
});

describe('computeDistanceFactor', () => {
  it('returns 1 (no penalty) when the workplace is at the same position as the lot', () => {
    expect(computeDistanceFactor({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(1);
  });

  it('reduces the factor linearly with distance', () => {
    expect(computeDistanceFactor({ x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(0.9, 5);
  });

  it('clamps at the floor instead of going to 0 or negative for very large distances', () => {
    expect(computeDistanceFactor({ x: 0, y: 0 }, { x: 100, y: 0 })).toBe(0.4);
  });

  it('returns the floor when there is no residential lot at all', () => {
    expect(computeDistanceFactor(null, { x: 5, y: 5 })).toBe(0.4);
  });
});

describe('computeEfficiency', () => {
  it('multiplies skill efficiency by the distance factor', () => {
    const result = computeEfficiency({ intelligence: 80 }, cargo(), { x: 0, y: 0 }, { x: 10, y: 0 });

    expect(result).toBeCloseTo(80 * 0.9, 5);
  });
});
