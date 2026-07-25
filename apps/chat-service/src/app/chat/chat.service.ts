import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { MessageEntity } from './message.entity';

/** Order a user pair deterministically so each pair maps to exactly one conversation. */
function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversations: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messages: Repository<MessageEntity>,
  ) {}

  async startConversation(
    me: string,
    other: string,
  ): Promise<ConversationEntity> {
    if (me === other) {
      throw new BadRequestException(
        'Cannot start a conversation with yourself',
      );
    }
    const [user_1_id, user_2_id] = orderedPair(me, other);
    const existing = await this.conversations.findOne({
      where: { user_1_id, user_2_id },
    });
    if (existing) return existing;
    return this.conversations.save(
      this.conversations.create({ user_1_id, user_2_id }),
    );
  }

  listConversations(userId: string): Promise<ConversationEntity[]> {
    return this.conversations.find({
      where: [{ user_1_id: userId }, { user_2_id: userId }],
      order: { updated_at: 'DESC' },
    });
  }

  async sendMessage(
    senderId: string,
    conversationId: string,
    body: string,
  ): Promise<MessageEntity> {
    const conversation = await this.requireParticipant(
      senderId,
      conversationId,
    );
    const receiverId =
      conversation.user_1_id === senderId
        ? conversation.user_2_id
        : conversation.user_1_id;
    const message = await this.messages.save(
      this.messages.create({
        conversation_id: conversationId,
        sender_user_id: senderId,
        receiver_user_id: receiverId,
        message_body: body,
      }),
    );
    // Bump the conversation so it sorts to the top of the participant's list.
    conversation.updated_at = new Date();
    await this.conversations.save(conversation);
    return message;
  }

  async listMessages(
    userId: string,
    conversationId: string,
  ): Promise<MessageEntity[]> {
    await this.requireParticipant(userId, conversationId);
    return this.messages.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
    });
  }

  private async requireParticipant(
    userId: string,
    conversationId: string,
  ): Promise<ConversationEntity> {
    const conversation = await this.conversations.findOne({
      where: { conversation_id: conversationId },
    });
    if (!conversation) throw new NotFoundException();
    if (
      conversation.user_1_id !== userId &&
      conversation.user_2_id !== userId
    ) {
      throw new ForbiddenException('Not a participant');
    }
    return conversation;
  }
}
