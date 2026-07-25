import 'reflect-metadata';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConversationEntity } from './conversation.entity';

function conv(over: Partial<ConversationEntity> = {}): ConversationEntity {
  return Object.assign(
    new ConversationEntity(),
    {
      conversation_id: 'c1',
      user_1_id: 'a',
      user_2_id: 'b',
      created_at: new Date(),
      updated_at: new Date(),
    },
    over,
  );
}

function make(
  convOver: Record<string, unknown> = {},
  msgOver: Record<string, unknown> = {},
) {
  const conversations = {
    findOne: jest.fn(),
    find: jest.fn(async () => []),
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({
      ...x,
      conversation_id: x.conversation_id ?? 'c1',
    })),
    ...convOver,
  };
  const messages = {
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ ...x, message_id: 'm1' })),
    find: jest.fn(async () => []),
    ...msgOver,
  };
  const service = new ChatService(conversations as never, messages as never);
  return { service, conversations, messages };
}

describe('ChatService', () => {
  it('startConversation rejects messaging yourself', async () => {
    const { service } = make();
    await expect(service.startConversation('me', 'me')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('startConversation orders the pair deterministically and creates when absent', async () => {
    const { service, conversations } = make({
      findOne: jest.fn(async () => null),
    });
    await service.startConversation('zeb', 'amy'); // 'amy' < 'zeb'
    expect(conversations.create).toHaveBeenCalledWith({
      user_1_id: 'amy',
      user_2_id: 'zeb',
    });
  });

  it('startConversation reuses an existing conversation', async () => {
    const existing = conv();
    const { service, conversations } = make({
      findOne: jest.fn(async () => existing),
    });
    const out = await service.startConversation('a', 'b');
    expect(out).toBe(existing);
    expect(conversations.create).not.toHaveBeenCalled();
  });

  it('sendMessage sets the receiver to the other participant and bumps the conversation', async () => {
    const { service, conversations, messages } = make({
      findOne: jest.fn(async () => conv({ user_1_id: 'a', user_2_id: 'b' })),
    });
    await service.sendMessage('a', 'c1', 'hi');
    expect(messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: 'c1',
        sender_user_id: 'a',
        receiver_user_id: 'b',
        message_body: 'hi',
      }),
    );
    expect(conversations.save).toHaveBeenCalled();
  });

  it('sendMessage rejects a non-participant with 403', async () => {
    const { service } = make({
      findOne: jest.fn(async () => conv({ user_1_id: 'a', user_2_id: 'b' })),
    });
    await expect(
      service.sendMessage('intruder', 'c1', 'hi'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
