import { Workplace } from './workplace.entity';

describe('Workplace.create', () => {
  it('builds a Workplace with the given id and props', () => {
    const workplace = Workplace.create({ buildingTypeId: 'city-hall', x: 4, y: 5 }, 'workplace-1');

    expect(workplace.id).toBe('workplace-1');
    expect(workplace.buildingTypeId).toBe('city-hall');
    expect(workplace.x).toBe(4);
    expect(workplace.y).toBe(5);
  });
});
