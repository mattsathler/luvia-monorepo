jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('generate-city-map.script', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('buildCityMapDocument() shapes a CityMap into the Mongo document format', async () => {
    const { buildCityMapDocument } = await import('./generate-city-map.script');
    const { CityMap } = await import('../domain/entities/city-map.entity');

    const cityMap = new CityMap({ width: 2, height: 1, seed: 'seed-1', tiles: [{ x: 0, y: 0, type: 'grass' }] });

    expect(buildCityMapDocument(cityMap)).toEqual({
      key: 'default',
      width: 2,
      height: 1,
      seed: 'seed-1',
      tiles: cityMap.tiles,
    });
  });

  it('run() generates the city and writes the document as JSON to OUTPUT_PATH', async () => {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const { run, OUTPUT_PATH } = await import('./generate-city-map.script');

    run();

    expect(mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(OUTPUT_PATH, expect.stringContaining('"key": "default"'), 'utf-8');
  });
});
