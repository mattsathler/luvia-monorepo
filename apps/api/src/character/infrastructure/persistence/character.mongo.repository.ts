import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character } from '../../domain/entities/character.entity';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { CharacterModel, CharacterDocument } from './character.schema';

@Injectable()
export class CharacterMongoRepository implements CharacterRepository {
  constructor(
    @InjectModel(CharacterModel.name)
    private readonly model: Model<CharacterDocument>,
  ) {}

  async save(character: Character): Promise<Character> {
    await this.model.findOneAndUpdate(
      { characterId: character.id },
      {
        characterId: character.id,
        name: character.name,
        happiness: character.happiness,
        energy: character.energy,
        money: character.money,
        fame: character.fame,
      },
      { upsert: true, new: true },
    );

    return character;
  }

  async findById(id: string): Promise<Character | null> {
    const document = await this.model.findOne({ characterId: id }).exec();

    if (!document) {
      return null;
    }

    return new Character({
      id: document.characterId,
      name: document.name,
      happiness: document.happiness,
      energy: document.energy,
      money: document.money,
      fame: document.fame,
    });
  }
}
