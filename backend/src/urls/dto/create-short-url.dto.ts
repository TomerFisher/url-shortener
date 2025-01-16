import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShortUrlDto {
  @IsString()
  @IsNotEmpty()
  originalUrl: string;

  @IsOptional()
  @IsString()
  alias?: string;
}
