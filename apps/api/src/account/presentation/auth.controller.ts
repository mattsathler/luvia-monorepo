import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '../../shared/auth/decorators/public.decorator';
import { RegisterAccountUseCase } from '../application/use-cases/register-account.use-case';
import { LoginAccountUseCase } from '../application/use-cases/login-account.use-case';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerAccountUseCase: RegisterAccountUseCase,
    private readonly loginAccountUseCase: LoginAccountUseCase,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const account = await this.registerAccountUseCase.execute({ email: dto.email, password: dto.password });
    return { id: account.id, email: account.email };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { accessToken, account } = await this.loginAccountUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    return { accessToken, account: { id: account.id, email: account.email } };
  }
}
