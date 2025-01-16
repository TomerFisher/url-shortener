import { Module } from '@nestjs/common';
import { UrlsModule } from './urls/urls.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'url_shortener_user',
      password: 'url_shortener_pass',
      database: 'url_shortener',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UrlsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
