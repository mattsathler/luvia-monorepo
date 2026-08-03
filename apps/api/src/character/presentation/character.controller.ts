import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentAccount } from '../../shared/auth/decorators/current-account.decorator';
import { CreateCharacterUseCase } from '../application/use-cases/create-character.use-case';
import { GetCharacterUseCase } from '../application/use-cases/get-character.use-case';
import { ListMyCharactersUseCase } from '../application/use-cases/list-my-characters.use-case';
import { ChangeActivityUseCase } from '../application/use-cases/change-activity.use-case';
import { CreateCharacterDto } from './dto/create-character.dto';
import { ChangeActivityDto } from './dto/change-activity.dto';

@Controller('characters')
export class CharacterController {
  constructor(
    private readonly createCharacterUseCase: CreateCharacterUseCase,
    private readonly getCharacterUseCase: GetCharacterUseCase,
    private readonly listMyCharactersUseCase: ListMyCharactersUseCase,
    private readonly changeActivityUseCase: ChangeActivityUseCase,
  ) {}

  @Post()
  create(@CurrentAccount() accountId: string, @Body() dto: CreateCharacterDto) {
    return this.createCharacterUseCase.execute({ name: dto.name, accountId });
  }

  // Precisa vir antes de `:id`, senão "mine" é interpretado como um id.
  @Get('mine')
  findMine(@CurrentAccount() accountId: string) {
    return this.listMyCharactersUseCase.execute(accountId);
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
}
