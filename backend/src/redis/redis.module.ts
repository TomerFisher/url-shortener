import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_INSTANCE = 'REDIS_INSTANCE';

@Module({
  providers: [
    {
      provide: REDIS_INSTANCE,
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.get('REDIS_URI'));
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_INSTANCE],
})
export class RedisModule {}
