import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async user(params: {
    where: Prisma.UserWhereUniqueInput;
    excludePassword: boolean;
  }): Promise<Partial<User> | null> {
    const { where, excludePassword } = params;
    const res = await this.prisma.user.findUnique({
      where,
    });

    if (res === null) {
      return null;
    }

    if (excludePassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = res;
      return result;
    }
    return res;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    try {
      return this.prisma.user.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } catch {
      throw new BadRequestException('Invalid input');
    }
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const { password, ..._data } = data;
      return await this.prisma.user.create({
        data: {
          ..._data,
          password: await bcrypt.hash(password, 10),
        },
      });
    } catch {
      throw new BadRequestException('Invalid input');
    }
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    try {
      return await this.prisma.user.update({
        where,
        data,
      });
    } catch {
      throw new BadRequestException('Invalid input');
    }
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    try {
      return this.prisma.user.delete({ where });
    } catch {
      throw new BadRequestException('Invalid input');
    }
  }
}
