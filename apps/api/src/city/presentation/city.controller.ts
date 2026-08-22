import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { GetCharacterLotUseCase } from '../application/use-cases/get-character-lot.use-case';
import { GetCityChunkUseCase } from '../application/use-cases/get-city-chunk.use-case';
import { GetCityUseCase } from '../application/use-cases/get-city.use-case';
import { GetCurrentLotUseCase } from '../application/use-cases/get-current-lot.use-case';
import { SearchLotsUseCase } from '../application/use-cases/search-lots.use-case';

@Controller('city')
export class CityController {
  constructor(
    private readonly getCityUseCase: GetCityUseCase,
    private readonly getCityChunkUseCase: GetCityChunkUseCase,
    private readonly getCharacterLotUseCase: GetCharacterLotUseCase,
    private readonly getCurrentLotUseCase: GetCurrentLotUseCase,
    private readonly searchLotsUseCase: SearchLotsUseCase,
  ) {}

  @Get()
  getCity() {
    return this.getCityUseCase.execute();
  }

  // Precisa vir antes de `lots/:characterId` só por clareza — os prefixos
  // ("chunks" vs "lots") já não colidem, mas mantém a ordem espelhando a
  // convenção de rotas mais específicas primeiro usada em outros controllers.
  @Get('chunks/:x/:y')
  getCityChunk(@Param('x', ParseIntPipe) x: number, @Param('y', ParseIntPipe) y: number) {
    return this.getCityChunkUseCase.execute(x, y);
  }

  // Precisa vir antes de `lots/:characterId` — `GET /city/lots` (sem
  // segmento extra) não colidiria de qualquer forma com uma rota que exige
  // `:characterId`, mas mantém a mesma convenção de ordem do resto do arquivo.
  @Get('lots')
  searchLots(@Query('q') query?: string, @Query('characterId') characterId?: string) {
    return this.searchLotsUseCase.execute(query, characterId);
  }

  @Get('lots/:characterId')
  getCharacterLot(@Param('characterId') characterId: string) {
    return this.getCharacterLotUseCase.execute(characterId);
  }

  @Get('current-lot/:characterId')
  getCurrentLot(@Param('characterId') characterId: string) {
    return this.getCurrentLotUseCase.execute(characterId);
  }
}
