import { Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_INSTANCE = 'REDIS_INSTANCE';

@Module({
  providers: [
    {
      provide: REDIS_INSTANCE,
      useFactory: () => {
        return new Redis('redis://localhost:6379');
      },
    },
  ],
  exports: [REDIS_INSTANCE],
})
export class RedisModule {}
