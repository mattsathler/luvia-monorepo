import { CityController } from './city.controller';
import { GetCityUseCase } from '../application/use-cases/get-city.use-case';
import { GetCityChunkUseCase } from '../application/use-cases/get-city-chunk.use-case';
import { GetCharacterLotUseCase } from '../application/use-cases/get-character-lot.use-case';
import { GetCurrentLotUseCase } from '../application/use-cases/get-current-lot.use-case';

describe('CityController', () => {
  function buildController() {
    const getCityUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetCityUseCase>;
    const getCityChunkUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetCityChunkUseCase>;
    const getCharacterLotUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetCharacterLotUseCase>;
    const getCurrentLotUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetCurrentLotUseCase>;

    const controller = new CityController(getCityUseCase, getCityChunkUseCase, getCharacterLotUseCase, getCurrentLotUseCase);

    return { controller, getCityUseCase, getCityChunkUseCase, getCharacterLotUseCase, getCurrentLotUseCase };
  }

  it('getCity() delegates to GetCityUseCase', () => {
    const { controller, getCityUseCase } = buildController();
    getCityUseCase.execute.mockResolvedValue('city' as never);

    const result = controller.getCity();

    expect(getCityUseCase.execute).toHaveBeenCalledWith();
    expect(result).resolves.toBe('city');
  });

  it('getCityChunk() delegates to GetCityChunkUseCase with the parsed chunk coordinates', () => {
    const { controller, getCityChunkUseCase } = buildController();
    getCityChunkUseCase.execute.mockResolvedValue('chunk' as never);

    const result = controller.getCityChunk(1, 2);

    expect(getCityChunkUseCase.execute).toHaveBeenCalledWith(1, 2);
    expect(result).resolves.toBe('chunk');
  });

  it('getCharacterLot() delegates to GetCharacterLotUseCase with the characterId param', () => {
    const { controller, getCharacterLotUseCase } = buildController();
    getCharacterLotUseCase.execute.mockResolvedValue('lot' as never);

    const result = controller.getCharacterLot('char-1');

    expect(getCharacterLotUseCase.execute).toHaveBeenCalledWith('char-1');
    expect(result).resolves.toBe('lot');
  });

  it('getCurrentLot() delegates to GetCurrentLotUseCase with the characterId param', () => {
    const { controller, getCurrentLotUseCase } = buildController();
    getCurrentLotUseCase.execute.mockResolvedValue('current-lot' as never);

    const result = controller.getCurrentLot('char-1');

    expect(getCurrentLotUseCase.execute).toHaveBeenCalledWith('char-1');
    expect(result).resolves.toBe('current-lot');
  });
});
