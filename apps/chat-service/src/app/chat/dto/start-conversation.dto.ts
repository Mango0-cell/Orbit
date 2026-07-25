import { IsUUID } from 'class-validator';

export class StartConversationDto {
  /** The other participant (a db_users user id). */
  @IsUUID() userId!: string;
}
