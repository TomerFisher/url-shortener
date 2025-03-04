import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forRoot(
      'mongodb+srv://url_shortener_user:9uyJhkabljDnoe5g@url-shortener.l37t9.mongodb.net/?retryWrites=true&w=majority&appName=url-shortener',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
