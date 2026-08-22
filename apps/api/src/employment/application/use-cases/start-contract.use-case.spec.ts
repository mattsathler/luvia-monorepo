import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { StartContractUseCase } from './start-contract.use-case';
import { RecomputeCharacterUseCase } from '../../../character/application/use-cases/recompute-character.use-case';
import { ChangeActivityUseCase } from '../../../character/application/use-cases/change-activity.use-case';
import { Character } from '../../../character/domain/entities/character.entity';
import { Workplace } from '../../../city/domain/entities/workplace.entity';
import { WorkplaceRepository } from '../../../city/domain/repositories/workplace.repository';
import { Contract, ContractProps } from '../../domain/entities/contract.entity';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { RecomputeContractUseCase } from './recompute-contract.use-case';

const T0 = new Date('2026-01-01T00:00:00.000Z');

function character(overrides: Partial<{ accountId: string }> = {}): Character {
  return Character.create({ firstName: 'Ana', lastName: 'Silva', accountId: 'acc-1', ...overrides }, 'char-1', T0);
}

function workplace(overrides: Partial<{ id: string; buildingTypeId: string }> = {}): Workplace {
  return Workplace.create({ buildingTypeId: 'city-hall', x: 5, y: 5, ...overrides }, overrides.id ?? 'workplace-1');
}

function existingContract(overrides: Partial<ContractProps> = {}): Contract {
  return new Contract({
    id: 'old-contract',
    characterId: 'char-1',
    workplaceId: 'old-workplace',
    buildingTypeId: 'city-hall',
    cargoId: 'intern',
    hourlyWage: 5,
    hoursWorked: 3,
    progressScore: 20,
    lastUpdatedAt: T0,
    ...overrides,
  });
}

describe('StartContractUseCase', () => {
  function buildUseCase() {
    const recomputeCharacterUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RecomputeCharacterUseCase>;
    const recomputeContractUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RecomputeContractUseCase>;
    const changeActivityUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ChangeActivityUseCase>;
    const contractRepository: jest.Mocked<ContractRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCharacterId: jest.fn(),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
    };
    const workplaceRepository: jest.Mocked<WorkplaceRepository> = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const useCase = new StartContractUseCase(
      recomputeCharacterUseCase,
      recomputeContractUseCase,
      changeActivityUseCase,
      contractRepository,
      workplaceRepository,
    );

    return { useCase, recomputeCharacterUseCase, recomputeContractUseCase, changeActivityUseCase, contractRepository, workplaceRepository };
  }

  it('throws ForbiddenException when the account does not own the character', async () => {
    const { useCase, recomputeCharacterUseCase } = buildUseCase();
    recomputeCharacterUseCase.execute.mockResolvedValue(character({ accountId: 'someone-else' }));

    await expect(
      useCase.execute({ characterId: 'char-1', accountId: 'acc-1', workplaceId: 'workplace-1' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFoundException when the workplace does not exist', async () => {
    const { useCase, recomputeCharacterUseCase, workplaceRepository } = buildUseCase();
    recomputeCharacterUseCase.execute.mockResolvedValue(character());
    workplaceRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ characterId: 'char-1', accountId: 'acc-1', workplaceId: 'workplace-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when the workplace building type has no catalog entry', async () => {
    const { useCase, recomputeCharacterUseCase, workplaceRepository } = buildUseCase();
    recomputeCharacterUseCase.execute.mockResolvedValue(character());
    workplaceRepository.findById.mockResolvedValue(workplace({ buildingTypeId: 'unknown-building' }));

    await expect(
      useCase.execute({ characterId: 'char-1', accountId: 'acc-1', workplaceId: 'workplace-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('starts a fresh contract at the first cargo, saves it, and flips activity to working', async () => {
    const { useCase, recomputeCharacterUseCase, workplaceRepository, contractRepository, changeActivityUseCase, recomputeContractUseCase } =
      buildUseCase();
    recomputeCharacterUseCase.execute.mockResolvedValue(character());
    workplaceRepository.findById.mockResolvedValue(workplace());
    contractRepository.findByCharacterId.mockResolvedValue(null);
    contractRepository.save.mockImplementation(async (c) => c);

    const result = await useCase.execute({ characterId: 'char-1', accountId: 'acc-1', workplaceId: 'workplace-1' });

    expect(recomputeContractUseCase.execute).not.toHaveBeenCalled();
    expect(result.cargoId).toBe('intern');
    expect(result.hourlyWage).toBe(5);
    expect(result.hoursWorked).toBe(0);
    expect(contractRepository.save).toHaveBeenCalledWith(expect.any(Contract));
    expect(changeActivityUseCase.execute).toHaveBeenCalledWith({
      characterId: 'char-1',
      accountId: 'acc-1',
      activity: 'working',
      activityEndsAt: null,
    });
  });

  it('flushes earnings on an existing contract before replacing it', async () => {
    const { useCase, recomputeCharacterUseCase, workplaceRepository, contractRepository, recomputeContractUseCase } = buildUseCase();
    recomputeCharacterUseCase.execute.mockResolvedValue(character());
    workplaceRepository.findById.mockResolvedValue(workplace());
    contractRepository.findByCharacterId.mockResolvedValue(existingContract());
    contractRepository.save.mockImplementation(async (c) => c);

    await useCase.execute({ characterId: 'char-1', accountId: 'acc-1', workplaceId: 'workplace-1' });

    expect(recomputeContractUseCase.execute).toHaveBeenCalledWith('char-1', expect.any(Date));
  });
});
