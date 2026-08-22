import { Contract, ContractProps } from './contract.entity';

const BASE_TIME = new Date('2024-01-01T00:00:00.000Z');
const ONE_HOUR_LATER = new Date(BASE_TIME.getTime() + 60 * 60 * 1000);

function contract(overrides: Partial<ContractProps> = {}): Contract {
  return new Contract({
    id: 'contract-1',
    characterId: 'character-1',
    workplaceId: 'workplace-1',
    buildingTypeId: 'city-hall',
    cargoId: 'intern',
    hourlyWage: 5,
    hoursWorked: 0,
    progressScore: 0,
    lastUpdatedAt: BASE_TIME,
    ...overrides,
  });
}

describe('Contract.start', () => {
  it('creates a contract at the given cargo with zeroed hours/score', () => {
    const started = Contract.start(
      { characterId: 'character-1', workplaceId: 'workplace-1', buildingTypeId: 'city-hall', cargoId: 'intern', hourlyWage: 5 },
      'contract-1',
      BASE_TIME,
    );

    expect(started.hoursWorked).toBe(0);
    expect(started.progressScore).toBe(0);
    expect(started.lastUpdatedAt).toBe(BASE_TIME);
    expect(started.cargoId).toBe('intern');
    expect(started.hourlyWage).toBe(5);
  });

  it('defaults lastUpdatedAt to now when not provided', () => {
    const started = Contract.start(
      { characterId: 'character-1', workplaceId: 'workplace-1', buildingTypeId: 'city-hall', cargoId: 'intern', hourlyWage: 5 },
      'contract-1',
    );

    expect(started.lastUpdatedAt).toBeInstanceOf(Date);
  });
});

describe('Contract.recomputeUntil', () => {
  it('returns the same contract unchanged when no time has elapsed', () => {
    const original = contract();

    const { contract: recomputed, previousLastUpdatedAt, moneyEarned } = original.recomputeUntil(BASE_TIME, true, 100);

    expect(recomputed).toBe(original);
    expect(previousLastUpdatedAt).toBe(BASE_TIME);
    expect(moneyEarned).toBe(0);
  });

  it('freezes accrual but advances the clock when the character is not working', () => {
    const original = contract({ hoursWorked: 5, progressScore: 40 });

    const { contract: recomputed, moneyEarned } = original.recomputeUntil(ONE_HOUR_LATER, false, 100);

    expect(recomputed.hoursWorked).toBe(5);
    expect(recomputed.progressScore).toBe(40);
    expect(recomputed.lastUpdatedAt).toBe(ONE_HOUR_LATER);
    expect(moneyEarned).toBe(0);
  });

  it('accrues hours/score/money proportionally to efficiency when working, without promoting', () => {
    const original = contract();

    const { contract: recomputed, moneyEarned } = original.recomputeUntil(ONE_HOUR_LATER, true, 50);

    expect(recomputed.hoursWorked).toBe(1);
    expect(recomputed.progressScore).toBe(50);
    expect(moneyEarned).toBe(2.5); // 1h * 5/h * 50%
    expect(recomputed.cargoId).toBe('intern');
    expect(recomputed.hourlyWage).toBe(5);
  });

  it('promotes to the next cargo and resets hours/score when the threshold is crossed', () => {
    const original = contract();

    const { contract: recomputed, moneyEarned } = original.recomputeUntil(ONE_HOUR_LATER, true, 100);

    expect(moneyEarned).toBe(5); // 1h * 5/h * 100%, at the pre-promotion wage
    expect(recomputed.cargoId).toBe('assistant');
    expect(recomputed.hourlyWage).toBe(8);
    expect(recomputed.hoursWorked).toBe(0);
    expect(recomputed.progressScore).toBe(0);
  });

  it('never promotes past the last cargo in the hierarchy (scoreToPromote: null)', () => {
    const original = contract({ cargoId: 'coordinator', hourlyWage: 14, hoursWorked: 900, progressScore: 900 });
    const farInTheFuture = new Date(BASE_TIME.getTime() + 1000 * 60 * 60 * 1000);

    const { contract: recomputed } = original.recomputeUntil(farInTheFuture, true, 100);

    expect(recomputed.cargoId).toBe('coordinator');
    expect(recomputed.hourlyWage).toBe(14);
    expect(recomputed.hoursWorked).toBe(1900);
    expect(recomputed.progressScore).toBe(100900); // 900 + 100 (efficiency) * 1000h
  });

  it('still accrues normally, without promotion logic, when the cargo is missing from the catalog', () => {
    const original = contract({ buildingTypeId: 'unknown-building', cargoId: 'unknown-cargo', hourlyWage: 10 });

    const { contract: recomputed, moneyEarned } = original.recomputeUntil(ONE_HOUR_LATER, true, 50);

    expect(recomputed.hoursWorked).toBe(1);
    expect(recomputed.progressScore).toBe(50);
    expect(moneyEarned).toBe(5); // 1h * 10/h * 50%
    expect(recomputed.cargoId).toBe('unknown-cargo');
  });
});
