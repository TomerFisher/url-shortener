import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { Url } from './url.entity';
import { REDIS_INSTANCE } from '../redis/redis.module';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

describe('UrlsService', () => {
  let service: UrlsService;
  let repository: Repository<Url>;
  let redis: Redis;
  let url: Url;

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

    url = new Url();
    url.originalUrl = 'http://example.com';
    url.alias = '2h5OqqO';
    jest.spyOn(repository, 'create').mockReturnValue(url);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should create a short URL', async () => {
      jest.spyOn(service.sqids, 'encode').mockReturnValue(url.alias);
      jest.spyOn(repository, 'save').mockResolvedValue(url);
      jest.spyOn(redis, 'incr').mockResolvedValue(1);
      jest.spyOn(redis, 'set').mockResolvedValue('OK');

      const result = await service.createShortUrl({
        originalUrl: url.originalUrl,
      });
      expect(result).toEqual(url);
    });

    it('should throw ForbiddenException if alias already exists', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue({ code: '23505' });

      await expect(service.createShortUrl(url)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());
      jest.spyOn(redis, 'incr').mockResolvedValue(1);

      await expect(
        service.createShortUrl({ originalUrl: url.originalUrl }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL from cache', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(url.originalUrl);

      const result = await service.getOriginalUrl(url.alias);
      expect(result).toBe(url.originalUrl);
    });

    it('should return the original URL from database if not in cache', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(url);
      jest.spyOn(redis, 'set').mockResolvedValue('OK');

      const result = await service.getOriginalUrl(url.alias);
      expect(result).toBe(url.originalUrl);
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
