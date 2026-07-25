import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { PostVisibility } from '@orbit/shared-types';

export class UpdatePostDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(5000) content?: string;
  @IsOptional() @IsIn(['public', 'private']) visibility?: PostVisibility;
}
