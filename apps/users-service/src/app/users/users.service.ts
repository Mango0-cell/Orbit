import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { PasswordService } from './password.service';
import type { RegisterDto } from './dto/register.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    private readonly passwords: PasswordService,
  ) {}

  async register(dto: RegisterDto): Promise<UserEntity> {
    const existing = await this.repo.findOne({
      where: [{ email: dto.email }, { tag_name: dto.tagName }],
    });
    if (existing) throw new ConflictException('Email or tag already in use');

    const user = this.repo.create({
      email: dto.email,
      password: await this.passwords.hash(dto.password),
      tag_name: dto.tagName,
      display_name: dto.displayName,
      account_type: dto.accountType,
      settings: UserEntity.newSettings(),
    });
    return this.repo.save(user);
  }

  async validateCredentials(email: string, password: string): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { email } });
    if (!user || !(await this.passwords.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  findByIdOrTag(idOrTag: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: [{ user_id: idOrTag }, { tag_name: idOrTag }] });
  }

  async updateOwn(userId: string, dto: UpdateProfileDto): Promise<UserEntity> {
    const patch: Partial<UserEntity> = {
      display_name: dto.displayName,
      bio: dto.bio,
      job: dto.job,
      location: dto.location,
      website_url: dto.websiteUrl,
      profile_photo: dto.profilePhoto,
      genre: dto.genre,
      age: dto.age,
      account_type: dto.accountType,
    };
    for (const key of Object.keys(patch) as (keyof UserEntity)[]) {
      if (patch[key] === undefined) delete patch[key];
    }
    await this.repo.update({ user_id: userId }, patch);
    return this.repo.findOneOrFail({ where: { user_id: userId } });
  }
}
