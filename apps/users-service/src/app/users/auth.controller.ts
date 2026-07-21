import { Body, Controller, Inject, Post } from '@nestjs/common';
import { JWT_SECRET_TOKEN, Public, signJwt } from '@orbit/nest-common';
import type { AuthResponse } from '@orbit/shared-types';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { toOwnProfile } from './user.serializer';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly users: UsersService,
    @Inject(JWT_SECRET_TOKEN) private readonly secret: string,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authResponse(await this.users.register(dto));
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authResponse(
      await this.users.validateCredentials(dto.email, dto.password),
    );
  }

  private authResponse(user: UserEntity): AuthResponse {
    const accessToken = signJwt(
      { id: user.user_id, accountType: user.account_type },
      this.secret,
    );
    return { accessToken, user: toOwnProfile(user) };
  }
}
