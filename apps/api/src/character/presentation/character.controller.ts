import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentAccount } from '../../shared/auth/decorators/current-account.decorator';
import { CreateCharacterUseCase } from '../application/use-cases/create-character.use-case';
import { GetCharacterUseCase } from '../application/use-cases/get-character.use-case';
import { ListMyCharactersUseCase } from '../application/use-cases/list-my-characters.use-case';
import { ChangeActivityUseCase } from '../application/use-cases/change-activity.use-case';
import { UpdateAppearanceUseCase } from '../application/use-cases/update-appearance.use-case';
import { CreateCharacterDto } from './dto/create-character.dto';
import { ChangeActivityDto } from './dto/change-activity.dto';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';
import { SKILL_DEFINITIONS } from '../domain/entities/skill';

@Controller('characters')
export class CharacterController {
  constructor(
    private readonly createCharacterUseCase: CreateCharacterUseCase,
    private readonly getCharacterUseCase: GetCharacterUseCase,
    private readonly listMyCharactersUseCase: ListMyCharactersUseCase,
    private readonly changeActivityUseCase: ChangeActivityUseCase,
    private readonly updateAppearanceUseCase: UpdateAppearanceUseCase,
  ) {}

  @Post()
  create(@CurrentAccount() accountId: string, @Body() dto: CreateCharacterDto) {
    return this.createCharacterUseCase.execute({
      accountId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      skinTone: dto.skinTone,
      hairType: dto.hairType,
      eyeType: dto.eyeType,
      skills: dto.skills,
    });
  }

  // Precisa vir antes de `:id`, senão "mine"/"skills" são interpretados como um id.
  @Get('mine')
  findMine(@CurrentAccount() accountId: string) {
    return this.listMyCharactersUseCase.execute(accountId);
  }

  /** Catálogo de skills disponíveis para distribuir na criação — ver domain/entities/skill.ts. */
  @Get('skills')
  listSkills() {
    return SKILL_DEFINITIONS;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getCharacterUseCase.execute(id);
  }

  @Post(':id/activity')
  changeActivity(@CurrentAccount() accountId: string, @Param('id') id: string, @Body() dto: ChangeActivityDto) {
    return this.changeActivityUseCase.execute({
      characterId: id,
      accountId,
      activity: dto.activity,
      activityEndsAt: dto.activityEndsAt ? new Date(dto.activityEndsAt) : null,
    });
  }

  @Patch(':id/appearance')
  updateAppearance(@CurrentAccount() accountId: string, @Param('id') id: string, @Body() dto: UpdateAppearanceDto) {
    return this.updateAppearanceUseCase.execute({ characterId: id, accountId, appearance: dto });
  }
}
