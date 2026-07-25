import 'reflect-metadata';
import { toConversationResponse, toMessageResponse } from './chat.serializer';
import { ConversationEntity } from './conversation.entity';
import { MessageEntity } from './message.entity';

describe('chat.serializer', () => {
  it('toConversationResponse exposes participants as an ordered tuple', () => {
    const c = Object.assign(new ConversationEntity(), {
      conversation_id: 'c1',
      user_1_id: 'a',
      user_2_id: 'b',
      created_at: new Date('2026-01-01T00:00:00Z'),
      updated_at: new Date('2026-01-02T00:00:00Z'),
    });
    expect(toConversationResponse(c)).toEqual({
      conversationId: 'c1',
      participantIds: ['a', 'b'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });

  it('toMessageResponse maps sender / receiver / body', () => {
    const m = Object.assign(new MessageEntity(), {
      message_id: 'm1',
      conversation_id: 'c1',
      sender_user_id: 'a',
      receiver_user_id: 'b',
      message_body: 'hi',
      created_at: new Date('2026-01-03T00:00:00Z'),
      updated_at: new Date(),
    });
    expect(toMessageResponse(m)).toEqual({
      messageId: 'm1',
      conversationId: 'c1',
      senderId: 'a',
      receiverId: 'b',
      body: 'hi',
      createdAt: '2026-01-03T00:00:00.000Z',
    });
  });
});
