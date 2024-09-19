import { faker } from '@faker-js/faker';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let createdUserId: string;
  let createdUsername: string;
  let createdUserPassword: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [AuthService, PrismaService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate existing user', async () => {
    createdUserPassword = faker.internet.password({ length: 10 });
    const newUser: Prisma.UserCreateInput = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: createdUserPassword,
      avatarUrl: faker.internet.url(),
      role: 'USER',
    };

    const createdUser = await usersService.createUser(newUser);
    createdUserId = createdUser.id;
    createdUsername = createdUser.username;

    await expect(
      service.validate({
        username: createdUsername,
        password: createdUserPassword,
      }),
    ).resolves.not.toThrow();
  });

  it('should invalidate user with wrong authentication info', async () => {
    await expect(
      service.validate({
        username: createdUsername,
        password: faker.internet.password({ length: 10 }),
      }),
    ).rejects.toThrow(new UnauthorizedException());
  });

  it('should throw NotFoundException when the user is not found', async () => {
    await expect(
      service.validate({
        username: faker.internet.userName(),
        password: faker.internet.password({ length: 10 }),
      }),
    ).rejects.toThrow(new NotFoundException());
  });

  afterAll(async () => {
    await usersService.deleteUser({ id: createdUserId });
  });
});
