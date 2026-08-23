import { NotFoundException } from '@nestjs/common';
import { RecomputeContractUseCase } from './recompute-contract.use-case';
import { RecomputeCharacterUseCase } from '../../../character/application/use-cases/recompute-character.use-case';
import { CreditCharacterMoneyUseCase } from '../../../character/application/use-cases/credit-money.use-case';
import { Character } from '../../../character/domain/entities/character.entity';
import { Lot } from '../../../city/domain/entities/lot.entity';
import { LotRepository } from '../../../city/domain/repositories/lot.repository';
import { Workplace } from '../../../city/domain/entities/workplace.entity';
import { WorkplaceRepository } from '../../../city/domain/repositories/workplace.repository';
import { Contract, ContractProps } from '../../domain/entities/contract.entity';
import { ContractRepository } from '../../domain/repositories/contract.repository';

const T0 = new Date('2026-01-01T00:00:00.000Z');
const T1 = new Date(T0.getTime() + 60 * 60 * 1000);

function contract(overrides: Partial<ContractProps> = {}): Contract {
  return new Contract({
    id: 'contract-1',
    characterId: 'char-1',
    workplaceId: 'workplace-1',
    buildingTypeId: 'city-hall',
    cargoId: 'intern',
    hourlyWage: 5,
    hoursWorked: 0,
    progressScore: 0,
    lastUpdatedAt: T0,
    ...overrides,
  });
}

function character(activity: 'idle' | 'working' = 'working', skills = { intelligence: 80, charisma: 40 }): Character {
  const created = Character.create({ firstName: 'Ana', lastName: 'Silva', accountId: 'acc-1', skills }, 'char-1', T0);
  return created.changeActivity(activity, null, T0);
}

function workplace(overrides: Partial<{ id: string; buildingTypeId: string; x: number; y: number }> = {}): Workplace {
  return Workplace.create({ buildingTypeId: 'city-hall', x: 5, y: 5, ...overrides }, overrides.id ?? 'workplace-1');
}

function lot(overrides: Partial<{ characterId: string; x: number; y: number }> = {}): Lot {
  return Lot.create({ characterId: 'char-1', type: 'residential', x: 5, y: 5, ...overrides }, 'lot-1');
}

