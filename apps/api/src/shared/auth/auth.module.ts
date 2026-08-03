import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SharedJwtModule } from './jwt.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), SharedJwtModule],
  providers: [JwtStrategy],
})
export class SharedAuthModule {}
