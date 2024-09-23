import { createMock } from '@golevelup/ts-vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import request from 'supertest';

describe('Auth', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let createdUserId: string;
  let createdUsername: string;
  let createdUserPassword: string;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .useMocker(() => createMock<PrismaService>())
      .useMocker(() => createMock<UsersService>())
      .compile();

    app = moduleRef.createNestApplication();
    usersService = moduleRef.get<UsersService>(UsersService);
    await app.init();
  });

  it('/POST /auth/validate', async () => {
    // Create a new user
    createdUsername = 'testUsername';
    createdUserPassword = 'testPassword';
    const newUser = await usersService.createUser({
      email: 'testUser@example.com',
      username: createdUsername,
      password: createdUserPassword,
      avatarUrl: 'https://example.com/testUser.jpg',
      role: 'USER',
    });
    createdUserId = newUser.id;

    // Validate the user
    // It's post so the status code should be 201 instead of the default 200
    const res = await request(app.getHttpServer())
      .post('/auth/validate')
      .send({ username: createdUsername, password: createdUserPassword });
    expect(res.statusCode).toBe(201);
  });

  it('/POST /auth/validate should return 401 with wrong credentials', async () => {
    // Wrong password
    let res = await request(app.getHttpServer())
      .post('/auth/validate')
      .send({ username: createdUsername, password: 'wrongPassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Unauthorized');

    res = await request(app.getHttpServer())
      .post('/auth/validate')
      .send({ username: 'wrongUsername', password: 'wrongPassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  afterAll(async () => {
    // Delete the create user
    await usersService.deleteUser({ id: createdUserId });
    await app.close();
  });
});
