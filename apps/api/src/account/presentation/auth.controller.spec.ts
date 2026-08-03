import { AuthController } from './auth.controller';
import { RegisterAccountUseCase } from '../application/use-cases/register-account.use-case';
import { LoginAccountUseCase } from '../application/use-cases/login-account.use-case';

describe('AuthController', () => {
  function buildController() {
    const registerAccountUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RegisterAccountUseCase>;
    const loginAccountUseCase = { execute: jest.fn() } as unknown as jest.Mocked<LoginAccountUseCase>;

    const controller = new AuthController(registerAccountUseCase, loginAccountUseCase);

    return { controller, registerAccountUseCase, loginAccountUseCase };
  }

  it('register() delegates to RegisterAccountUseCase and never returns the password hash', async () => {
    const { controller, registerAccountUseCase } = buildController();
    registerAccountUseCase.execute.mockResolvedValue({
      id: 'acc-1',
      email: 'ana@example.com',
      passwordHash: 'super-secret-hash',
      createdAt: new Date(),
    } as never);

    const result = await controller.register({ email: 'ana@example.com', password: 'correct-horse' });

    expect(registerAccountUseCase.execute).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'correct-horse',
    });
    expect(result).toEqual({ id: 'acc-1', email: 'ana@example.com' });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('login() delegates to LoginAccountUseCase and returns the access token with the account', async () => {
    const { controller, loginAccountUseCase } = buildController();
    loginAccountUseCase.execute.mockResolvedValue({
      accessToken: 'signed-token',
      account: { id: 'acc-1', email: 'ana@example.com', passwordHash: 'x', createdAt: new Date() },
    } as never);

    const result = await controller.login({ email: 'ana@example.com', password: 'correct-horse' });

    expect(loginAccountUseCase.execute).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'correct-horse',
    });
    expect(result).toEqual({ accessToken: 'signed-token', account: { id: 'acc-1', email: 'ana@example.com' } });
  });
});
