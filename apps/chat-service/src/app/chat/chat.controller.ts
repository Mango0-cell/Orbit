import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Authenticated, CurrentUser } from '@orbit/nest-common';
import type { AuthUser } from '@orbit/shared-auth';
import type {
  ConversationResponse,
  MessageResponse,
} from '@orbit/shared-types';
import { ChatService } from './chat.service';
import { toConversationResponse, toMessageResponse } from './chat.serializer';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

/** Every route is scoped to the authenticated caller as a conversation participant. */
@Authenticated()
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('conversations')
  async list(@CurrentUser() user: AuthUser): Promise<ConversationResponse[]> {
    const rows = await this.chat.listConversations(user.id);
    return rows.map(toConversationResponse);
  }

  @Post('conversations')
  async start(
    @CurrentUser() user: AuthUser,
    @Body() dto: StartConversationDto,
  ): Promise<ConversationResponse> {
    return toConversationResponse(
      await this.chat.startConversation(user.id, dto.userId),
    );
  }

  @Get('conversations/:id/messages')
  async messages(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<MessageResponse[]> {
    const rows = await this.chat.listMessages(user.id, id);
    return rows.map(toMessageResponse);
  }

  @Post('conversations/:id/messages')
  async send(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponse> {
    return toMessageResponse(
      await this.chat.sendMessage(user.id, id, dto.body),
    );
  }
}
