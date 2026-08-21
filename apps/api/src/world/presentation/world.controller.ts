import { Controller, Get } from '@nestjs/common';
import { Public } from '../../shared/auth/decorators/public.decorator';
import { GetWorldClockUseCase } from '../application/use-cases/get-world-clock.use-case';

@Controller('world')
export class WorldController {
  constructor(private readonly getWorldClockUseCase: GetWorldClockUseCase) {}

  // Relógio do mundo é global, igual pra todo mundo — não depende de quem
  // pergunta, então não precisa de conta autenticada (ver docs/decisions/0028).
  @Public()
  @Get('clock')
  getClock() {
    return this.getWorldClockUseCase.execute();
  }
}
