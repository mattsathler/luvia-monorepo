import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';

export function mongooseConfigFactory(config: ConfigService): MongooseModuleOptions {
  return { uri: config.getOrThrow<string>('MONGODB_URI') };
}

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mongooseConfigFactory,
    }),
  ],
})
export class DatabaseModule {}
