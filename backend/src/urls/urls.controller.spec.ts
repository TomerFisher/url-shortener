import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { Url } from './url.entity';

describe('UrlsController', () => {
  let controller: UrlsController;
  let service: UrlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: {
            getOriginalUrl: jest.fn(),
            createShortUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    service = module.get<UrlsService>(UrlsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('redirectToOriginalUrl', () => {
    it('should return the original URL', async () => {
      const alias = '2h5OqqO';
      const originalUrl = 'http://example.com';
      jest.spyOn(service, 'getOriginalUrl').mockResolvedValue(originalUrl);

      const result = await controller.redirectToOriginalUrl(alias);

      expect(result).toEqual({ url: originalUrl });
      expect(service.getOriginalUrl).toHaveBeenCalledWith(alias);
    });
  });

  describe('createShortUrl', () => {
    it('should create a short URL', async () => {
      const createShortUrlDto: CreateShortUrlDto = {
        originalUrl: 'http://example.com',
      };
      const createdUrl: Url = {
        alias: '2h5OqqO',
        originalUrl: 'http://example.com',
        createdAt: new Date(),
      };
      jest.spyOn(service, 'createShortUrl').mockResolvedValue(createdUrl);

      const result = await controller.createShortUrl(createShortUrlDto);

      expect(result).toEqual(createdUrl);
      expect(service.createShortUrl).toHaveBeenCalledWith(createShortUrlDto);
    });
  });
});
