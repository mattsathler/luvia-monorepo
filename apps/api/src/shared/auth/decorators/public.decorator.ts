import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca uma rota/controller como não exigindo autenticação. Por padrão toda
 * rota é protegida (ver JwtAuthGuard registrado globalmente em app.module.ts).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
