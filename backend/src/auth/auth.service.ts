import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { compare, hash } from 'bcryptjs';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.usersService.getUserByUsername(username);
    if (user && (await compare(password, user.password))) {
      return { id: user._id.toString(), username: user.username };
    }
    return null;
  }

  async login(user: AuthenticatedUser): Promise<{ access_token: string }> {
    const payload = {
      username: user.username,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(signUpDto: SignUpDto): Promise<AuthenticatedUser> {
    const createUserDto: CreateUserDto = {
      username: signUpDto.username,
      password: await hash(signUpDto.password, 10),
    };
    const user = await this.usersService.create(createUserDto);
    return { id: user._id.toString(), username: user.username };
  }
}
