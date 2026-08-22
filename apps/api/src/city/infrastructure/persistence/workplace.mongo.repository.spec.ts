import { Model } from 'mongoose';
import { WorkplaceMongoRepository } from './workplace.mongo.repository';
import { Workplace } from '../../domain/entities/workplace.entity';
import { WorkplaceDocument } from './workplace.schema';

function workplaceDocument(overrides: Partial<WorkplaceDocument> = {}): WorkplaceDocument {
  return {
    workplaceId: 'workplace-1',
    buildingTypeId: 'city-hall',
    x: 2,
    y: 3,
    ...overrides,
  } as WorkplaceDocument;
}

function workplace(overrides: Partial<Parameters<typeof Workplace.create>[0]> = {}): Workplace {
  return Workplace.create({ buildingTypeId: 'city-hall', x: 2, y: 3, ...overrides }, 'workplace-1');
}

function queryMock(result: unknown) {
  return { exec: jest.fn().mockResolvedValue(result) };
}

describe('WorkplaceMongoRepository', () => {
  function buildRepository() {
    const model = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Model<WorkplaceDocument>>;

    const repository = new WorkplaceMongoRepository(model);
    return { repository, model };
  }

  it('save() upserts the workplace fields and returns the same instance', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(workplaceDocument()));

    const input = workplace();
    const result = await repository.save(input);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { workplaceId: 'workplace-1' },
      { workplaceId: 'workplace-1', buildingTypeId: 'city-hall', x: 2, y: 3 },
      { upsert: true, returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('findAll() maps every document in the city', async () => {
    const { repository, model } = buildRepository();
    (model.find as jest.Mock).mockReturnValue(
      queryMock([
        workplaceDocument({ workplaceId: 'workplace-1' }),
        workplaceDocument({ workplaceId: 'workplace-2', buildingTypeId: 'hospital' }),
      ]),
    );

    const result = await repository.findAll();

    expect(model.find).toHaveBeenCalledWith({});
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Workplace);
  });

  it('findById() maps the document to a domain Workplace', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(workplaceDocument({ x: 9, y: 9 })));

    const result = await repository.findById('workplace-1');

    expect(model.findOne).toHaveBeenCalledWith({ workplaceId: 'workplace-1' });
    expect(result).toBeInstanceOf(Workplace);
    expect(result?.x).toBe(9);
  });

  it('findById() returns null when no document is found', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.findById('missing');

    expect(result).toBeNull();
  });
});
