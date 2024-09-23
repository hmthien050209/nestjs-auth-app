import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  async validate(params: {
    username: string;
    password: string;
  }): Promise<Partial<User>> {
    const { username, password } = params;
    const user = await this.users.user({
      where: { username },
      excludePassword: false,
    });
    if (user === null || !user) {
      // For security reasons, we don't want the attacker to be able to find
      // out if a user is existing or not on the Auth API endpoint. That's
      // should be handled instead by the Users API endpoint, which will be
      // available only for Admins.
      throw new UnauthorizedException();
    } else {
      if (await bcrypt.compare(password, user.password!)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = user;
        return result;
      } else {
        throw new UnauthorizedException();
      }
    }
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
