import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateCharacterUseCase } from '../application/use-cases/create-character.use-case';
import { GetCharacterUseCase } from '../application/use-cases/get-character.use-case';
import { CreateCharacterDto } from './dto/create-character.dto';

@Controller('characters')
export class CharacterController {
  constructor(
    private readonly createCharacterUseCase: CreateCharacterUseCase,
    private readonly getCharacterUseCase: GetCharacterUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateCharacterDto) {
    return this.createCharacterUseCase.execute({ name: dto.name });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getCharacterUseCase.execute(id);
  }
}
