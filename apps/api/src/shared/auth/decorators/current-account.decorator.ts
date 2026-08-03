import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

/**
 * Exportada separadamente para ser testável diretamente — createParamDecorator
 * não expõe a factory que recebe (padrão recomendado pela documentação do NestJS).
 */
export function currentAccountFactory(_data: unknown, ctx: ExecutionContext): string {
  const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
  return request.user.accountId;
}

/**
 * Extrai o id da conta autenticada (populado pela JwtStrategy) do request.
 */
export const CurrentAccount = createParamDecorator(currentAccountFactory);
