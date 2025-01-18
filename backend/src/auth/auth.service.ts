import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(singUpDto: SignUpDto) {
    try {
      if (singUpDto.password !== singUpDto.confirmPassword) {
        throw new BadRequestException(
          'Password and confirm password do not match.',
        );
      }
      const hash = await argon2.hash(singUpDto.password);
      const user = await this.usersService.createUser(
        singUpDto.email,
        singUpDto.name,
        hash,
      );
      delete user.hash;
      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new ForbiddenException('Email already exists.');
      }
      throw new InternalServerErrorException();
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOneByEmail(signInDto.email);
    if (!user || !(await argon2.verify(user.hash, signInDto.password))) {
      throw new ForbiddenException('Invalid email or password.');
    }
    const payload = { sub: user.id, name: user.name, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
