import { Model } from 'mongoose';
import { WorldClockMongoRepository } from './world-clock.mongo.repository';
import { WorldClock, WorldClockProps } from '../../domain/entities/world-clock.entity';
import { WorldClockDocument } from './world-clock.schema';

function worldClockDocument(overrides: Partial<WorldClockDocument> = {}): WorldClockDocument {
  return {
    key: 'default',
    epoch: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  } as WorldClockDocument;
}

function worldClock(overrides: Partial<WorldClockProps> = {}): WorldClock {
  return new WorldClock({
    epoch: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });
}

function queryMock(result: unknown) {
  return { exec: jest.fn().mockResolvedValue(result) };
}

describe('WorldClockMongoRepository', () => {
  function buildRepository() {
    const model = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Model<WorldClockDocument>>;

    const repository = new WorldClockMongoRepository(model);
    return { repository, model };
  }

  it('save() upserts the singleton document and returns the same instance', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(worldClockDocument()));

    const input = worldClock();
    const result = await repository.save(input);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { key: 'default' },
      { key: 'default', epoch: input.epoch },
      { upsert: true, returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('find() maps the document to a domain WorldClock', async () => {
    const { repository, model } = buildRepository();
    const epoch = new Date('2026-02-14T00:00:00.000Z');
    (model.findOne as jest.Mock).mockReturnValue(queryMock(worldClockDocument({ epoch })));

    const result = await repository.find();

    expect(model.findOne).toHaveBeenCalledWith({ key: 'default' });
    expect(result).toBeInstanceOf(WorldClock);
    expect(result?.epoch).toEqual(epoch);
  });

  it('find() returns null when no document is found', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.find();

    expect(result).toBeNull();
  });
});
