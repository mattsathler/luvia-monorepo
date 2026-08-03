import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Character } from '../../domain/entities/character.entity';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';

export type CreateCharacterInput = {
  name: string;
  accountId: string;
};

@Injectable()
export class CreateCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(input: CreateCharacterInput): Promise<Character> {
    const character = Character.create({ name: input.name, accountId: input.accountId }, randomUUID());
    return this.characterRepository.save(character);
  }
}
