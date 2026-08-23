const deleteMany = jest.fn();
const updateOne = jest.fn();
const collection = jest.fn(() => ({ deleteMany, updateOne }));
const connect = jest.fn();
const disconnect = jest.fn();

jest.mock('mongoose', () => ({
  __esModule: true,
  default: {
    connect,
    disconnect,
    get connection() {
      return { db: mockDb };
    },
  },
}));

let mockDb: { collection: typeof collection } | undefined;

describe('reset-city.script', () => {
  const originalUri = process.env.MONGODB_URI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = { collection };
    deleteMany.mockResolvedValue({ deletedCount: 3 });
    updateOne.mockResolvedValue({});
    process.env.MONGODB_URI = 'mongodb://example/test';
  });

  afterEach(() => {
    process.env.MONGODB_URI = originalUri;
  });

  it('throws when MONGODB_URI is not set', async () => {
    delete process.env.MONGODB_URI;
    const { run } = await import('./reset-city.script');

    await expect(run()).rejects.toThrow('MONGODB_URI não definida.');
    expect(connect).not.toHaveBeenCalled();
  });

  it('throws when the connection does not yield a database', async () => {
    mockDb = undefined;
    const { run } = await import('./reset-city.script');

    await expect(run()).rejects.toThrow('Conexão com o Mongo não retornou um banco.');
    expect(disconnect).toHaveBeenCalled();
  });

  it('deletes every lot and upserts a freshly generated city map, then disconnects', async () => {
    const { run } = await import('./reset-city.script');
    const { CITY_HEIGHT, CITY_SEED, CITY_WIDTH } = await import('../domain/entities/city-map.entity');

    await run();

    expect(connect).toHaveBeenCalledWith('mongodb://example/test');
    expect(collection).toHaveBeenCalledWith('lots');
    expect(deleteMany).toHaveBeenCalledWith({});
    expect(collection).toHaveBeenCalledWith('city_maps');

    const [filter, update, options] = updateOne.mock.calls[0];
    expect(filter).toEqual({ key: 'default' });
    expect(update.$set).toMatchObject({ key: 'default', width: CITY_WIDTH, height: CITY_HEIGHT, seed: CITY_SEED });
    expect(update.$set.tiles.length).toBe(CITY_WIDTH * CITY_HEIGHT);
    expect(options).toEqual({ upsert: true });

    expect(disconnect).toHaveBeenCalled();
  });

  it('still disconnects if the database operations throw', async () => {
    deleteMany.mockRejectedValue(new Error('boom'));
    const { run } = await import('./reset-city.script');

    await expect(run()).rejects.toThrow('boom');
    expect(disconnect).toHaveBeenCalled();
  });
});
