import { isBuildableTerrain } from './terrain-tile';

describe('isBuildableTerrain', () => {
  it('is true only for grass', () => {
    expect(isBuildableTerrain('grass')).toBe(true);
  });

  it.each(['ocean', 'road-r', 'road-l', 'road-i', 'road-corner-dr', 'road-corner-dl', 'road-corner-lu', 'road-corner-ru', 'landmark'] as const)(
    'is false for %s',
    (type) => {
      expect(isBuildableTerrain(type)).toBe(false);
    },
  );
});
