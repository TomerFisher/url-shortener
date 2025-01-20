import { Body, Controller, Get, Param, Post, Redirect } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { Url } from './url.entity';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Public()
  @Get(':alias')
  @Redirect()
  async redirectToOriginalUrl(@Param('alias') alias: string) {
    const url = await this.urlsService.getOriginalUrl(alias);
    return { url };
  }

  @Post('/urls')
  createShortUrl(
    @Body() createShortUrlDto: CreateShortUrlDto,
    @GetUser() user: User,
  ): Promise<Url> {
    return this.urlsService.createShortUrl(user, createShortUrlDto);
  }
}
