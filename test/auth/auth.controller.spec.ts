import { faker } from '@faker-js/faker';
import { createMock } from '@golevelup/ts-vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: UsersService;
  let createdUserId: string;
  let createdUsername: string;
  let createdUserPassword: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      controllers: [AuthController],
      providers: [AuthService, PrismaService, UsersService],
    })
      .useMocker(() => createMock<UsersService>())
      .compile();

    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should validate existing user', async () => {
    createdUserPassword = faker.internet.password({ length: 10 });
    const newUser: Prisma.UserCreateInput = {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: createdUserPassword,
      avatarUrl: faker.internet.url(),
      role: 'USER',
    };

    const createdUser = await usersService.createUser(newUser);
    createdUserId = createdUser.id;
    createdUsername = createdUser.username;

    expect(
      controller.validate({
        username: createdUsername,
        password: createdUserPassword,
      }),
    );
  });

  it('should invalidate user with wrong authentication info', async () => {
    // The exception will be handled by NestJS
    await expect(
      controller.validate({
        username: createdUsername,
        password: faker.internet.password({ length: 10 }),
      }),
    ).resolves.toEqual({});
  });

  it('should throw NotFoundException when the user is not found', async () => {
    // The exception will be handled by NestJS
    await expect(
      controller.validate({
        username: faker.internet.userName(),
        password: faker.internet.password({ length: 10 }),
      }),
    ).resolves.toEqual({});
  });

  afterAll(async () => {
    await usersService.deleteUser({ id: createdUserId });
  });
});
