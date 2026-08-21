import { WEATHER_TYPES, currentWeather } from './weather.entity';

const TEMPERATURE_RANGES: Record<string, [number, number]> = {
  sunny: [22, 30],
  rainy: [14, 20],
  foggy: [10, 16],
};

describe('currentWeather', () => {
  it('is deterministic: the same day always produces the same weather and temperature', () => {
    expect(currentWeather(42)).toEqual(currentWeather(42));
  });

  it('always returns one of the known weather types', () => {
    for (let day = 1; day <= 200; day++) {
      expect(WEATHER_TYPES).toContain(currentWeather(day).type);
    }
  });

  it('always returns a temperature within that weather type\'s range', () => {
    for (let day = 1; day <= 200; day++) {
      const { type, temperature } = currentWeather(day);
      const [min, max] = TEMPERATURE_RANGES[type];

      expect(temperature).toBeGreaterThanOrEqual(min);
      expect(temperature).toBeLessThanOrEqual(max);
    }
  });

  it('returns an integer temperature', () => {
    expect(Number.isInteger(currentWeather(1).temperature)).toBe(true);
  });

  it('is not the same weather every day', () => {
    const types = new Set(Array.from({ length: 50 }, (_, i) => currentWeather(i + 1).type));

    expect(types.size).toBeGreaterThan(1);
  });

  it('favors rain over the other two weather types, since Luvia is a rainy city', () => {
    const sampleSize = 2000;
    const counts = { sunny: 0, rainy: 0, foggy: 0 };

    for (let day = 1; day <= sampleSize; day++) {
      counts[currentWeather(day).type]++;
    }

    expect(counts.rainy).toBeGreaterThan(counts.sunny);
    expect(counts.rainy).toBeGreaterThan(counts.foggy);
    expect(counts.rainy / sampleSize).toBeGreaterThan(0.4);
  });
});