describe('RecomputeContractUseCase', () => {
  function buildUseCase() {
    const recomputeCharacterUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RecomputeCharacterUseCase>;
    const creditCharacterMoneyUseCase = { execute: jest.fn() } as unknown as jest.Mocked<CreditCharacterMoneyUseCase>;
    const contractRepository: jest.Mocked<ContractRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCharacterId: jest.fn(),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
      countActiveByWorkplaceAndCargo: jest.fn().mockResolvedValue(0),
    };
    const lotRepository: jest.Mocked<LotRepository> = {
      save: jest.fn(),
      findAll: jest.fn(),
      findByCharacterId: jest.fn(),
    };
    const workplaceRepository: jest.Mocked<WorkplaceRepository> = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const useCase = new RecomputeContractUseCase(
      recomputeCharacterUseCase,
      creditCharacterMoneyUseCase,
      contractRepository,
      lotRepository,
      workplaceRepository,
    );

    return { useCase, recomputeCharacterUseCase, creditCharacterMoneyUseCase, contractRepository, lotRepository, workplaceRepository };
  }

  it('throws NotFoundException when the character has no active contract', async () => {
    const { useCase, contractRepository } = buildUseCase();
    contractRepository.findByCharacterId.mockResolvedValue(null);

    await expect(useCase.execute('char-1', T1)).rejects.toThrow(NotFoundException);
  });

  it('defaults now to the current time when not provided', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase } = buildUseCase();
    contractRepository.findByCharacterId.mockResolvedValue(null);
    recomputeCharacterUseCase.execute.mockResolvedValue(character());

    await expect(useCase.execute('char-1')).rejects.toThrow(NotFoundException);
  });

  it('returns the contract as-is when no time has elapsed, without saving or crediting', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository, creditCharacterMoneyUseCase } =
      buildUseCase();
    const existing = contract();
    contractRepository.findByCharacterId.mockResolvedValue(existing);
    recomputeCharacterUseCase.execute.mockResolvedValue(character());
    lotRepository.findByCharacterId.mockResolvedValue(lot());
    workplaceRepository.findById.mockResolvedValue(workplace());

    const result = await useCase.execute('char-1', T0);

    expect(result).toBe(existing);
    expect(contractRepository.trySave).not.toHaveBeenCalled();
    expect(creditCharacterMoneyUseCase.execute).not.toHaveBeenCalled();
  });

  it('computes efficiency, saves, and credits money when working and the CAS save succeeds', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository, creditCharacterMoneyUseCase } =
      buildUseCase();
    const existing = contract();
    contractRepository.findByCharacterId.mockResolvedValue(existing);
    recomputeCharacterUseCase.execute.mockResolvedValue(character('working'));
    lotRepository.findByCharacterId.mockResolvedValue(lot());
    workplaceRepository.findById.mockResolvedValue(workplace());
    contractRepository.trySave.mockImplementation(async (c) => c);

    const result = await useCase.execute('char-1', T1);

    expect(workplaceRepository.findById).toHaveBeenCalledWith('workplace-1');
    expect(lotRepository.findByCharacterId).toHaveBeenCalledWith('char-1');
    expect(contractRepository.trySave).toHaveBeenCalledWith(expect.any(Contract), T0);
    expect(creditCharacterMoneyUseCase.execute).toHaveBeenCalledWith('char-1', expect.any(Number));
    expect(result.hoursWorked).toBe(1);
  });

  it('promotes to the next cargo when its threshold is crossed and a vacancy is free', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository } = buildUseCase();
    // 'intern' -> 'assistant' needs progressScore >= 100; starting at 90 plus
    // ~1h of efficiency (skills give ~68/h at 0 distance) safely crosses it.
    const existing = contract({ progressScore: 90 });
    contractRepository.findByCharacterId.mockResolvedValue(existing);
    recomputeCharacterUseCase.execute.mockResolvedValue(character('working'));
    lotRepository.findByCharacterId.mockResolvedValue(lot());
    workplaceRepository.findById.mockResolvedValue(workplace());
    contractRepository.countActiveByWorkplaceAndCargo.mockResolvedValue(2); // assistant: vacancySlots 6, 2 occupied
    contractRepository.trySave.mockImplementation(async (c) => c);

    const result = await useCase.execute('char-1', T1);

    expect(contractRepository.countActiveByWorkplaceAndCargo).toHaveBeenCalledWith('workplace-1', 'assistant');
    expect(result.cargoId).toBe('assistant');
    expect(result.hourlyWage).toBe(8);
    expect(result.hoursWorked).toBe(0);
    expect(result.progressScore).toBe(0);
  });

  it('holds the character in the current cargo, without losing score, when the next cargo has no free vacancy', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository } = buildUseCase();
    const existing = contract({ progressScore: 90 });
    contractRepository.findByCharacterId.mockResolvedValue(existing);
    recomputeCharacterUseCase.execute.mockResolvedValue(character('working'));
    lotRepository.findByCharacterId.mockResolvedValue(lot());
    workplaceRepository.findById.mockResolvedValue(workplace());
    contractRepository.countActiveByWorkplaceAndCargo.mockResolvedValue(6); // assistant: vacancySlots 6, all occupied
    contractRepository.trySave.mockImplementation(async (c) => c);

    const result = await useCase.execute('char-1', T1);

    expect(result.cargoId).toBe('intern');
    expect(result.hourlyWage).toBe(5);
    expect(result.progressScore).toBeGreaterThanOrEqual(100); // eligible, just represado waiting for a slot
  });

  it('does not credit money when the character is not working (moneyEarned stays 0)', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository, creditCharacterMoneyUseCase } =
      buildUseCase();
    const existing = contract();
    contractRepository.findByCharacterId.mockResolvedValue(existing);
    recomputeCharacterUseCase.execute.mockResolvedValue(character('idle'));
    lotRepository.findByCharacterId.mockResolvedValue(lot());
    workplaceRepository.findById.mockResolvedValue(workplace());
    contractRepository.trySave.mockImplementation(async (c) => c);

    await useCase.execute('char-1', T1);

    expect(creditCharacterMoneyUseCase.execute).not.toHaveBeenCalled();
  });

  it('treats efficiency as 0 and skips lot/workplace lookups when the cargo is missing from the catalog', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository } = buildUseCase();
    const existing = contract({ buildingTypeId: 'unknown-building', cargoId: 'unknown-cargo' });
    contractRepository.findByCharacterId.mockResolvedValue(existing);
    recomputeCharacterUseCase.execute.mockResolvedValue(character('working'));
    contractRepository.trySave.mockImplementation(async (c) => c);

    const result = await useCase.execute('char-1', T1);

    expect(lotRepository.findByCharacterId).not.toHaveBeenCalled();
    expect(workplaceRepository.findById).not.toHaveBeenCalled();
    expect(result.hoursWorked).toBe(1);
  });

  it('throws NotFoundException when the workplace no longer exists', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository } = buildUseCase();
    contractRepository.findByCharacterId.mockResolvedValue(contract());
    recomputeCharacterUseCase.execute.mockResolvedValue(character('working'));
    lotRepository.findByCharacterId.mockResolvedValue(lot());
    workplaceRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('char-1', T1)).rejects.toThrow(NotFoundException);
  });

  it('on CAS conflict, returns the current saved contract instead of double-crediting', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository, creditCharacterMoneyUseCase } =
      buildUseCase();
    const existing = contract();
    const winner = contract({ hoursWorked: 2, progressScore: 100 });
    contractRepository.findByCharacterId.mockResolvedValueOnce(existing).mockResolvedValueOnce(winner);
    recomputeCharacterUseCase.execute.mockResolvedValue(character('working'));
    lotRepository.findByCharacterId.mockResolvedValue(lot());
    workplaceRepository.findById.mockResolvedValue(workplace());
    contractRepository.trySave.mockResolvedValue(null);

    const result = await useCase.execute('char-1', T1);

    expect(result).toBe(winner);
    expect(creditCharacterMoneyUseCase.execute).not.toHaveBeenCalled();
  });

  it('on CAS conflict, falls back to the locally recomputed contract if nothing is found afterward', async () => {
    const { useCase, contractRepository, recomputeCharacterUseCase, lotRepository, workplaceRepository } = buildUseCase();
    contractRepository.findByCharacterId.mockResolvedValueOnce(contract()).mockResolvedValueOnce(null);
    recomputeCharacterUseCase.execute.mockResolvedValue(character('working'));
    lotRepository.findByCharacterId.mockResolvedValue(lot());
    workplaceRepository.findById.mockResolvedValue(workplace());
    contractRepository.trySave.mockResolvedValue(null);

    const result = await useCase.execute('char-1', T1);

    expect(result).toBeInstanceOf(Contract);
    expect(result.hoursWorked).toBe(1);
  });
});
