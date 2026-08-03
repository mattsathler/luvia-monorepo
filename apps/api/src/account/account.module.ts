import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedJwtModule } from '../shared/auth/jwt.module';
import { AuthController } from './presentation/auth.controller';
import { RegisterAccountUseCase } from './application/use-cases/register-account.use-case';
import { LoginAccountUseCase } from './application/use-cases/login-account.use-case';
import { ACCOUNT_REPOSITORY } from './domain/repositories/account.repository';
import { AccountMongoRepository } from './infrastructure/persistence/account.mongo.repository';
import { AccountModel, AccountSchema } from './infrastructure/persistence/account.schema';
import { PASSWORD_HASHER } from './domain/services/password-hasher';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AccountModel.name, schema: AccountSchema }]),
    SharedJwtModule,
  ],
  controllers: [AuthController],
  providers: [
    RegisterAccountUseCase,
    LoginAccountUseCase,
    { provide: ACCOUNT_REPOSITORY, useClass: AccountMongoRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
  ],
})
export class AccountModule {}
