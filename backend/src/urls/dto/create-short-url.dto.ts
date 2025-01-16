import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ALIAS_MAX_LENGTH, ALIAS_MIN_LENGTH } from '../constants';

export class CreateShortUrlDto {
  @IsString()
  @IsNotEmpty()
  originalUrl: string;

  @IsOptional()
  @IsString()
  @Length(ALIAS_MIN_LENGTH, ALIAS_MAX_LENGTH)
  alias?: string;
}
