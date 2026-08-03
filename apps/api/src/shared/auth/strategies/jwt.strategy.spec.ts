import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('reads JWT_SECRET from the config to build the passport strategy', () => {
    const config = { getOrThrow: jest.fn(() => 'super-secret') } as unknown as ConfigService;

    const strategy = new JwtStrategy(config);

    expect(config.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  it('validate() maps the JWT payload sub claim to accountId', () => {
    const config = { getOrThrow: jest.fn(() => 'super-secret') } as unknown as ConfigService;
    const strategy = new JwtStrategy(config);

    expect(strategy.validate({ sub: 'acc-1' })).toEqual({ accountId: 'acc-1' });
  });
});
