import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findOneByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async createUser(email: string, name: string, hash: string) {
    try {
      const user = this.usersRepository.create({ email, name, hash });
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ForbiddenException('Email already exists.');
      }
      throw new InternalServerErrorException();
    }
  }
}
