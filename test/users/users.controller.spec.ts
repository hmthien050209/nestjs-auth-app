import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';

import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let createdUserId: string;
  let createdUserName: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [PrismaService, UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create new user', async () => {
    const newUser: Prisma.UserCreateInput = {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: await bcrypt.hash(faker.internet.password({ length: 10 }), 10),
      avatarUrl: faker.internet.url(),
      role: 'USER',
    };
    const createdUser = await controller.createUser(newUser);
    expect(createdUser.id).toBeDefined();
    createdUserId = createdUser.id;
    createdUserName = createdUser.username;
  });

  it("should fetch user's data without password", async () => {
    expect(await controller.getUser(createdUserId)).toStrictEqual(
      await service.user({
        where: { id: createdUserId },
        excludePassword: true,
      }),
    );
  });

  it('should not create user with duplicated username', async () => {
    const fakePass = await bcrypt.hash(
      faker.internet.password({ length: 10 }),
      10,
    );

    await expect(
      controller.createUser({
        email: faker.internet.email(),
        username: createdUserName,
        password: fakePass,
        avatarUrl: faker.internet.url(),
        role: 'USER',
      }),
    ).rejects.toThrow();
  });

  it("should update user's informations", async () => {
    const url = faker.internet.url();
    const updatedUser = await controller.updateUser(createdUserId, {
      avatarUrl: url,
    });
    expect(updatedUser.avatarUrl).toBe(url);
  });

  it('should be able to delete a user', async () => {
    await expect(controller.deleteUser(createdUserId)).resolves.not.toThrow();
    await expect(controller.getUser(createdUserId)).rejects.toThrow(
      new NotFoundException(),
    );
  });
});
