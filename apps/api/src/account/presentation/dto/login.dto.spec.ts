import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('accepts a valid email and non-empty password', async () => {
    const dto = plainToInstance(LoginDto, { email: 'ana@example.com', password: 'anything' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(LoginDto, { email: 'not-an-email', password: 'anything' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects an empty password', async () => {
    const dto = plainToInstance(LoginDto, { email: 'ana@example.com', password: '' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
