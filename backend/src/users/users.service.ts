import { Injectable } from '@nestjs/common';
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

  createUser(email: string, name: string, hash: string) {
    const user = new User();
    user.email = email;
    user.name = name;
    user.hash = hash;
    return this.usersRepository.save(user);
  }
}
