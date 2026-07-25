import type {
  ConversationResponse,
  MessageResponse,
} from '@orbit/shared-types';
import { ConversationEntity } from './conversation.entity';
import { MessageEntity } from './message.entity';

export function toConversationResponse(
  c: ConversationEntity,
): ConversationResponse {
  return {
    conversationId: c.conversation_id,
    participantIds: [c.user_1_id, c.user_2_id],
    createdAt: c.created_at.toISOString(),
    updatedAt: c.updated_at.toISOString(),
  };
}

export function toMessageResponse(m: MessageEntity): MessageResponse {
  return {
    messageId: m.message_id,
    conversationId: m.conversation_id,
    senderId: m.sender_user_id,
    receiverId: m.receiver_user_id,
    body: m.message_body,
    createdAt: m.created_at.toISOString(),
  };
}
