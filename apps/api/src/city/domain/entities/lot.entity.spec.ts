import { Lot } from './lot.entity';

describe('Lot.create', () => {
  it('builds a Lot with the given id and props', () => {
    const lot = Lot.create({ characterId: 'char-1', type: 'residential', x: 2, y: 3 }, 'lot-1');

    expect(lot.id).toBe('lot-1');
    expect(lot.characterId).toBe('char-1');
    expect(lot.type).toBe('residential');
    expect(lot.x).toBe(2);
    expect(lot.y).toBe(3);
  });
});
