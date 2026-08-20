import { CityController } from './city.controller';
import { GetCityUseCase } from '../application/use-cases/get-city.use-case';
import { GetCharacterLotUseCase } from '../application/use-cases/get-character-lot.use-case';

describe('CityController', () => {
  function buildController() {
    const getCityUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetCityUseCase>;
    const getCharacterLotUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetCharacterLotUseCase>;

    const controller = new CityController(getCityUseCase, getCharacterLotUseCase);

    return { controller, getCityUseCase, getCharacterLotUseCase };
  }

  it('getCity() delegates to GetCityUseCase', () => {
    const { controller, getCityUseCase } = buildController();
    getCityUseCase.execute.mockResolvedValue('city' as never);

    const result = controller.getCity();

    expect(getCityUseCase.execute).toHaveBeenCalledWith();
    expect(result).resolves.toBe('city');
  });

  it('getCharacterLot() delegates to GetCharacterLotUseCase with the characterId param', () => {
    const { controller, getCharacterLotUseCase } = buildController();
    getCharacterLotUseCase.execute.mockResolvedValue('lot' as never);

    const result = controller.getCharacterLot('char-1');

    expect(getCharacterLotUseCase.execute).toHaveBeenCalledWith('char-1');
    expect(result).resolves.toBe('lot');
  });
});
