import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ChangeActivityDto } from './change-activity.dto';

describe('ChangeActivityDto', () => {
  it('accepts a known activity without activityEndsAt', async () => {
    const dto = plainToInstance(ChangeActivityDto, { activity: 'resting' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts a known activity with a valid ISO date for activityEndsAt', async () => {
    const dto = plainToInstance(ChangeActivityDto, {
      activity: 'working',
      activityEndsAt: '2026-01-01T00:00:00.000Z',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an unknown activity', async () => {
    const dto = plainToInstance(ChangeActivityDto, { activity: 'sleeping' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'activity')).toBe(true);
  });

  it('rejects an invalid activityEndsAt', async () => {
    const dto = plainToInstance(ChangeActivityDto, { activity: 'working', activityEndsAt: 'not-a-date' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'activityEndsAt')).toBe(true);
  });
});
