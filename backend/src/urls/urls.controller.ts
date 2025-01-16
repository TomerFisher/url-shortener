import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { Url } from './url.entity';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Get(':shortUrl')
  @Redirect()
  async redirectToOriginalUrl(@Param('shortUrl') shortUrl: string) {
    try {
      const url = await this.urlsService.getOriginalUrl(shortUrl);
      return { url };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  @Post('/urls')
  createShortUrl(@Body() createShortUrlDto: CreateShortUrlDto): Promise<Url> {
    try {
      return this.urlsService.createShortUrl(createShortUrlDto);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
