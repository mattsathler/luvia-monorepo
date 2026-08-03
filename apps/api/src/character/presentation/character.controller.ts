import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateCharacterUseCase } from '../application/use-cases/create-character.use-case';
import { GetCharacterUseCase } from '../application/use-cases/get-character.use-case';
import { ChangeActivityUseCase } from '../application/use-cases/change-activity.use-case';
import { CreateCharacterDto } from './dto/create-character.dto';
import { ChangeActivityDto } from './dto/change-activity.dto';

@Controller('characters')
export class CharacterController {
  constructor(
    private readonly createCharacterUseCase: CreateCharacterUseCase,
    private readonly getCharacterUseCase: GetCharacterUseCase,
    private readonly changeActivityUseCase: ChangeActivityUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateCharacterDto) {
    return this.createCharacterUseCase.execute({ name: dto.name });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getCharacterUseCase.execute(id);
  }

  @Post(':id/activity')
  changeActivity(@Param('id') id: string, @Body() dto: ChangeActivityDto) {
    return this.changeActivityUseCase.execute({
      characterId: id,
      activity: dto.activity,
      activityEndsAt: dto.activityEndsAt ? new Date(dto.activityEndsAt) : null,
    });
  }
}
