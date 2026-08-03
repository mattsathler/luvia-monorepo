import { Model } from 'mongoose';
import { AccountMongoRepository } from './account.mongo.repository';
import { Account } from '../../domain/entities/account.entity';
import { AccountDocument } from './account.schema';

const T0 = new Date('2026-01-01T00:00:00.000Z');

function accountDocument(overrides: Partial<AccountDocument> = {}): AccountDocument {
  return {
    accountId: 'acc-1',
    email: 'ana@example.com',
    passwordHash: 'hashed',
    createdAt: T0,
    ...overrides,
  } as AccountDocument;
}

function queryMock(result: unknown) {
  return { exec: jest.fn().mockResolvedValue(result) };
}

describe('AccountMongoRepository', () => {
  function buildRepository() {
    const model = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Model<AccountDocument>>;

    const repository = new AccountMongoRepository(model);
    return { repository, model };
  }

  it('save() upserts the account fields and returns the same instance', async () => {
    const { repository, model } = buildRepository();
    (model.findOneAndUpdate as jest.Mock).mockReturnValue(queryMock(accountDocument()));

    const input = Account.create({ email: 'ana@example.com', passwordHash: 'hashed' }, 'acc-1', T0);
    const result = await repository.save(input);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { accountId: 'acc-1' },
      { accountId: 'acc-1', email: 'ana@example.com', passwordHash: 'hashed', createdAt: T0 },
      { upsert: true, returnDocument: 'after' },
    );
    expect(result).toBe(input);
  });

  it('findById() maps the document to a domain Account', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(accountDocument()));

    const result = await repository.findById('acc-1');

    expect(model.findOne).toHaveBeenCalledWith({ accountId: 'acc-1' });
    expect(result).toBeInstanceOf(Account);
    expect(result?.email).toBe('ana@example.com');
  });

  it('findById() returns null when no document is found', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.findById('missing');

    expect(result).toBeNull();
  });

  it('findByEmail() maps the document to a domain Account', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(accountDocument()));

    const result = await repository.findByEmail('ana@example.com');

    expect(model.findOne).toHaveBeenCalledWith({ email: 'ana@example.com' });
    expect(result?.id).toBe('acc-1');
  });

  it('findByEmail() returns null when no document is found', async () => {
    const { repository, model } = buildRepository();
    (model.findOne as jest.Mock).mockReturnValue(queryMock(null));

    const result = await repository.findByEmail('missing@example.com');

    expect(result).toBeNull();
  });
});
