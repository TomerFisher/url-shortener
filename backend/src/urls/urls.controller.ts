import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { Url } from './url.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/decorators/public.decorator';

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

  @UseGuards(AuthGuard)
  @Post('/urls')
  createShortUrl(@Body() createShortUrlDto: CreateShortUrlDto): Promise<Url> {
    return this.urlsService.createShortUrl(createShortUrlDto);
  }
}
