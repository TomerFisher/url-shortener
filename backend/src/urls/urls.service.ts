import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Sqids from 'sqids';
import Redis from 'ioredis';
import { Url } from './url.entity';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { REDIS_INSTANCE } from '../redis/redis.module';
import { ALIAS_MIN_LENGTH } from './constants';
import { User } from '../users/user.entity';

const counter_key = 'counter';

@Injectable()
export class UrlsService {
  sqids: Sqids;

  constructor(
    @InjectRepository(Url) private readonly urlsRepository: Repository<Url>,
    @Inject(REDIS_INSTANCE) private readonly redis: Redis,
  ) {
    this.sqids = new Sqids({ minLength: ALIAS_MIN_LENGTH });
  }

  async createShortUrl(
    user: User,
    createShortUrlDto: CreateShortUrlDto,
  ): Promise<Url> {
    const url = this.urlsRepository.create({
      originalUrl: createShortUrlDto.originalUrl,
      alias: createShortUrlDto.alias || (await this.generateAlias()),
      user,
    });
    try {
      await this.urlsRepository.save(url);
      await this.cacheUrl(url);
      return url;
    } catch (error) {
      if (error.code === '23505') {
        throw new ForbiddenException('Alias already exists');
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating short url.',
      );
    }
  }

  async getOriginalUrl(alias: string): Promise<string> {
    const cachedOriginalUrl = await this.getCachedUrl(alias);
    if (cachedOriginalUrl) {
      return cachedOriginalUrl;
    }
    const url = await this.urlsRepository.findOneBy({ alias });
    if (!url) {
      throw new NotFoundException(`Alias ${alias} not found`);
    }
    await this.cacheUrl(url);
    return url.originalUrl;
  }

  private async generateAlias(): Promise<string> {
    const conter = await this.redis.incr(counter_key);
    return this.sqids.encode([conter]);
  }

  private async cacheUrl(url: Url) {
    try {
      await this.redis.set(url.alias, url.originalUrl);
    } catch (error) {
      console.error(
        `Failed to cache URL for alias "${url.alias}": ${error.message}`,
      );
    }
  }

  private async getCachedUrl(alias: string) {
    try {
      return await this.redis.get(alias);
    } catch (error) {
      console.error(
        `Failed to retrieve value from Redis for alias "${alias}": ${error.message}`,
      );
      return null;
    }
  }
}
