# Users & Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the identity foundation in `users-service` — register, login (JWT issuance), and profile read/update under the CASL Profile policy.

**Architecture:** One NestJS service (`users-service`) owning `db_users` via TypeORM. Auth issues a JWT signed with `JWT_SECRET` (verified by `@orbit/nest-common`'s guards). Profile reads apply the CASL policy from `@orbit/shared-auth` with field-level serialization. Domain events published to RabbitMQ for later consumers.

**Tech Stack:** NestJS 11, TypeORM + pg, bcrypt, jsonwebtoken, class-validator, `@orbit/shared-auth` (CASL), `@orbit/nest-common` (guards/pipes/filters), `@orbit/message-broker`.

## Global Constraints
- **Database per service:** `users-service` touches only `db_users`. No cross-DB access.
- **English only.** Strict TypeScript. Run everything through Nx (`npx nx ...`).
- **Password** is a bcrypt hash, never returned in any DTO. `email` returned only from `/me`.
- **Subjects built from server data only** — never trust client-supplied `relationship`/`accountType`.
- **Contracts** (output/event types) live in `@orbit/shared-types`; input DTOs live in the service.
- **Do not push.** Commit per task.
- **Nodenext ESM libs** (`shared-types`, `nest-common`) use `.js` import extensions; the CommonJS `users-service` app uses extensionless imports.

---

### Task 1: Shared output + event contracts

**Files:**
- Create: `libs/shared-types/src/lib/users.ts`
- Create: `libs/shared-types/src/lib/events.ts`
- Modify: `libs/shared-types/src/index.ts`

**Interfaces:**
- Produces: `UserCard`, `UserProfile`, `OwnProfile`, `AuthResponse`, `UserCreatedEvent`, `UserProfileUpdatedEvent`, and event-name constants `USER_EVENTS`.

- [ ] **Step 1: Write the contracts**

`libs/shared-types/src/lib/users.ts`:
```ts
import type { AccountType, PrivateSettings } from '@orbit/shared-auth';

/** Minimal, always-public view of a user (the "card"). */
export interface UserCard {
  userId: string;
  tagName: string;
  displayName: string;
  avatarUrl: string | null;
  accountType: AccountType;
}

/** Full public profile (returned when the viewer is allowed to see it). */
export interface UserProfile extends UserCard {
  bio: string | null;
  job: string | null;
  location: string | null;
  websiteUrl: string | null;
  genre: string | null;
  age: number | null;
  createdAt: string;
}

/** The caller's own profile — adds private fields. */
export interface OwnProfile extends UserProfile {
  email: string;
  settings: PrivateSettings;
}

export interface AuthResponse {
  accessToken: string;
  user: OwnProfile;
}
```

`libs/shared-types/src/lib/events.ts`:
```ts
import type { AccountType } from '@orbit/shared-auth';

export const USER_EVENTS = {
  created: 'user.created',
  profileUpdated: 'user.profile.updated',
} as const;

export interface UserCreatedEvent {
  userId: string;
  tagName: string;
  accountType: AccountType;
  at: string;
}

export interface UserProfileUpdatedEvent {
  userId: string;
  changedFields: string[];
  at: string;
}
```

Add to `libs/shared-types/src/index.ts`:
```ts
export * from './lib/users.js';
export * from './lib/events.js';
```

- [ ] **Step 2: Add the `@orbit/shared-auth` dependency to shared-types**

Edit `libs/shared-types/package.json` dependencies, add `"@orbit/shared-auth": "*"`, then:
```bash
npx nx sync
```
Expected: references updated; "workspace is up to date" on re-run.

- [ ] **Step 3: Typecheck (the gate for a types-only lib)**

Run: `npx nx typecheck @orbit/shared-types --skip-nx-cache`
Expected: PASS (0 errors).

- [ ] **Step 4: Commit**

```bash
git add libs/shared-types
git commit -m "feat(shared-types): user & identity output and event contracts"
```

---

### Task 2: `signJwt` in `@orbit/nest-common`

**Files:**
- Modify: `libs/nest-common/src/lib/auth/jwt.ts`
- Modify: `libs/nest-common/src/lib/auth/auth.spec.ts`

**Interfaces:**
- Produces: `signJwt(user: AuthUser, secret: string, expiresIn?: string | number): string`.

- [ ] **Step 1: Write the failing test** in `auth.spec.ts` (add to the `verifyJwt` describe area)

```ts
import { signJwt } from './jwt';

describe('signJwt', () => {
  it('round-trips through verifyJwt', () => {
    const token = signJwt({ id: 'u1', accountType: 'private' }, 'test-secret');
    expect(verifyJwt(token, 'test-secret')).toEqual({ id: 'u1', accountType: 'private' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx test @orbit/nest-common --skip-nx-cache`
Expected: FAIL — `signJwt is not a function`.

- [ ] **Step 3: Implement `signJwt`** in `jwt.ts` (add below `verifyJwt`)

```ts
import { sign, verify } from 'jsonwebtoken';
// ...
export function signJwt(
  user: AuthUser,
  secret: string,
  expiresIn: string | number = '1h',
): string {
  const payload: JwtPayload = { sub: user.id, accountType: user.accountType };
  return sign(payload, secret, { expiresIn });
}
```
(Change the existing `import { verify }` line to `import { sign, verify }`.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx run-many -t test typecheck -p @orbit/nest-common --skip-nx-cache`
Expected: PASS (20 tests).

- [ ] **Step 5: Commit**

```bash
git add libs/nest-common
git commit -m "feat(nest-common): add signJwt (symmetric with verifyJwt)"
```

---

### Task 3: TypeORM + `USERS` entity + migration

**Files:**
- Modify: `apps/users-service/package.json` (deps), root `package.json` (typeorm/pg)
- Create: `apps/users-service/src/app/database/database.module.ts`
- Create: `apps/users-service/src/app/users/user.entity.ts`
- Create: `apps/users-service/src/data-source.ts`
- Create: `apps/users-service/src/migrations/<timestamp>-CreateUsers.ts`
- Modify: `apps/users-service/src/app/app.module.ts`

**Interfaces:**
- Produces: `UserEntity` (TypeORM), `DatabaseModule`, a `USER_REPOSITORY` via `TypeOrmModule.forFeature([UserEntity])`.

- [ ] **Step 1: Install deps**

```bash
export npm_config_cache=/tmp/orbit-npm-cache
npm install @nestjs/typeorm typeorm pg bcrypt -w @orbit/users-service
npm install -D @types/bcrypt -w @orbit/users-service
```

- [ ] **Step 2: Write the entity** `apps/users-service/src/app/users/user.entity.ts`

```ts
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { AccountType, PrivateSettings } from '@orbit/shared-auth';
import { defaultPrivateSettings } from '@orbit/shared-auth';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') user_id!: string;
  @Index({ unique: true }) @Column() email!: string;
  @Column() password!: string;
  @Index({ unique: true }) @Column() tag_name!: string;
  @Column() display_name!: string;
  @Column({ type: 'varchar', nullable: true }) bio!: string | null;
  @Column({ type: 'varchar', nullable: true }) job!: string | null;
  @Column({ type: 'varchar', nullable: true }) location!: string | null;
  @Column({ type: 'varchar', nullable: true }) website_url!: string | null;
  @Column({ type: 'varchar', nullable: true }) profile_photo!: string | null;
  @Column({ type: 'varchar', nullable: true }) genre!: string | null;
  @Column({ type: 'int', nullable: true }) age!: number | null;
  @Column({ type: 'varchar', default: 'public' }) account_type!: AccountType;
  @Column({ type: 'jsonb', default: () => "'{}'" }) settings!: PrivateSettings;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updated_at!: Date;

  static newSettings(accountType: AccountType): PrivateSettings {
    return accountType === 'private' ? defaultPrivateSettings() : defaultPrivateSettings();
  }
}
```

- [ ] **Step 3: Wire TypeORM** `apps/users-service/src/app/database/database.module.ts`

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL ?? 'postgres://orbit:orbit@localhost:5432/db_users',
      entities: [UserEntity],
      migrationsRun: false,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
```
Add `DatabaseModule` to `AppModule` imports (alongside `OrbitCommonModule.forRoot()`).

- [ ] **Step 4: Data source + migration** `apps/users-service/src/data-source.ts`

```ts
import { DataSource } from 'typeorm';
import { UserEntity } from './app/users/user.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgres://orbit:orbit@localhost:5432/db_users',
  entities: [UserEntity],
  migrations: ['apps/users-service/src/migrations/*.ts'],
});
```
Generate the migration (Postgres must be up: `docker compose up -d postgres`):
```bash
npx typeorm migration:generate apps/users-service/src/migrations/CreateUsers -d apps/users-service/src/data-source.ts
```

- [ ] **Step 5: Run the migration + verify the table**

```bash
npx typeorm migration:run -d apps/users-service/src/data-source.ts
docker compose exec postgres psql -U orbit -d db_users -c '\d users'
```
Expected: `users` table with the columns above; unique indexes on `email`, `tag_name`.

- [ ] **Step 6: Typecheck + commit**

```bash
npx nx sync && npx nx typecheck @orbit/users-service --skip-nx-cache
git add apps/users-service package.json package-lock.json
git commit -m "feat(users-service): TypeORM USERS entity, db_users wiring, migration"
```

---

### Task 4: Password hashing + credential helpers

**Files:**
- Create: `apps/users-service/src/app/users/password.service.ts`
- Create: `apps/users-service/src/app/users/password.service.spec.ts`

**Interfaces:**
- Produces: `PasswordService.hash(plain): Promise<string>`, `PasswordService.compare(plain, hash): Promise<boolean>`.

- [ ] **Step 1: Write the failing test** `password.service.spec.ts`

```ts
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const svc = new PasswordService();
  it('hashes to something other than the plaintext', async () => {
    const hash = await svc.hash('s3cret!!');
    expect(hash).not.toBe('s3cret!!');
    expect(hash.length).toBeGreaterThan(20);
  });
  it('compares correctly', async () => {
    const hash = await svc.hash('s3cret!!');
    expect(await svc.compare('s3cret!!', hash)).toBe(true);
    expect(await svc.compare('wrong', hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx nx test @orbit/users-service --skip-nx-cache`
Expected: FAIL — cannot find `./password.service`.

- [ ] **Step 3: Implement** `password.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly rounds = 12;
  hash(plain: string): Promise<string> {
    return hash(plain, this.rounds);
  }
  compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}
```

- [ ] **Step 4: Run + commit**

Run: `npx nx test @orbit/users-service --skip-nx-cache` → PASS.
```bash
git add apps/users-service/src/app/users/password.service.ts apps/users-service/src/app/users/password.service.spec.ts
git commit -m "feat(users-service): bcrypt PasswordService"
```

---

### Task 5: Users repository/service + DTOs + serializer

**Files:**
- Create: `apps/users-service/src/app/users/dto/register.dto.ts`, `login.dto.ts`, `update-profile.dto.ts`
- Create: `apps/users-service/src/app/users/user.serializer.ts`
- Create: `apps/users-service/src/app/users/users.service.ts`
- Create: `apps/users-service/src/app/users/users.service.spec.ts`

**Interfaces:**
- Consumes: `UserEntity`, `PasswordService`, `UserCard`/`UserProfile`/`OwnProfile` (shared-types).
- Produces: `UsersService.register`, `.validateCredentials`, `.findByIdOrTag`, `.updateOwn`; `toOwnProfile`, `toProfileSubject`, `serializeProfileFor`.

- [ ] **Step 1: DTOs** (class-validator)

`register.dto.ts`:
```ts
import { IsEmail, IsIn, IsString, Matches, MinLength } from 'class-validator';
export class RegisterDto {
  @IsEmail() email!: string;
  @MinLength(8) password!: string;
  @Matches(/^[a-z0-9_]{3,20}$/) tagName!: string;
  @IsString() displayName!: string;
  @IsIn(['public', 'private']) accountType!: 'public' | 'private';
}
```
`login.dto.ts`:
```ts
import { IsEmail, IsString } from 'class-validator';
export class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}
```
`update-profile.dto.ts`:
```ts
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class UpdateProfileDto {
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() job?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() websiteUrl?: string;
  @IsOptional() @IsString() profilePhoto?: string;
  @IsOptional() @IsString() genre?: string;
  @IsOptional() @IsInt() @Min(13) @Max(120) age?: number;
  @IsOptional() @IsIn(['public', 'private']) accountType?: 'public' | 'private';
}
```

- [ ] **Step 2: Serializer** `user.serializer.ts` (maps entity → contracts + builds the CASL subject + field-level serialization)

```ts
import { permittedFieldsOf } from '@casl/ability/extra';
import { asProfile, type AppAbility, type Relationship } from '@orbit/shared-auth';
import type { OwnProfile, UserCard, UserProfile } from '@orbit/shared-types';
import { UserEntity } from './user.entity';

export function toOwnProfile(u: UserEntity): OwnProfile {
  return { ...toProfile(u), email: u.email, settings: u.settings };
}
function toProfile(u: UserEntity): UserProfile {
  return {
    userId: u.user_id, tagName: u.tag_name, displayName: u.display_name,
    avatarUrl: u.profile_photo, accountType: u.account_type,
    bio: u.bio, job: u.job, location: u.location, websiteUrl: u.website_url,
    genre: u.genre, age: u.age, createdAt: u.created_at.toISOString(),
  };
}

/** Serialize a target user for a viewer, honoring the CASL Profile field-level policy. */
export function serializeProfileFor(
  target: UserEntity, viewerId: string | null, ability: AppAbility,
): UserProfile | UserCard {
  const relationship: Relationship = viewerId === target.user_id ? 'friend' : 'none';
  const subject = asProfile({
    ownerId: target.user_id, accountType: target.account_type, relationship,
    username: target.tag_name, displayName: target.display_name,
    avatarUrl: target.profile_photo ?? undefined, bio: target.bio ?? undefined,
    settings: target.settings,
  });
  const full = toProfile(target);
  // If the viewer can read a full-profile field (e.g. bio), return the full profile.
  if (ability.can('read', subject, 'bio') || viewerId === target.user_id) return full;
  const card: UserCard = {
    userId: full.userId, tagName: full.tagName, displayName: full.displayName,
    avatarUrl: full.avatarUrl, accountType: full.accountType,
  };
  return card;
}
```
> Note: `viewerId === owner` maps to the own-profile rule (full read). `permittedFieldsOf` is available for finer field filtering later; the `can('read', subject, 'bio')` check is the card-vs-full decision here.

- [ ] **Step 3: Write failing service tests** `users.service.spec.ts`

```ts
import { defineAbilitiesFor } from '@orbit/shared-auth';
import { serializeProfileFor } from './user.serializer';
import { UserEntity } from './user.entity';

function entity(over: Partial<UserEntity> = {}): UserEntity {
  return Object.assign(new UserEntity(), {
    user_id: 'o1', email: 'o@x.io', password: 'h', tag_name: 'owner', display_name: 'Owner',
    bio: 'secret', job: null, location: null, website_url: null, profile_photo: null,
    genre: null, age: null, account_type: 'public', settings: {}, created_at: new Date(),
    updated_at: new Date(),
  }, over);
}

describe('serializeProfileFor', () => {
  it('returns the full profile for a public account', () => {
    const out = serializeProfileFor(entity({ account_type: 'public' }), 'v1', defineAbilitiesFor({ id: 'v1', accountType: 'public' }));
    expect((out as { bio?: string }).bio).toBe('secret');
  });
  it('returns only the card for a private account viewed by a stranger', () => {
    const out = serializeProfileFor(entity({ account_type: 'private' }), 'v1', defineAbilitiesFor({ id: 'v1', accountType: 'public' }));
    expect((out as { bio?: string }).bio).toBeUndefined();
    expect(out.tagName).toBe('owner');
  });
  it('returns the full profile to the owner even if private', () => {
    const out = serializeProfileFor(entity({ account_type: 'private' }), 'o1', defineAbilitiesFor({ id: 'o1', accountType: 'private' }));
    expect((out as { bio?: string }).bio).toBe('secret');
  });
});
```

- [ ] **Step 4: Implement `UsersService`** `users.service.ts`

```ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
    if (await this.repo.findOne({ where: [{ email: dto.email }, { tag_name: dto.tagName }] })) {
      throw new ConflictException('Email or tag already in use');
    }
    const user = this.repo.create({
      email: dto.email, password: await this.passwords.hash(dto.password),
      tag_name: dto.tagName, display_name: dto.displayName, account_type: dto.accountType,
      settings: UserEntity.newSettings(dto.accountType),
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
      display_name: dto.displayName, bio: dto.bio, job: dto.job, location: dto.location,
      website_url: dto.websiteUrl, profile_photo: dto.profilePhoto, genre: dto.genre,
      age: dto.age, account_type: dto.accountType,
    };
    Object.keys(patch).forEach((k) => (patch as Record<string, unknown>)[k] === undefined && delete (patch as Record<string, unknown>)[k]);
    await this.repo.update({ user_id: userId }, patch);
    return this.repo.findOneOrFail({ where: { user_id: userId } });
  }
}
```

- [ ] **Step 5: Run tests + commit**

Run: `npx nx test @orbit/users-service --skip-nx-cache` → PASS.
```bash
git add apps/users-service/src/app/users
git commit -m "feat(users-service): users service, DTOs, and policy-aware serializer"
```

---

### Task 6: Auth + Profile controllers (guards + policy applied)

**Files:**
- Create: `apps/users-service/src/app/users/auth.controller.ts`
- Create: `apps/users-service/src/app/users/users.controller.ts`
- Create: `apps/users-service/src/app/users/users.module.ts`
- Create: `apps/users-service/src/app/users/auth.controller.spec.ts`
- Modify: `apps/users-service/src/app/app.module.ts` (import `UsersModule`; drop the sample `AppController/AppService`)

**Interfaces:**
- Consumes: `UsersService`, `signJwt`, `@Public`/`@Authenticated`/`@CurrentUser`/`@CurrentAbility` (nest-common), `toOwnProfile`/`serializeProfileFor`.
- Produces: routes from the endpoints table.

- [ ] **Step 1: Auth controller** `auth.controller.ts`

```ts
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Public, JWT_SECRET_TOKEN, signJwt } from '@orbit/nest-common';
import type { AuthResponse } from '@orbit/shared-types';
import { UsersService } from './users.service';
import { toOwnProfile } from './user.serializer';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly users: UsersService,
    @Inject(JWT_SECRET_TOKEN) private readonly secret: string,
  ) {}

  @Public() @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    const user = await this.users.register(dto);
    return this.authResponse(user);
  }

  @Public() @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.validateCredentials(dto.email, dto.password);
    return this.authResponse(user);
  }

  private authResponse(user: import('./user.entity').UserEntity): AuthResponse {
    const accessToken = signJwt({ id: user.user_id, accountType: user.account_type }, this.secret);
    return { accessToken, user: toOwnProfile(user) };
  }
}
```

- [ ] **Step 2: Users/Profile controller** `users.controller.ts`

```ts
import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { Authenticated, CurrentAbility, CurrentUser } from '@orbit/nest-common';
import type { AppAbility, AuthUser } from '@orbit/shared-auth';
import type { OwnProfile, UserCard, UserProfile } from '@orbit/shared-types';
import { UsersService } from './users.service';
import { serializeProfileFor, toOwnProfile } from './user.serializer';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Authenticated() @Get('me')
  async me(@CurrentUser() user: AuthUser): Promise<OwnProfile> {
    const entity = await this.users.findByIdOrTag(user.id);
    if (!entity) throw new NotFoundException();
    return toOwnProfile(entity);
  }

  @Authenticated() @Patch('me')
  async updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto): Promise<OwnProfile> {
    return toOwnProfile(await this.users.updateOwn(user.id, dto));
  }

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
```

- [ ] **Step 3: Module + wire into AppModule** `users.module.ts`

```ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PasswordService } from './password.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController, UsersController],
  providers: [UsersService, PasswordService],
})
export class UsersModule {}
```
`app.module.ts` → `imports: [OrbitCommonModule.forRoot(), UsersModule]`; remove `AppController`/`AppService` and their files.

- [ ] **Step 4: Controller test (mocked service)** `auth.controller.spec.ts`

```ts
import { AuthController } from './auth.controller';
import { UserEntity } from './user.entity';

describe('AuthController', () => {
  const entity = Object.assign(new UserEntity(), {
    user_id: 'u1', email: 'a@b.io', tag_name: 't', display_name: 'A', account_type: 'public',
    settings: {}, profile_photo: null, bio: null, job: null, location: null, website_url: null,
    genre: null, age: null, created_at: new Date(),
  });
  const users = { register: jest.fn().mockResolvedValue(entity), validateCredentials: jest.fn().mockResolvedValue(entity) };
  const ctrl = new AuthController(users as never, 'secret');

  it('register returns a token + own profile', async () => {
    const res = await ctrl.register({ email: 'a@b.io', password: 'password1', tagName: 't', displayName: 'A', accountType: 'public' });
    expect(res.accessToken).toEqual(expect.any(String));
    expect(res.user.email).toBe('a@b.io');
  });
  it('login delegates to validateCredentials', async () => {
    await ctrl.login({ email: 'a@b.io', password: 'password1' });
    expect(users.validateCredentials).toHaveBeenCalledWith('a@b.io', 'password1');
  });
});
```

- [ ] **Step 5: Run + commit**

Run: `npx nx run-many -t test typecheck lint -p @orbit/users-service --skip-nx-cache` → PASS.
```bash
git add apps/users-service
git commit -m "feat(users-service): auth + profile controllers with guards and CASL policy"
```

---

### Task 7: Publish domain events

**Files:**
- Modify: `libs/message-broker/src/lib/message-broker.ts` (publish helper + exchange constant) and its index
- Create: `apps/users-service/src/app/events/user-events.publisher.ts`
- Modify: `apps/users-service/src/app/users/users.service.ts` (publish after commit)
- Create: `apps/users-service/src/app/events/user-events.publisher.spec.ts`

**Interfaces:**
- Consumes: `USER_EVENTS`, `UserCreatedEvent`, `UserProfileUpdatedEvent` (shared-types).
- Produces: `UserEventsPublisher.created(user)`, `.profileUpdated(userId, changedFields)`.

- [ ] **Step 1: Broker publish helper** in `libs/message-broker/src/lib/message-broker.ts`

```ts
export const ORBIT_EXCHANGE = 'orbit.events';

export interface DomainEventPublisher {
  publish(routingKey: string, payload: unknown): Promise<void>;
}
```
(Concrete amqp connection is wired in the deployment/broker phase; services depend on this interface. Export it from `libs/message-broker/src/index.ts`.)

- [ ] **Step 2: Failing test** `user-events.publisher.spec.ts`

```ts
import { USER_EVENTS } from '@orbit/shared-types';
import { UserEventsPublisher } from './user-events.publisher';

describe('UserEventsPublisher', () => {
  const bus = { publish: jest.fn().mockResolvedValue(undefined) };
  const pub = new UserEventsPublisher(bus as never);
  it('publishes user.created with the right payload', async () => {
    await pub.created({ user_id: 'u1', tag_name: 't', account_type: 'public' } as never);
    expect(bus.publish).toHaveBeenCalledWith(USER_EVENTS.created, expect.objectContaining({ userId: 'u1', tagName: 't', accountType: 'public' }));
  });
});
```

- [ ] **Step 3: Implement** `user-events.publisher.ts`

```ts
import { Inject, Injectable } from '@nestjs/common';
import { USER_EVENTS, type UserCreatedEvent, type UserProfileUpdatedEvent } from '@orbit/shared-types';
import { type DomainEventPublisher } from '@orbit/message-broker';
import type { UserEntity } from '../users/user.entity';

export const EVENT_BUS = Symbol('ORBIT_EVENT_BUS');

@Injectable()
export class UserEventsPublisher {
  constructor(@Inject(EVENT_BUS) private readonly bus: DomainEventPublisher) {}
  created(u: UserEntity): Promise<void> {
    const e: UserCreatedEvent = { userId: u.user_id, tagName: u.tag_name, accountType: u.account_type, at: new Date().toISOString() };
    return this.bus.publish(USER_EVENTS.created, e);
  }
  profileUpdated(userId: string, changedFields: string[]): Promise<void> {
    const e: UserProfileUpdatedEvent = { userId, changedFields, at: new Date().toISOString() };
    return this.bus.publish(USER_EVENTS.profileUpdated, e);
  }
}
```
Provide a no-op `EVENT_BUS` in `UsersModule` for now (`{ provide: EVENT_BUS, useValue: { publish: async () => undefined } }`) and inject `UserEventsPublisher` into `UsersService`; call `created`/`profileUpdated` after `save`/`update`. The real amqp bus lands in the broker phase.

- [ ] **Step 4: Run + commit**

Run: `npx nx run-many -t test typecheck lint -p @orbit/users-service @orbit/message-broker --skip-nx-cache` → PASS.
```bash
git add libs/message-broker apps/users-service
git commit -m "feat(users-service): publish user.created / user.profile.updated events"
```

---

### Task 8: Full verification gate

- [ ] **Step 1: Affected build/test/lint**

Run: `npx nx affected -t build test lint typecheck --base=HEAD~7 --skip-nx-cache`
Expected: all green.

- [ ] **Step 2: Manual smoke (optional, Postgres + service up)**

```bash
docker compose up -d postgres
JWT_SECRET=dev-secret npx nx serve users-service
# register → returns { accessToken, user }
curl -s localhost:3001/api/auth/register -H 'content-type: application/json' \
  -d '{"email":"a@b.io","password":"password1","tagName":"alice","displayName":"Alice","accountType":"private"}'
```
Expected: `{ "data": { "accessToken": "...", "user": { ... } }, "meta": { ... } }` (envelope from the interceptor).

- [ ] **Step 3: Done** — hand off to the human to push.

---

## Self-review notes
- **Spec coverage:** register/login/me/update/get-by-id → Tasks 5-6; entity+migration → Task 3; hashing → Task 4; JWT issuance → Task 2; policy field-level serialization → Task 5; events → Task 7. ✓
- **Types consistent:** `AuthResponse`/`OwnProfile`/`UserCard`/`UserProfile` used identically across serializer, controllers, and contracts; `signJwt(AuthUser,...)` matches nest-common. ✓
- **Out of scope respected:** no follow/relationship (fixed `none`/owner), no gRPC, no frontend. ✓
