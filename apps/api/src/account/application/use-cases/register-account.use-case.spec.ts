import { ConflictException } from '@nestjs/common';
import { RegisterAccountUseCase } from './register-account.use-case';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { Account } from '../../domain/entities/account.entity';

describe('RegisterAccountUseCase', () => {
  it('hashes the password before saving and never persists the plain text', async () => {
    const accountRepository: jest.Mocked<AccountRepository> = {
      save: jest.fn(async (account: Account) => account),
      findById: jest.fn(),
      findByEmail: jest.fn(async (_email: string) => null),
    };

    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: jest.fn(async (_plain: string) => 'hashed-password'),
      compare: jest.fn(),
    };

    const useCase = new RegisterAccountUseCase(accountRepository, passwordHasher);
    const account = await useCase.execute({ email: 'ana@example.com', password: 'plain-text-password' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('plain-text-password');
    expect(account.passwordHash).toBe('hashed-password');
    expect(accountRepository.save).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: 'hashed-password' }));
  });

  it('rejects registration when the email is already taken', async () => {
    const existing = Account.create({ email: 'ana@example.com', passwordHash: 'x' }, 'acc-1');

    const accountRepository: jest.Mocked<AccountRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(async (_email: string) => existing),
    };

    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const useCase = new RegisterAccountUseCase(accountRepository, passwordHasher);

    await expect(useCase.execute({ email: 'ana@example.com', password: 'whatever' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(accountRepository.save).not.toHaveBeenCalled();
  });
});
