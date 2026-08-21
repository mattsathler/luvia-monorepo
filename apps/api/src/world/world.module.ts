import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetOrGenerateWorldClockUseCase } from './application/use-cases/get-or-generate-world-clock.use-case';
import { GetWorldClockUseCase } from './application/use-cases/get-world-clock.use-case';
import { WORLD_CLOCK_REPOSITORY } from './domain/repositories/world-clock.repository';
import { WorldClockMongoRepository } from './infrastructure/persistence/world-clock.mongo.repository';
import { WorldClockModel, WorldClockSchema } from './infrastructure/persistence/world-clock.schema';
import { WorldController } from './presentation/world.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: WorldClockModel.name, schema: WorldClockSchema }])],
  controllers: [WorldController],
  providers: [
    GetWorldClockUseCase,
    GetOrGenerateWorldClockUseCase,
    { provide: WORLD_CLOCK_REPOSITORY, useClass: WorldClockMongoRepository },
  ],
})
export class WorldModule {}
