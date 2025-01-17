import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { Url } from './url.entity';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { REDIS_INSTANCE } from '../redis/redis.module';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

describe('UrlsService', () => {
  let service: UrlsService;
  let repository: Repository<Url>;
  let redis: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useClass: Repository,
        },
        {
          provide: REDIS_INSTANCE,
          useClass: Redis,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));
    redis = module.get<Redis>(REDIS_INSTANCE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should create a short URL', async () => {
      const createShortUrlDto: CreateShortUrlDto = {
        originalUrl: 'http://example.com',
      };
      const url = new Url();
      url.originalUrl = createShortUrlDto.originalUrl;
      url.alias = '2h5OqqO';

      jest.spyOn(service.sqids, 'encode').mockReturnValue(url.alias);
      jest.spyOn(repository, 'insert').mockResolvedValue(undefined);
      jest.spyOn(redis, 'incr').mockResolvedValue(1);
      jest.spyOn(redis, 'set').mockResolvedValue('OK');

      const result = await service.createShortUrl(createShortUrlDto);
      expect(result).toEqual(url);
    });

    it('should throw ForbiddenException if alias already exists', async () => {
      const createShortUrlDto: CreateShortUrlDto = {
        originalUrl: 'http://example.com',
        alias: '2h5OqqO',
      };

      jest.spyOn(repository, 'insert').mockRejectedValue({ code: '23505' });

      await expect(service.createShortUrl(createShortUrlDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const createShortUrlDto: CreateShortUrlDto = {
        originalUrl: 'http://example.com',
      };

      jest.spyOn(repository, 'insert').mockRejectedValue(new Error());
      jest.spyOn(redis, 'incr').mockResolvedValue(1);

      await expect(service.createShortUrl(createShortUrlDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL from cache', async () => {
      const alias = '2h5OqqO';
      const originalUrl = 'http://example.com';

      jest.spyOn(redis, 'get').mockResolvedValue(originalUrl);

      const result = await service.getOriginalUrl(alias);
      expect(result).toBe(originalUrl);
    });

    it('should return the original URL from database if not in cache', async () => {
      const alias = '2h5OqqO';
      const originalUrl = 'http://example.com';
      const url = new Url();
      url.alias = alias;
      url.originalUrl = originalUrl;

      jest.spyOn(redis, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(url);

      const result = await service.getOriginalUrl(alias);
      expect(result).toBe(originalUrl);
    });

    it('should throw NotFoundException if alias not found', async () => {
      const alias = '2h5OqqO';

      jest.spyOn(redis, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.getOriginalUrl(alias)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
