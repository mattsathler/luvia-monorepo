import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCharacterDto } from './create-character.dto';

describe('CreateCharacterDto', () => {
  it('accepts a non-empty name', async () => {
    const dto = plainToInstance(CreateCharacterDto, { name: 'Ana' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty name', async () => {
    const dto = plainToInstance(CreateCharacterDto, { name: '' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });
});
