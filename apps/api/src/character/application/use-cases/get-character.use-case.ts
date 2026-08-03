import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Character } from '../../domain/entities/character.entity';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';

@Injectable()
export class GetCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(id: string): Promise<Character> {
    const character = await this.characterRepository.findById(id);

    if (!character) {
      throw new NotFoundException(`Character ${id} not found`);
    }

    return character;
  }
}
