import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../../character/domain/repositories/character.repository';
import { LOT_TYPE_NAMES } from '../../domain/entities/lot.entity';
import { GetCharacterLotUseCase } from './get-character-lot.use-case';

export type CurrentLot = {
  name: string;
  x: number;
  y: number;
};

/**
 * Resolve o lote onde o personagem está agora, a partir da atividade atual
 * (ver docs/game-design/wryd-activity-system.md) — todo jogador está sempre
 * "em algum lote": trabalhando, no lote do emprego; em descanso ou ocioso,
 * em casa; num evento, no lote do evento.
 *
 * Hoje só existe lote residencial (emprego e eventos ainda não têm lotes
 * próprios — ver docs/game-design/jobs.md e events.md), então toda atividade
 * cai nele. Quando esses sistemas existirem, este é o único lugar que passa
 * a escolher entre eles conforme `character.activity`.
 */
@Injectable()
export class GetCurrentLotUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
    private readonly getCharacterLotUseCase: GetCharacterLotUseCase,
  ) {}

  async execute(characterId: string): Promise<CurrentLot> {
    const character = await this.characterRepository.findById(characterId);
    if (!character) {
      throw new NotFoundException('Personagem não encontrado.');
    }

    const lot = await this.getCharacterLotUseCase.execute(characterId);
    return { name: LOT_TYPE_NAMES[lot.type], x: lot.x, y: lot.y };
  }
}
