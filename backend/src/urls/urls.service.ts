import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Sqids from 'sqids';
import Redis from 'ioredis';
import { Url } from './url.entity';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { REDIS_INSTANCE } from '../redis/redis.module';

const counter_key = 'counter';

@Injectable()
export class UrlsService implements OnModuleInit {
  counter: number;
  sqids: Sqids;

  constructor(
    @InjectRepository(Url)
    private readonly urlsRepository: Repository<Url>,
    @Inject(REDIS_INSTANCE) private readonly redis: Redis,
  ) {
    this.sqids = new Sqids();
  }

  async onModuleInit() {
    try {
      this.counter = await this.redis.incrby(counter_key, 0);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async createShortUrl(createShortUrlDto: CreateShortUrlDto): Promise<Url> {
    try {
      const url = new Url();
      url.originalUrl = createShortUrlDto.originalUrl;
      url.shortUrl = createShortUrlDto.alias || (await this.generateShortUrl());
      await this.urlsRepository.insert(url);
      await this.redis.set(url.shortUrl, url.originalUrl);
      return url;
    } catch (error) {
      if (error.code === '23505') {
        throw new ForbiddenException('alias already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async getOriginalUrl(shortUrl: string): Promise<string> {
    const cachedOriginalUrl = await this.redis.get(shortUrl);
    if (cachedOriginalUrl) {
      return cachedOriginalUrl;
    }
    const url = await this.urlsRepository.findOneBy({ shortUrl });
    if (!url) {
      throw new NotFoundException(`alias "${shortUrl}" not found`);
    }
    return url.originalUrl;
  }

  private async generateShortUrl(): Promise<string> {
    const conter = await this.redis.incr(counter_key);
    return this.sqids.encode([conter]);
  }
}
