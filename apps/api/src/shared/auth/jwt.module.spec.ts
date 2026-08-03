import { ConfigService } from '@nestjs/config';
import { SharedJwtModule, jwtConfigFactory } from './jwt.module';

describe('SharedJwtModule', () => {
  it('is defined', () => {
    expect(SharedJwtModule).toBeDefined();
  });
});

describe('jwtConfigFactory', () => {
  it('uses JWT_EXPIRES_IN when set', () => {
    const config = {
      getOrThrow: jest.fn(() => 'super-secret'),
      get: jest.fn(() => '1h'),
    } as unknown as ConfigService;

    expect(jwtConfigFactory(config)).toEqual({ secret: 'super-secret', signOptions: { expiresIn: '1h' } });
  });

  it('falls back to 15m when JWT_EXPIRES_IN is not set', () => {
    const config = {
      getOrThrow: jest.fn(() => 'super-secret'),
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;

    expect(jwtConfigFactory(config)).toEqual({ secret: 'super-secret', signOptions: { expiresIn: '15m' } });
  });
});
