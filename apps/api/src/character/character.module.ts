import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharacterController } from './presentation/character.controller';
import { CreateCharacterUseCase } from './application/use-cases/create-character.use-case';
import { GetCharacterUseCase } from './application/use-cases/get-character.use-case';
import { CHARACTER_REPOSITORY } from './domain/repositories/character.repository';
import { CharacterMongoRepository } from './infrastructure/persistence/character.mongo.repository';
import { CharacterModel, CharacterSchema } from './infrastructure/persistence/character.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CharacterModel.name, schema: CharacterSchema }]),
  ],
  controllers: [CharacterController],
  providers: [
    CreateCharacterUseCase,
    GetCharacterUseCase,
    { provide: CHARACTER_REPOSITORY, useClass: CharacterMongoRepository },
  ],
})
export class CharacterModule {}
