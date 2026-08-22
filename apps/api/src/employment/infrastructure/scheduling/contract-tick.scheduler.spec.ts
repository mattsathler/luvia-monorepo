import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ContractTickScheduler } from './contract-tick.scheduler';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { RecomputeContractUseCase } from '../../application/use-cases/recompute-contract.use-case';
import { Contract } from '../../domain/entities/contract.entity';

function contractForCharacter(characterId: string): Contract {
  return new Contract({
    id: `contract-${characterId}`,
    characterId,
    workplaceId: 'workplace-1',
    buildingTypeId: 'city-hall',
    cargoId: 'intern',
    hourlyWage: 5,
    hoursWorked: 0,
    progressScore: 0,
    lastUpdatedAt: new Date(),
  });
}

function buildScheduler(configValues: Record<string, unknown> = {}) {
  const contractRepository: jest.Mocked<ContractRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findByCharacterId: jest.fn(),
    trySave: jest.fn(),
    findStaleBatch: jest.fn(),
  };

  const recomputeContractUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<RecomputeContractUseCase>;

  const schedulerRegistry = {
    addInterval: jest.fn(),
    deleteInterval: jest.fn(),
    doesExist: jest.fn(),
  } as unknown as jest.Mocked<SchedulerRegistry>;

  const config = {
    get: jest.fn((key: string) => configValues[key]),
  } as unknown as jest.Mocked<ConfigService>;

  const scheduler = new ContractTickScheduler(contractRepository, recomputeContractUseCase, schedulerRegistry, config);

  return { scheduler, contractRepository, recomputeContractUseCase, schedulerRegistry, config };
}

describe('ContractTickScheduler', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('onModuleInit', () => {
    it('registers an interval using the configured TICK_INTERVAL_MS, which calls runTick when it fires', () => {
      jest.useFakeTimers();
      const { scheduler, schedulerRegistry } = buildScheduler({ TICK_INTERVAL_MS: 5000 });
      const runTickSpy = jest.spyOn(scheduler, 'runTick').mockResolvedValue(undefined);

      scheduler.onModuleInit();
      jest.advanceTimersByTime(5000);

      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith('contract-tick', expect.anything());
      expect(runTickSpy).toHaveBeenCalledTimes(1);
    });

    it('falls back to 60000ms when TICK_INTERVAL_MS is not set', () => {
      jest.useFakeTimers();
      const { scheduler, schedulerRegistry } = buildScheduler({});

      scheduler.onModuleInit();

      expect(schedulerRegistry.addInterval).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('deletes the interval when it exists', () => {
      const { scheduler, schedulerRegistry } = buildScheduler();
      schedulerRegistry.doesExist.mockReturnValue(true);

      scheduler.onModuleDestroy();

      expect(schedulerRegistry.deleteInterval).toHaveBeenCalledWith('contract-tick');
    });

    it('does nothing when the interval does not exist', () => {
      const { scheduler, schedulerRegistry } = buildScheduler();
      schedulerRegistry.doesExist.mockReturnValue(false);

      scheduler.onModuleDestroy();

      expect(schedulerRegistry.deleteInterval).not.toHaveBeenCalled();
    });
  });

  describe('runTick', () => {
    it('does nothing when already running', async () => {
      const { scheduler, contractRepository } = buildScheduler();
      (scheduler as unknown as { running: boolean }).running = true;

      await scheduler.runTick();

      expect(contractRepository.findStaleBatch).not.toHaveBeenCalled();
    });

    it('processes a single partial batch and stops', async () => {
      const { scheduler, contractRepository, recomputeContractUseCase } = buildScheduler({
        TICK_BATCH_SIZE: 10,
        TICK_MAX_BATCHES_PER_RUN: 5,
      });
      contractRepository.findStaleBatch.mockResolvedValue([contractForCharacter('char-1'), contractForCharacter('char-2')]);
      recomputeContractUseCase.execute.mockResolvedValue(undefined as never);

      await scheduler.runTick();

      expect(contractRepository.findStaleBatch).toHaveBeenCalledTimes(1);
      expect(recomputeContractUseCase.execute).toHaveBeenCalledWith('char-1', expect.any(Date));
      expect(recomputeContractUseCase.execute).toHaveBeenCalledWith('char-2', expect.any(Date));
    });

    it('stops immediately when the first batch is empty (using default batch size/limit)', async () => {
      const { scheduler, contractRepository } = buildScheduler();
      contractRepository.findStaleBatch.mockResolvedValue([]);

      await scheduler.runTick();

      expect(contractRepository.findStaleBatch).toHaveBeenCalledTimes(1);
    });

    it('continues to the next batch when a full batch is returned, then stops on an empty one', async () => {
      const { scheduler, contractRepository, recomputeContractUseCase } = buildScheduler({ TICK_BATCH_SIZE: 1 });
      contractRepository.findStaleBatch
        .mockResolvedValueOnce([contractForCharacter('char-1')])
        .mockResolvedValueOnce([]);
      recomputeContractUseCase.execute.mockResolvedValue(undefined as never);

      await scheduler.runTick();

      expect(contractRepository.findStaleBatch).toHaveBeenCalledTimes(2);
    });

    it('stops after TICK_MAX_BATCHES_PER_RUN batches even if more are pending', async () => {
      const { scheduler, contractRepository, recomputeContractUseCase } = buildScheduler({
        TICK_BATCH_SIZE: 1,
        TICK_MAX_BATCHES_PER_RUN: 2,
      });
      contractRepository.findStaleBatch.mockResolvedValue([contractForCharacter('char-1')]);
      recomputeContractUseCase.execute.mockResolvedValue(undefined as never);

      await scheduler.runTick();

      expect(contractRepository.findStaleBatch).toHaveBeenCalledTimes(2);
    });

    it('logs and swallows errors from individual contract recomputes without failing the batch', async () => {
      const { scheduler, contractRepository, recomputeContractUseCase } = buildScheduler({
        TICK_BATCH_SIZE: 10,
      });
      contractRepository.findStaleBatch.mockResolvedValueOnce([contractForCharacter('char-1')]).mockResolvedValueOnce([]);
      recomputeContractUseCase.execute.mockRejectedValue(new Error('boom'));

      await expect(scheduler.runTick()).resolves.toBeUndefined();
    });

    it('resets the running flag after completing, allowing a subsequent call', async () => {
      const { scheduler, contractRepository } = buildScheduler();
      contractRepository.findStaleBatch.mockResolvedValue([]);

      await scheduler.runTick();
      await scheduler.runTick();

      expect(contractRepository.findStaleBatch).toHaveBeenCalledTimes(2);
    });
  });
});
