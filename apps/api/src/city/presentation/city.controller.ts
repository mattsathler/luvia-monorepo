import { Controller, Get, Param } from '@nestjs/common';
import { GetCharacterLotUseCase } from '../application/use-cases/get-character-lot.use-case';
import { GetCityUseCase } from '../application/use-cases/get-city.use-case';

@Controller('city')
export class CityController {
  constructor(
    private readonly getCityUseCase: GetCityUseCase,
    private readonly getCharacterLotUseCase: GetCharacterLotUseCase,
  ) {}

  @Get()
  getCity() {
    return this.getCityUseCase.execute();
  }

  @Get('lots/:characterId')
  getCharacterLot(@Param('characterId') characterId: string) {
    return this.getCharacterLotUseCase.execute(characterId);
  }
}
