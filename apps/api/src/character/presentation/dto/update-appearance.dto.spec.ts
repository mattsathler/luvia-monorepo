import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateAppearanceDto } from './update-appearance.dto';

describe('UpdateAppearanceDto', () => {
  it('accepts an empty patch', async () => {
    const dto = plainToInstance(UpdateAppearanceDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts a partial patch with a known skin tone', async () => {
    const dto = plainToInstance(UpdateAppearanceDto, { skinTone: 5, top: 'blusa-listrada' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts accessory set to null (unequip)', async () => {
    const dto = plainToInstance(UpdateAppearanceDto, { accessory: null });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an out-of-range skin tone', async () => {
    const dto = plainToInstance(UpdateAppearanceDto, { skinTone: 7 });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'skinTone')).toBe(true);
  });
});
