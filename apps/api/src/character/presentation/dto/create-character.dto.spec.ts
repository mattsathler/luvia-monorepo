import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCharacterDto } from './create-character.dto';

function validPayload(overrides: Partial<CreateCharacterDto> = {}) {
  return {
    firstName: 'Ana',
    lastName: 'Silva',
    gender: 'female',
    skinTone: 3,
    hairType: 'curly-1',
    eyeType: 'round-1',
    skills: { intelligence: 2, charisma: 2 },
    ...overrides,
  };
}

describe('CreateCharacterDto', () => {
  it('accepts a complete, valid payload', async () => {
    const dto = plainToInstance(CreateCharacterDto, validPayload());
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty firstName', async () => {
    const dto = plainToInstance(CreateCharacterDto, validPayload({ firstName: '' }));
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'firstName')).toBe(true);
  });

  it('rejects an empty lastName', async () => {
    const dto = plainToInstance(CreateCharacterDto, validPayload({ lastName: '' }));
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'lastName')).toBe(true);
  });

  it('rejects an unknown gender', async () => {
    const dto = plainToInstance(CreateCharacterDto, validPayload({ gender: 'robot' as never }));
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'gender')).toBe(true);
  });

  it('rejects an out-of-range skin tone', async () => {
    const dto = plainToInstance(CreateCharacterDto, validPayload({ skinTone: 9 as never }));
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'skinTone')).toBe(true);
  });

  it('rejects an empty hairType', async () => {
    const dto = plainToInstance(CreateCharacterDto, validPayload({ hairType: '' }));
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'hairType')).toBe(true);
  });

  it('rejects an empty eyeType', async () => {
    const dto = plainToInstance(CreateCharacterDto, validPayload({ eyeType: '' }));
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'eyeType')).toBe(true);
  });

  it('rejects a non-object skills value', async () => {
    const dto = plainToInstance(CreateCharacterDto, validPayload({ skills: 'not-an-object' as never }));
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'skills')).toBe(true);
  });
});
