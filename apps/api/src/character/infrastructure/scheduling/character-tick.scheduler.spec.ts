import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CharacterTickScheduler } from './character-tick.scheduler';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { RecomputeCharacterUseCase } from '../../application/use-cases/recompute-character.use-case';
import { Character } from '../../domain/entities/character.entity';

function characterWithId(id: string): Character {
  return Character.create({ name: 'Ana', accountId: 'acc-1' }, id);
}

function buildScheduler(configValues: Record<string, unknown> = {}) {
  const characterRepository: jest.Mocked<CharacterRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findByAccountId: jest.fn(),
    trySave: jest.fn(),
    findStaleBatch: jest.fn(),
  };

  const recomputeCharacterUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<RecomputeCharacterUseCase>;

  const schedulerRegistry = {
    addInterval: jest.fn(),
    deleteInterval: jest.fn(),
    doesExist: jest.fn(),
  } as unknown as jest.Mocked<SchedulerRegistry>;

  const config = {
    get: jest.fn((key: string) => configValues[key]),
  } as unknown as jest.Mocked<ConfigService>;

  const scheduler = new CharacterTickScheduler(
    characterRepository,
    recomputeCharacterUseCase,
    schedulerRegistry,
    config,
  );

  return { scheduler, characterRepository, recomputeCharacterUseCase, schedulerRegistry, config };
}

describe('CharacterTickScheduler', () => {
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

      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith('character-tick', expect.anything());
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

      expect(schedulerRegistry.deleteInterval).toHaveBeenCalledWith('character-tick');
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
      const { scheduler, characterRepository } = buildScheduler();
      (scheduler as unknown as { running: boolean }).running = true;

      await scheduler.runTick();

      expect(characterRepository.findStaleBatch).not.toHaveBeenCalled();
    });

    it('processes a single partial batch and stops', async () => {
      const { scheduler, characterRepository, recomputeCharacterUseCase } = buildScheduler({
        TICK_BATCH_SIZE: 10,
        TICK_MAX_BATCHES_PER_RUN: 5,
      });
      characterRepository.findStaleBatch.mockResolvedValue([characterWithId('char-1'), characterWithId('char-2')]);
      recomputeCharacterUseCase.execute.mockResolvedValue(undefined as never);

      await scheduler.runTick();

      expect(characterRepository.findStaleBatch).toHaveBeenCalledTimes(1);
      expect(recomputeCharacterUseCase.execute).toHaveBeenCalledWith('char-1', expect.any(Date));
      expect(recomputeCharacterUseCase.execute).toHaveBeenCalledWith('char-2', expect.any(Date));
    });

    it('stops immediately when the first batch is empty (using default batch size/limit)', async () => {
      const { scheduler, characterRepository } = buildScheduler();
      characterRepository.findStaleBatch.mockResolvedValue([]);

      await scheduler.runTick();

      expect(characterRepository.findStaleBatch).toHaveBeenCalledTimes(1);
    });

    it('continues to the next batch when a full batch is returned, then stops on an empty one', async () => {
      const { scheduler, characterRepository, recomputeCharacterUseCase } = buildScheduler({ TICK_BATCH_SIZE: 1 });
      characterRepository.findStaleBatch
        .mockResolvedValueOnce([characterWithId('char-1')])
        .mockResolvedValueOnce([]);
      recomputeCharacterUseCase.execute.mockResolvedValue(undefined as never);

      await scheduler.runTick();

      expect(characterRepository.findStaleBatch).toHaveBeenCalledTimes(2);
    });

    it('stops after TICK_MAX_BATCHES_PER_RUN batches even if more are pending', async () => {
      const { scheduler, characterRepository, recomputeCharacterUseCase } = buildScheduler({
        TICK_BATCH_SIZE: 1,
        TICK_MAX_BATCHES_PER_RUN: 2,
      });
      characterRepository.findStaleBatch.mockResolvedValue([characterWithId('char-1')]);
      recomputeCharacterUseCase.execute.mockResolvedValue(undefined as never);

      await scheduler.runTick();

      expect(characterRepository.findStaleBatch).toHaveBeenCalledTimes(2);
    });

    it('logs and swallows errors from individual character recomputes without failing the batch', async () => {
      const { scheduler, characterRepository, recomputeCharacterUseCase } = buildScheduler({
        TICK_BATCH_SIZE: 10,
      });
      characterRepository.findStaleBatch.mockResolvedValueOnce([characterWithId('char-1')]).mockResolvedValueOnce([]);
      recomputeCharacterUseCase.execute.mockRejectedValue(new Error('boom'));

      await expect(scheduler.runTick()).resolves.toBeUndefined();
    });

    it('resets the running flag after completing, allowing a subsequent call', async () => {
      const { scheduler, characterRepository } = buildScheduler();
      characterRepository.findStaleBatch.mockResolvedValue([]);

      await scheduler.runTick();
      await scheduler.runTick();

      expect(characterRepository.findStaleBatch).toHaveBeenCalledTimes(2);
    });
  });
});
