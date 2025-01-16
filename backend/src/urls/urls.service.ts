import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as base62 from 'base62';
import Redis from 'ioredis';
import { Url } from './url.entity';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { REDIS_INSTANCE } from '../redis/redis.module';

const counter_key = 'counter';

@Injectable()
export class UrlsService implements OnModuleInit {
  counter: number;

  constructor(
    @InjectRepository(Url)
    private readonly urlsRepository: Repository<Url>,
    @Inject(REDIS_INSTANCE) private readonly redis: Redis,
  ) {}

  async onModuleInit() {
    this.counter = await this.redis.incrby(counter_key, 0);
  }

  async createShortUrl(createShortUrlDto: CreateShortUrlDto): Promise<Url> {
    const url = new Url();
    url.originalUrl = createShortUrlDto.originalUrl;
    url.shortUrl = createShortUrlDto.alias || (await this.generateShortUrl());
    const savedUrl = await this.urlsRepository.save(url);
    await this.redis.set(url.shortUrl, url.originalUrl);
    return savedUrl;
  }

  async getOriginalUrl(shortUrl: string): Promise<string> {
    const cachedOriginalUrl = await this.redis.get(shortUrl);
    if (cachedOriginalUrl) {
      return cachedOriginalUrl;
    }
    const url = await this.urlsRepository.findOneBy({ shortUrl });
    if (!url) {
      throw new NotFoundException(`short url ${shortUrl} not found`);
    }
    return url.originalUrl;
  }

  private async generateShortUrl(): Promise<string> {
    const conter = await this.redis.incr(counter_key);
    return base62.encode(conter);
  }
}
