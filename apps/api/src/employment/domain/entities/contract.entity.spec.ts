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

  it('becomes eligible for promotion, without promoting itself, when the threshold is crossed', () => {
    const original = contract();

    const { contract: recomputed, moneyEarned, promotionEligible } = original.recomputeUntil(ONE_HOUR_LATER, true, 100);

    expect(moneyEarned).toBe(5); // 1h * 5/h * 100%, at the current wage
    expect(recomputed.cargoId).toBe('intern'); // recomputeUntil never changes cargoId by itself
    expect(recomputed.hourlyWage).toBe(5);
    expect(recomputed.hoursWorked).toBe(1);
    expect(recomputed.progressScore).toBe(100);
    expect(promotionEligible).toBe(true);
  });

  it('is not eligible for promotion while under the threshold', () => {
    const original = contract();

    const { promotionEligible } = original.recomputeUntil(ONE_HOUR_LATER, true, 50);

    expect(promotionEligible).toBe(false);
  });

  it('is never eligible for promotion past the last cargo in the hierarchy (scoreToPromote: null)', () => {
    const original = contract({ cargoId: 'coordinator', hourlyWage: 14, hoursWorked: 900, progressScore: 900 });
    const farInTheFuture = new Date(BASE_TIME.getTime() + 1000 * 60 * 60 * 1000);

    const { contract: recomputed, promotionEligible } = original.recomputeUntil(farInTheFuture, true, 100);

    expect(recomputed.cargoId).toBe('coordinator');
    expect(recomputed.hourlyWage).toBe(14);
    expect(recomputed.hoursWorked).toBe(1900);
    expect(recomputed.progressScore).toBe(100900); // 900 + 100 (efficiency) * 1000h
    expect(promotionEligible).toBe(false);
  });

  it('still accrues normally, without promotion eligibility, when the cargo is missing from the catalog', () => {
    const original = contract({ buildingTypeId: 'unknown-building', cargoId: 'unknown-cargo', hourlyWage: 10 });

    const { contract: recomputed, moneyEarned, promotionEligible } = original.recomputeUntil(ONE_HOUR_LATER, true, 50);

    expect(recomputed.hoursWorked).toBe(1);
    expect(recomputed.progressScore).toBe(50);
    expect(moneyEarned).toBe(5); // 1h * 10/h * 50%
    expect(recomputed.cargoId).toBe('unknown-cargo');
    expect(promotionEligible).toBe(false);
  });
});

describe('Contract.isPromotionEligible', () => {
  it('is false when progressScore is under the cargo threshold', () => {
    expect(contract({ progressScore: 99 }).isPromotionEligible()).toBe(false);
  });

  it('is true when progressScore reaches the cargo threshold', () => {
    expect(contract({ progressScore: 100 }).isPromotionEligible()).toBe(true);
  });

  it('is false at the last cargo in the hierarchy (scoreToPromote: null)', () => {
    expect(contract({ cargoId: 'coordinator', progressScore: 999_999 }).isPromotionEligible()).toBe(false);
  });

  it('is false when the cargo is missing from the catalog', () => {
    expect(
      contract({ buildingTypeId: 'unknown-building', cargoId: 'unknown-cargo', progressScore: 999_999 }).isPromotionEligible(),
    ).toBe(false);
  });
});

describe('Contract.promote', () => {
  it('moves to the next cargo, copies its base wage, and resets hours/score', () => {
    const original = contract({ hoursWorked: 12, progressScore: 100 });

    const promoted = original.promote();

    expect(promoted.cargoId).toBe('assistant');
    expect(promoted.hourlyWage).toBe(8);
    expect(promoted.hoursWorked).toBe(0);
    expect(promoted.progressScore).toBe(0);
  });

  it('keeps lastUpdatedAt unchanged (caller already recomputed up to now)', () => {
    const original = contract({ progressScore: 100 });

    expect(original.promote().lastUpdatedAt).toBe(BASE_TIME);
  });
});
