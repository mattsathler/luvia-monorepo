import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharacterController } from './presentation/character.controller';
import { CreateCharacterUseCase } from './application/use-cases/create-character.use-case';
import { GetCharacterUseCase } from './application/use-cases/get-character.use-case';
import { RecomputeCharacterUseCase } from './application/use-cases/recompute-character.use-case';
import { ListMyCharactersUseCase } from './application/use-cases/list-my-characters.use-case';
import { ChangeActivityUseCase } from './application/use-cases/change-activity.use-case';
import { CHARACTER_REPOSITORY } from './domain/repositories/character.repository';
import { CharacterMongoRepository } from './infrastructure/persistence/character.mongo.repository';
import { CharacterModel, CharacterSchema } from './infrastructure/persistence/character.schema';
import { CharacterTickScheduler } from './infrastructure/scheduling/character-tick.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CharacterModel.name, schema: CharacterSchema }]),
  ],
  controllers: [CharacterController],
  providers: [
    CreateCharacterUseCase,
    GetCharacterUseCase,
    RecomputeCharacterUseCase,
    ListMyCharactersUseCase,
    ChangeActivityUseCase,
    CharacterTickScheduler,
    { provide: CHARACTER_REPOSITORY, useClass: CharacterMongoRepository },
  ],
})
export class CharacterModule {}
