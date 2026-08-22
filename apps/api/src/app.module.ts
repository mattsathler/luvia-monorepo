import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './shared/database/database.module';
import { HealthModule } from './shared/health/health.module';
import { SharedAuthModule } from './shared/auth/auth.module';
import { JwtAuthGuard } from './shared/auth/guards/jwt-auth.guard';
import { AccountModule } from './account/account.module';
import { CharacterModule } from './character/character.module';
import { CityModule } from './city/city.module';
import { WorldModule } from './world/world.module';
import { EmploymentModule } from './employment/employment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    SharedAuthModule,
    HealthModule,
    AccountModule,
    CharacterModule,
    CityModule,
    WorldModule,
    EmploymentModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
