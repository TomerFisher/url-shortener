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

const counter_key = 'counter';

@Injectable()
export class UrlsService {
  sqids: Sqids;

  constructor(
    @InjectRepository(Url)
    private readonly urlsRepository: Repository<Url>,
    @Inject(REDIS_INSTANCE) private readonly redis: Redis,
  ) {
    this.sqids = new Sqids({ minLength: ALIAS_MIN_LENGTH });
  }

  async createShortUrl(createShortUrlDto: CreateShortUrlDto): Promise<Url> {
    try {
      const url = new Url();
      url.originalUrl = createShortUrlDto.originalUrl;
      url.alias = createShortUrlDto.alias || (await this.generateAlias());
      await this.urlsRepository.insert(url);
      await this.redis.set(url.alias, url.originalUrl);
      return url;
    } catch (error) {
      if (error.code === '23505') {
        throw new ForbiddenException('alias already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async getOriginalUrl(alias: string): Promise<string> {
    const cachedOriginalUrl = await this.redis.get(alias);
    if (cachedOriginalUrl) {
      return cachedOriginalUrl;
    }
    const url = await this.urlsRepository.findOneBy({ alias });
    if (!url) {
      throw new NotFoundException(`alias "${alias}" not found`);
    }
    return url.originalUrl;
  }

  private async generateAlias(): Promise<string> {
    const conter = await this.redis.incr(counter_key);
    return this.sqids.encode([conter]);
  }
}
