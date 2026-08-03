import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Account } from '../../domain/entities/account.entity';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../../domain/repositories/account.repository';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/services/password-hasher';

export type RegisterAccountInput = {
  email: string;
  password: string;
};

@Injectable()
export class RegisterAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterAccountInput): Promise<Account> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.accountRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const account = Account.create({ email, passwordHash }, randomUUID());

    return this.accountRepository.save(account);
  }
}
