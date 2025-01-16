import { Body, Controller, Get, Param, Post, Redirect } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { Url } from './url.entity';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Get(':shortUrl')
  @Redirect()
  async redirectToOriginalUrl(@Param('shortUrl') shortUrl: string) {
    const url = await this.urlsService.getOriginalUrl(shortUrl);
    return { url };
  }

  @Post('/urls')
  createShortUrl(@Body() createShortUrlDto: CreateShortUrlDto): Promise<Url> {
    console.log(createShortUrlDto);
    return this.urlsService.createShortUrl(createShortUrlDto);
  }
}
