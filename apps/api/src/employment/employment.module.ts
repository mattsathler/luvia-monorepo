import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharacterModule } from '../character/character.module';
import { CityModule } from '../city/city.module';
import { StartContractUseCase } from './application/use-cases/start-contract.use-case';
import { RecomputeContractUseCase } from './application/use-cases/recompute-contract.use-case';
import { GetContractUseCase } from './application/use-cases/get-contract.use-case';
import { CONTRACT_REPOSITORY } from './domain/repositories/contract.repository';
import { ContractMongoRepository } from './infrastructure/persistence/contract.mongo.repository';
import { ContractModel, ContractSchema } from './infrastructure/persistence/contract.schema';
import { ContractTickScheduler } from './infrastructure/scheduling/contract-tick.scheduler';
import { EmploymentController } from './presentation/employment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContractModel.name, schema: ContractSchema }]),
    CharacterModule,
    CityModule,
  ],
  controllers: [EmploymentController],
  providers: [
    StartContractUseCase,
    RecomputeContractUseCase,
    GetContractUseCase,
    ContractTickScheduler,
    { provide: CONTRACT_REPOSITORY, useClass: ContractMongoRepository },
  ],
})
export class EmploymentModule {}
