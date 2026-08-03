import { ConfigService } from '@nestjs/config';
import { DatabaseModule, mongooseConfigFactory } from './database.module';

describe('DatabaseModule', () => {
  it('is defined', () => {
    expect(DatabaseModule).toBeDefined();
  });
});

describe('mongooseConfigFactory', () => {
  it('builds Mongoose options from MONGODB_URI', () => {
    const config = { getOrThrow: jest.fn(() => 'mongodb://localhost:27017/luvia') } as unknown as ConfigService;

    expect(mongooseConfigFactory(config)).toEqual({ uri: 'mongodb://localhost:27017/luvia' });
    expect(config.getOrThrow).toHaveBeenCalledWith('MONGODB_URI');
  });
});
