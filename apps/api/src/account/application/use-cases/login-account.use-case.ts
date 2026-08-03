import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Account } from '../../domain/entities/account.entity';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../../domain/repositories/account.repository';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/services/password-hasher';

export type LoginAccountInput = {
  email: string;
  password: string;
};

export type LoginAccountOutput = {
  accessToken: string;
  account: Account;
};

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

@Injectable()
export class LoginAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginAccountInput): Promise<LoginAccountOutput> {
    const email = input.email.trim().toLowerCase();
    const account = await this.accountRepository.findByEmail(email);

    if (!account) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, account.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const accessToken = await this.jwtService.signAsync({ sub: account.id });

    return { accessToken, account };
  }
}
