import { findBuilding, findCargo, nextCargo } from './building-catalog';

describe('findBuilding', () => {
  it('finds a building by id', () => {
    expect(findBuilding('city-hall')?.label).toBe('Prefeitura');
  });

  it('returns undefined for an unknown building', () => {
    expect(findBuilding('does-not-exist')).toBeUndefined();
  });
});

describe('findCargo', () => {
  it('finds a cargo by building + cargo id', () => {
    expect(findCargo('city-hall', 'intern')?.label).toBe('Estagiário');
  });

  it('returns undefined for an unknown building', () => {
    expect(findCargo('does-not-exist', 'intern')).toBeUndefined();
  });

  it('returns undefined for an unknown cargo within a known building', () => {
    expect(findCargo('city-hall', 'does-not-exist')).toBeUndefined();
  });
});

describe('nextCargo', () => {
  it('returns the next cargo in the hierarchy', () => {
    expect(nextCargo('city-hall', 'intern')?.id).toBe('assistant');
    expect(nextCargo('city-hall', 'assistant')?.id).toBe('coordinator');
  });

  it('returns undefined for the last cargo in the hierarchy', () => {
    expect(nextCargo('city-hall', 'coordinator')).toBeUndefined();
  });

  it('returns undefined for an unknown building', () => {
    expect(nextCargo('does-not-exist', 'intern')).toBeUndefined();
  });

  it('returns undefined for an unknown cargo within a known building', () => {
    expect(nextCargo('city-hall', 'does-not-exist')).toBeUndefined();
  });
});
