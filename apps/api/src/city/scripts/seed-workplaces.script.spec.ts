jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('seed-workplaces.script', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('buildWorkplaceDocuments() gives each seed a unique id and keeps the rest of its fields', async () => {
    const { buildWorkplaceDocuments } = await import('./seed-workplaces.script');

    const documents = buildWorkplaceDocuments([
      { buildingTypeId: 'city-hall', x: 20, y: 20 },
      { buildingTypeId: 'hospital', x: 25, y: 25 },
    ]);

    expect(documents).toHaveLength(2);
    expect(documents[0]).toMatchObject({ buildingTypeId: 'city-hall', x: 20, y: 20 });
    expect(documents[1]).toMatchObject({ buildingTypeId: 'hospital', x: 25, y: 25 });
    expect(documents[0].workplaceId).not.toBe(documents[1].workplaceId);
  });

  it('run() writes the example workplaces as JSON to OUTPUT_PATH', async () => {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const { run, OUTPUT_PATH } = await import('./seed-workplaces.script');

    run();

    expect(mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(OUTPUT_PATH, expect.stringContaining('"buildingTypeId": "city-hall"'), 'utf-8');
  });
});
