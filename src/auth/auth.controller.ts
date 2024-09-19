import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('/validate')
  async validate(
    @Body() params: { username: string; password: string },
  ): Promise<Partial<User>> {
    return await this.auth.validate(params);
  }
}
