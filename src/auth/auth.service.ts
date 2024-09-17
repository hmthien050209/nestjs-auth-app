import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  async validate(
    username: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.users.user({
      username,
    });
    // TODO: implement password verification with bcrypt here
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async signUp(user: User): Promise<User> {
    return this.users.createUser(user);
  }

  // TODO: implement forgot password feature here
  async forgotPassword(username: string): Promise<void> {
    // Send email with reset password link
    console.log(`Sending email to ${username} with reset password link`);
  }
}
