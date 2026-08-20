import { Model } from 'mongoose';
import { LotMongoRepository } from './lot.mongo.repository';
import { Lot } from '../../domain/entities/lot.entity';
import { LotDocument } from './lot.schema';

function lotDocument(overrides: Partial<LotDocument> = {}): LotDocument {
  return {
    lotId: 'lot-1',
    characterId: 'char-1',
    type: 'residential',
    x: 2,
    y: 3,
    ...overrides,
  } as LotDocument;
}

function lot(overrides: Partial<Parameters<typeof Lot.create>[0]> = {}): Lot {
  return Lot.create({ characterId: 'char-1', type: 'residential', x: 2, y: 3, ...overrides }, 'lot-1');
}

function queryMock(result: unknown) {
  return { exec: jest.fn().mockResolvedValue(result) };
}

describe('LotMongoRepository', () => {
  function buildRepository() {
    const model = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Model<LotDocument>>;

    const repository = new LotMongoRepository(model);
    return { repository, model };
  }

  it('save() upserts the lot fields and returns the same instance', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(lotDocument()));

    const input = lot();
    const result = await repository.save(input);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { lotId: 'lot-1' },
      { lotId: 'lot-1', characterId: 'char-1', type: 'residential', x: 2, y: 3 },
      { upsert: true, returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('findAll() maps every document in the city', async () => {
    const { repository, model } = buildRepository();
    (model.find as jest.Mock).mockReturnValue(
      queryMock([lotDocument({ lotId: 'lot-1' }), lotDocument({ lotId: 'lot-2', characterId: 'char-2' })]),
    );

    const result = await repository.findAll();

    expect(model.find).toHaveBeenCalledWith({});
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Lot);
  });

  it('findByCharacterId() maps the document to a domain Lot', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(lotDocument({ x: 9, y: 9 })));

    const result = await repository.findByCharacterId('char-1');

    expect(model.findOne).toHaveBeenCalledWith({ characterId: 'char-1' });
    expect(result).toBeInstanceOf(Lot);
    expect(result?.x).toBe(9);
  });

  it('findByCharacterId() returns null when no document is found', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.findByCharacterId('missing');

    expect(result).toBeNull();
  });
});
