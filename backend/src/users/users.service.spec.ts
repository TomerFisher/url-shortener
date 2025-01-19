import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let user: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository<User>,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    user = new User();
    user.email = 'test@example.com';
    user.name = 'Test User';
    user.hash = 'hashedpassword';
    jest.spyOn(repository, 'create').mockReturnValue(user);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);

      expect(await service.findOneByEmail(user.email)).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      expect(await service.findOneByEmail(user.email)).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      expect(
        await service.createUser(user.email, user.name, user.hash),
      ).toEqual(user);
    });

    it('should throw ForbiddenException if email already exists', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue({ code: '23505' });

      await expect(
        service.createUser(user.email, user.name, user.hash),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(
        service.createUser(user.email, user.name, user.hash),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
