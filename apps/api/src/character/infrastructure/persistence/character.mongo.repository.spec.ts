import { Model } from 'mongoose';
import { CharacterMongoRepository } from './character.mongo.repository';
import { Character } from '../../domain/entities/character.entity';
import { CharacterDocument } from './character.schema';

const T0 = new Date('2026-01-01T00:00:00.000Z');

function characterDocument(overrides: Partial<CharacterDocument> = {}): CharacterDocument {
  return {
    characterId: 'char-1',
    accountId: 'acc-1',
    name: 'Ana',
    happiness: 100,
    energy: 100,
    money: 0,
    fame: 0,
    activity: 'idle',
    activityEndsAt: null,
    lastUpdatedAt: T0,
    ...overrides,
  } as CharacterDocument;
}

function character(overrides: Partial<Parameters<typeof Character.create>[0]> = {}): Character {
  return Character.create({ name: 'Ana', accountId: 'acc-1', ...overrides }, 'char-1', T0);
}

function queryMock(result: unknown) {
  const query: { sort: jest.Mock; skip: jest.Mock; limit: jest.Mock; exec: jest.Mock } = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    exec: jest.fn().mockResolvedValue(result),
  };
  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  return query;
}

describe('CharacterMongoRepository', () => {
  function buildRepository() {
    const model = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Model<CharacterDocument>>;

    const repository = new CharacterMongoRepository(model);
    return { repository, model };
  }

  it('save() upserts the character fields and returns the same instance', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(characterDocument()));

    const input = character();
    const result = await repository.save(input);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { characterId: 'char-1' },
      expect.objectContaining({ characterId: 'char-1', accountId: 'acc-1', name: 'Ana' }),
      { upsert: true, returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('trySave() updates only when lastUpdatedAt matches, and returns the character', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(characterDocument()));

    const input = character();
    const result = await repository.trySave(input, T0);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { characterId: 'char-1', lastUpdatedAt: T0 },
      { $set: expect.objectContaining({ accountId: 'acc-1' }) },
      { returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('trySave() returns null when no document matched (lost the race)', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.trySave(character(), T0);

    expect(result).toBeNull();
  });

  it('findById() maps the document to a domain Character', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(characterDocument({ name: 'Bia' })));

    const result = await repository.findById('char-1');

    expect(model.findOne).toHaveBeenCalledWith({ characterId: 'char-1' });
    expect(result).toBeInstanceOf(Character);
    expect(result?.name).toBe('Bia');
  });

  it('findById() returns null when no document is found', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.findById('missing');

    expect(result).toBeNull();
  });

  it('findByAccountId() maps every document belonging to the account', async () => {
    const { repository, model } = buildRepository();
    (model.find as jest.Mock).mockReturnValue(
      queryMock([characterDocument({ characterId: 'char-1' }), characterDocument({ characterId: 'char-2' })]),
    );

    const result = await repository.findByAccountId('acc-1');

    expect(model.find).toHaveBeenCalledWith({ accountId: 'acc-1' });
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Character);
  });

  it('findStaleBatch() sorts, paginates, and maps the resulting documents', async () => {
    const { repository, model } = buildRepository();
    const query = queryMock([characterDocument()]);
    (model.find as jest.Mock).mockReturnValue(query);

    const olderThan = new Date(T0.getTime() + 60_000);
    const result = await repository.findStaleBatch(olderThan, 10, 20);

    expect(model.find).toHaveBeenCalledWith({ lastUpdatedAt: { $lt: olderThan } });
    expect(query.sort).toHaveBeenCalledWith({ lastUpdatedAt: 1 });
    expect(query.skip).toHaveBeenCalledWith(20);
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(1);
  });
});
