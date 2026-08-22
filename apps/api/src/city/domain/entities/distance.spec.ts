import { chebyshevDistance } from './distance';

describe('chebyshevDistance', () => {
  it('is the max of the absolute differences on each axis', () => {
    expect(chebyshevDistance({ x: 0, y: 0 }, { x: 3, y: 7 })).toBe(7);
    expect(chebyshevDistance({ x: 0, y: 0 }, { x: 7, y: 3 })).toBe(7);
  });

  it('is 0 for the same position', () => {
    expect(chebyshevDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });
});
