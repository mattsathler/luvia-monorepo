import { Model } from 'mongoose';
import { CityMapMongoRepository } from './city-map.mongo.repository';
import { CityMap, CityMapProps } from '../../domain/entities/city-map.entity';
import { CityMapDocument } from './city-map.schema';

function cityMapDocument(overrides: Partial<CityMapDocument> = {}): CityMapDocument {
  return {
    key: 'default',
    width: 40,
    height: 40,
    seed: 'seed-1',
    tiles: [{ x: 0, y: 0, type: 'grass' }],
    ...overrides,
  } as CityMapDocument;
}

function cityMap(overrides: Partial<CityMapProps> = {}): CityMap {
  return new CityMap({
    width: 40,
    height: 40,
    seed: 'seed-1',
    tiles: [{ x: 0, y: 0, type: 'grass' }],
    ...overrides,
  });
}

function queryMock(result: unknown) {
  return { exec: jest.fn().mockResolvedValue(result) };
}

describe('CityMapMongoRepository', () => {
  function buildRepository() {
    const model = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Model<CityMapDocument>>;

    const repository = new CityMapMongoRepository(model);
    return { repository, model };
  }

  it('save() upserts the singleton document and returns the same instance', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(cityMapDocument()));

    const input = cityMap();
    const result = await repository.save(input);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { key: 'default' },
      { key: 'default', width: 40, height: 40, seed: 'seed-1', tiles: input.tiles },
      { upsert: true, returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('find() maps the document to a domain CityMap', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(cityMapDocument({ seed: 'seed-2' })));

    const result = await repository.find();

    expect(model.findOne).toHaveBeenCalledWith({ key: 'default' });
    expect(result).toBeInstanceOf(CityMap);
    expect(result?.seed).toBe('seed-2');
  });

  it('find() returns null when no document is found', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.find();

    expect(result).toBeNull();
  });
});
