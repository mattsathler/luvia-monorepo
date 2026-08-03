import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('accepts a valid email and password', async () => {
    const dto = plainToInstance(RegisterDto, { email: 'ana@example.com', password: 'correct-horse' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(RegisterDto, { email: 'not-an-email', password: 'correct-horse' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const dto = plainToInstance(RegisterDto, { email: 'ana@example.com', password: 'short' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
