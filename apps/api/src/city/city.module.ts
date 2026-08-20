import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharacterModule } from '../character/character.module';
import { GetCharacterLotUseCase } from './application/use-cases/get-character-lot.use-case';
import { GetCityChunkUseCase } from './application/use-cases/get-city-chunk.use-case';
import { GetCityUseCase } from './application/use-cases/get-city.use-case';
import { GetCurrentLotUseCase } from './application/use-cases/get-current-lot.use-case';
import { GetOrGenerateCityMapUseCase } from './application/use-cases/get-or-generate-city-map.use-case';
import { CITY_MAP_REPOSITORY } from './domain/repositories/city-map.repository';
import { LOT_REPOSITORY } from './domain/repositories/lot.repository';
import { CityMapMongoRepository } from './infrastructure/persistence/city-map.mongo.repository';
import { CityMapModel, CityMapSchema } from './infrastructure/persistence/city-map.schema';
import { LotMongoRepository } from './infrastructure/persistence/lot.mongo.repository';
import { LotModel, LotSchema } from './infrastructure/persistence/lot.schema';
import { CityController } from './presentation/city.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LotModel.name, schema: LotSchema },
      { name: CityMapModel.name, schema: CityMapSchema },
    ]),
    CharacterModule,
  ],
  controllers: [CityController],
  providers: [
    GetCityUseCase,
    GetCityChunkUseCase,
    GetCharacterLotUseCase,
    GetCurrentLotUseCase,
    GetOrGenerateCityMapUseCase,
    { provide: LOT_REPOSITORY, useClass: LotMongoRepository },
    { provide: CITY_MAP_REPOSITORY, useClass: CityMapMongoRepository },
  ],
})
export class CityModule {}
