import { CHUNK_SIZE, lotsInChunk, tilesInChunk } from './chunk';
import { Lot } from './lot.entity';
import { TerrainTile } from './terrain-tile';

describe('tilesInChunk', () => {
  const tiles: TerrainTile[] = [
    { x: 0, y: 0, type: 'grass' },
    { x: CHUNK_SIZE - 1, y: CHUNK_SIZE - 1, type: 'grass' },
    { x: CHUNK_SIZE, y: 0, type: 'grass' }, // já é o chunk (1,0)
    { x: 0, y: CHUNK_SIZE, type: 'grass' }, // já é o chunk (0,1)
  ];

  it('keeps only tiles inside the requested chunk, including its edges', () => {
    expect(tilesInChunk(tiles, 0, 0)).toEqual([tiles[0], tiles[1]]);
  });

  it('resolves the neighboring chunk on the x axis', () => {
    expect(tilesInChunk(tiles, 1, 0)).toEqual([tiles[2]]);
  });

  it('resolves the neighboring chunk on the y axis', () => {
    expect(tilesInChunk(tiles, 0, 1)).toEqual([tiles[3]]);
  });

  it('returns an empty array for a chunk coordinate with nothing in it', () => {
    expect(tilesInChunk(tiles, 5, 5)).toEqual([]);
  });
});

describe('lotsInChunk', () => {
  const lots: Lot[] = [
    Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1'),
    Lot.create({ characterId: 'char-2', type: 'residential', x: CHUNK_SIZE, y: 0 }, 'lot-2'),
  ];

  it('keeps only lots inside the requested chunk', () => {
    expect(lotsInChunk(lots, 0, 0)).toEqual([lots[0]]);
  });

  it('resolves the neighboring chunk', () => {
    expect(lotsInChunk(lots, 1, 0)).toEqual([lots[1]]);
  });

  it('returns an empty array when no lot falls in the requested chunk', () => {
    expect(lotsInChunk(lots, 9, 9)).toEqual([]);
  });
});
