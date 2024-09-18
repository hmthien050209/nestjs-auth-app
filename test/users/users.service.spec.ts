import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let createdUserId: string;
  let createdUserName: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create new user', async () => {
    const createdUser = await service.createUser({
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: await bcrypt.hash(faker.internet.password({ length: 10 }), 10),
      avatarUrl: faker.internet.url(),
      role: 'USER',
    });
    expect(createdUser.id).toBeDefined();
    createdUserId = createdUser.id;
    createdUserName = createdUser.username;
  });

  it("should fetch user's data", async () => {
    const user = await service.user({ id: createdUserId });
    expect(user).not.toBeNull();
  });

  it('should not create user with duplicated username', async () => {
    const fakePass = await bcrypt.hash(
      faker.internet.password({ length: 10 }),
      10,
    );
    await expect(
      service.createUser({
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
    const updatedUser = await service.updateUser({
      where: { id: createdUserId },
      data: {
        avatarUrl: url,
      },
    });
    expect(updatedUser.avatarUrl).toBe(url);
  });

  it('should be able to delete a user', async () => {
    await expect(
      service.deleteUser({ id: createdUserId }),
    ).resolves.not.toThrow();
    expect(await service.user({ id: createdUserId })).toBeNull();
  });
});
