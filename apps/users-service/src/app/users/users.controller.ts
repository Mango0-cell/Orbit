import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { Authenticated, CurrentAbility, CurrentUser } from '@orbit/nest-common';
import type { AppAbility, AuthUser } from '@orbit/shared-auth';
import type { OwnProfile, UserCard, UserProfile } from '@orbit/shared-types';
import { UsersService } from './users.service';
import { serializeProfileFor, toOwnProfile } from './user.serializer';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Authenticated()
  @Get('me')
  async me(@CurrentUser() user: AuthUser): Promise<OwnProfile> {
    const entity = await this.users.findByIdOrTag(user.id);
    if (!entity) throw new NotFoundException();
    return toOwnProfile(entity);
  }

  @Authenticated()
  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<OwnProfile> {
    return toOwnProfile(await this.users.updateOwn(user.id, dto));
  }

  // Declared after `me` so GET /users/me is not captured by this param route.
  @Get(':idOrTag')
  async getOne(
    @Param('idOrTag') idOrTag: string,
    @CurrentUser() viewer: AuthUser | null,
    @CurrentAbility() ability: AppAbility,
  ): Promise<UserProfile | UserCard> {
    const entity = await this.users.findByIdOrTag(idOrTag);
    if (!entity) throw new NotFoundException();
    return serializeProfileFor(entity, viewer?.id ?? null, ability);
  }
}
