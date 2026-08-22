import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentAccount } from '../../shared/auth/decorators/current-account.decorator';
import { StartContractUseCase } from '../application/use-cases/start-contract.use-case';
import { GetContractUseCase } from '../application/use-cases/get-contract.use-case';
import { StartContractDto } from './dto/start-contract.dto';

@Controller('employment')
export class EmploymentController {
  constructor(
    private readonly startContractUseCase: StartContractUseCase,
    private readonly getContractUseCase: GetContractUseCase,
  ) {}

  @Post('characters/:characterId/contract')
  startContract(
    @CurrentAccount() accountId: string,
    @Param('characterId') characterId: string,
    @Body() dto: StartContractDto,
  ) {
    return this.startContractUseCase.execute({ characterId, accountId, workplaceId: dto.workplaceId });
  }

  @Get('characters/:characterId/contract')
  getContract(@Param('characterId') characterId: string) {
    return this.getContractUseCase.execute(characterId);
  }
}
