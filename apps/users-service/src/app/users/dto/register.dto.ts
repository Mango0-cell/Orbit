import { IsEmail, IsIn, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @MinLength(8) password!: string;
  @Matches(/^[a-z0-9_]{3,20}$/, { message: 'tagName must be 3-20 chars of a-z, 0-9, _' })
  tagName!: string;
  @IsString() displayName!: string;
  @IsIn(['public', 'private']) accountType!: 'public' | 'private';
}
