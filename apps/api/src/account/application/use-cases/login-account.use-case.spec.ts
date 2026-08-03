import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAccountUseCase } from './login-account.use-case';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { Account } from '../../domain/entities/account.entity';

const existingAccount = Account.create({ email: 'ana@example.com', passwordHash: 'hashed' }, 'acc-1');

describe('LoginAccountUseCase', () => {
  it('returns an access token when credentials are valid', async () => {
    const accountRepository: jest.Mocked<AccountRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(async (_email: string) => existingAccount),
    };

    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: jest.fn(),
      compare: jest.fn(async (_plain: string, _hash: string) => true),
    };

    const jwtService = {
      signAsync: jest.fn(async () => 'signed-token'),
    } as unknown as JwtService;

    const useCase = new LoginAccountUseCase(accountRepository, passwordHasher, jwtService);
    const result = await useCase.execute({ email: 'ana@example.com', password: 'correct-password' });

    expect(passwordHasher.compare).toHaveBeenCalledWith('correct-password', 'hashed');
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'acc-1' });
    expect(result.accessToken).toBe('signed-token');
    expect(result.account).toBe(existingAccount);
  });

  it('rejects when the email is unknown', async () => {
    const accountRepository: jest.Mocked<AccountRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(async (_email: string) => null),
    };

    const passwordHasher: jest.Mocked<PasswordHasher> = { hash: jest.fn(), compare: jest.fn() };
    const jwtService = { signAsync: jest.fn() } as unknown as JwtService;

    const useCase = new LoginAccountUseCase(accountRepository, passwordHasher, jwtService);

    await expect(useCase.execute({ email: 'unknown@example.com', password: 'x' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when the password does not match', async () => {
    const accountRepository: jest.Mocked<AccountRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(async (_email: string) => existingAccount),
    };

    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: jest.fn(),
      compare: jest.fn(async (_plain: string, _hash: string) => false),
    };
    const jwtService = { signAsync: jest.fn() } as unknown as JwtService;

    const useCase = new LoginAccountUseCase(accountRepository, passwordHasher, jwtService);

    await expect(useCase.execute({ email: 'ana@example.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
