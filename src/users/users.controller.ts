import { Controller } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
  ) {}
  // TODO: TBI
}
