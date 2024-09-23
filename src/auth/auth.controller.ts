import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { User } from '@prisma/client';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @HttpCode(200)
  @Post('/validate')
  async validate(
    @Body() params: { username: string; password: string },
  ): Promise<Partial<User>> {
    return await this.auth.validate(params);
  }
}
