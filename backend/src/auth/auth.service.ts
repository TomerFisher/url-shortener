import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<LoginDto> {
    const user = await this.usersService.getUserByUsername(username);
    if (user && (await compare(password, user.password))) {
      return { id: user._id.toString(), username: user.username };
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const payload = { username: loginDto.username, sub: loginDto.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(signUpDto: SignUpDto): Promise<LoginDto> {
    const createUserDto: CreateUserDto = {
      username: signUpDto.username,
      password: await hash(signUpDto.password, 10),
    };
    const user = await this.usersService.create(createUserDto);
    return { id: user._id.toString(), username: user.username };
  }
}
