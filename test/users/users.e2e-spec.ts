import { faker } from '@faker-js/faker';
import { createMock } from '@golevelup/ts-vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import request from 'supertest';

describe('Users', () => {
  let app: INestApplication;
  let createdUsername: string;
  let createdUserId: string;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [PrismaService, UsersService],
    })
      .useMocker(() => createMock<UsersService>())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST /users/user', async () => {
    const newUser: Prisma.UserCreateInput = {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: await bcrypt.hash(faker.internet.password({ length: 10 }), 10),
      avatarUrl: faker.internet.url(),
      role: 'USER',
    };
    const res = await request(app.getHttpServer())
      .post('/users/user')
      .send(newUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    createdUsername = res.body.username;
    createdUserId = res.body.id;
  });

  it('/POST /users/user should fail with duplicated user', async () => {
    const newUser: Prisma.UserCreateInput = {
      email: faker.internet.email(),
      username: createdUsername,
      password: await bcrypt.hash(faker.internet.password({ length: 10 }), 10),
      avatarUrl: faker.internet.url(),
      role: 'USER',
    };
    const res = await request(app.getHttpServer())
      .post('/users/user')
      .send(newUser);
    expect(res.statusCode).toBe(400);
  });

  it('/GET /users/user', async () => {
    const res = await request(app.getHttpServer()).get(
      `/users/user/${createdUserId}`,
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdUserId);
  });

  it('/PUT /users/user', async () => {
    const url = faker.internet.url();
    const res = await request(app.getHttpServer())
      .put(`/users/user/${createdUserId}`)
      .send({ avatarUrl: url } satisfies Prisma.UserUpdateInput);
    expect(res.statusCode).toBe(200);
    expect(res.body.avatarUrl).toBe(url);
  });

  it('/DELETE /users/user', async () => {
    const deleteRes = await request(app.getHttpServer()).delete(
      `/users/user/${createdUserId}`,
    );
    expect(deleteRes.statusCode).toBe(200);
    // refetch the user's data
    const getRes = await request(app.getHttpServer()).get(
      `/users/user/${createdUserId}`,
    );
    expect(getRes.statusCode).toBe(404);
  });
});
