import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as base62 from 'base62';
import { Url } from './url.entity';
import { CreateShortUrlDto } from './dto/create-short-url.dto';

@Injectable()
export class UrlsService {
  counter: number;

  constructor(
    @InjectRepository(Url)
    private readonly urlsRepository: Repository<Url>,
  ) {
    this.counter = 0;
  }

  createShortUrl(createShortUrlDto: CreateShortUrlDto): Promise<Url> {
    const url = new Url();
    url.originalUrl = createShortUrlDto.originalUrl;
    url.shortUrl = createShortUrlDto.alias || this.generateShortUrl();
    return this.urlsRepository.save(url);
  }

  async getOriginalUrl(shortUrl: string): Promise<string> {
    const url = await this.urlsRepository.findOneBy({ shortUrl });
    if (url) {
      return url.originalUrl;
    }
    return null;
  }

  private generateShortUrl(): string {
    return base62.encode(this.counter++);
  }
}
