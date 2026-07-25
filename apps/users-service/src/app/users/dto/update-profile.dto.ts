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
