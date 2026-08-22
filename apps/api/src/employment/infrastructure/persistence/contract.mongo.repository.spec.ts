import { Model } from 'mongoose';
import { ContractMongoRepository } from './contract.mongo.repository';
import { Contract, ContractProps } from '../../domain/entities/contract.entity';
import { ContractDocument } from './contract.schema';

const T0 = new Date('2026-01-01T00:00:00.000Z');

function contractDocument(overrides: Partial<ContractDocument> = {}): ContractDocument {
  return {
    contractId: 'contract-1',
    characterId: 'char-1',
    workplaceId: 'workplace-1',
    buildingTypeId: 'city-hall',
    cargoId: 'intern',
    hourlyWage: 5,
    hoursWorked: 0,
    progressScore: 0,
    lastUpdatedAt: T0,
    ...overrides,
  } as ContractDocument;
}

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

describe('ContractMongoRepository', () => {
  function buildRepository() {
    const model = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Model<ContractDocument>>;

    const repository = new ContractMongoRepository(model);
    return { repository, model };
  }

  it('save() upserts by characterId (not contractId) and returns the same instance', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(contractDocument()));

    const input = contract();
    const result = await repository.save(input);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { characterId: 'char-1' },
      expect.objectContaining({ characterId: 'char-1', contractId: 'contract-1' }),
      { upsert: true, returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('trySave() updates only when lastUpdatedAt matches (by contractId), and returns the contract', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(contractDocument()));

    const input = contract();
    const result = await repository.trySave(input, T0);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { contractId: 'contract-1', lastUpdatedAt: T0 },
      { $set: expect.objectContaining({ hoursWorked: 0 }) },
      { returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('trySave() returns null when no document matched (lost the race)', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.trySave(contract(), T0);

    expect(result).toBeNull();
  });

  it('findById() maps the document to a domain Contract', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(contractDocument({ cargoId: 'assistant' })));

    const result = await repository.findById('contract-1');

    expect(model.findOne).toHaveBeenCalledWith({ contractId: 'contract-1' });
    expect(result).toBeInstanceOf(Contract);
    expect(result?.cargoId).toBe('assistant');
  });

  it('findById() returns null when no document is found', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.findById('missing');

    expect(result).toBeNull();
  });

  it('findByCharacterId() maps the document to a domain Contract', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(contractDocument()));

    const result = await repository.findByCharacterId('char-1');

    expect(model.findOne).toHaveBeenCalledWith({ characterId: 'char-1' });
    expect(result).toBeInstanceOf(Contract);
  });

  it('findByCharacterId() returns null when the character has no contract', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.findByCharacterId('char-without-job');

    expect(result).toBeNull();
  });

  it('findStaleBatch() sorts, paginates, and maps the resulting documents', async () => {
    const { repository, model } = buildRepository();
    const query = queryMock([contractDocument()]);
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
