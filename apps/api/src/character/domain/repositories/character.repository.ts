import { Character } from '../entities/character.entity';

export const CHARACTER_REPOSITORY = Symbol('CHARACTER_REPOSITORY');

export interface CharacterRepository {
  save(character: Character): Promise<Character>;
  findById(id: string): Promise<Character | null>;
}
