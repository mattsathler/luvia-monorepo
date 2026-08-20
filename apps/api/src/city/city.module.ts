import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetCharacterLotUseCase } from './application/use-cases/get-character-lot.use-case';
import { GetCityUseCase } from './application/use-cases/get-city.use-case';
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
  ],
  controllers: [CityController],
  providers: [
    GetCityUseCase,
    GetCharacterLotUseCase,
    GetOrGenerateCityMapUseCase,
    { provide: LOT_REPOSITORY, useClass: LotMongoRepository },
    { provide: CITY_MAP_REPOSITORY, useClass: CityMapMongoRepository },
  ],
})
export class CityModule {}
