import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('/user/:id')
  async getUser(@Param('id') id: string): Promise<User> {
    try {
      const res = await this.users.user({ id });
      if (res === null) {
        throw new NotFoundException();
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  // TODO: Should only be exposed to Admins
  // @Get('/users')
  // async getUsers(
  //   @Query('skip') skip?: number,
  //   @Query('take') take?: number,
  //   @Query('cursor') cursor?: Prisma.UserWhereUniqueInput,
  //   @Query('where') where?: Prisma.UserWhereInput,
  //   @Query('orderBy') orderBy?: Prisma.UserOrderByWithRelationInput,
  // ): Promise<User[]> {
  //   return this.users.users({ skip, take, cursor, where, orderBy });
  // }

  @Post('/user')
  async createUser(
    @Body() createUserInput: Prisma.UserCreateInput,
  ): Promise<User> {
    try {
      return await this.users.createUser(createUserInput);
    } catch (error) {
      throw error;
    }
  }

  @Put('/user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserInput: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      return await this.users.updateUser({
        where: { id },
        data: updateUserInput,
      });
    } catch (error) {
      throw error;
    }
  }

  @Delete('/user/:id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    try {
      return await this.users.deleteUser({ id });
    } catch (error) {
      throw error;
    }
  }
}
