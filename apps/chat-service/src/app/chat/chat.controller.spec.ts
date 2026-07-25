import 'reflect-metadata';
import { ChatController } from './chat.controller';

const authed = { id: 'a', accountType: 'public' as const };

describe('ChatController', () => {
  it('start delegates to the service with the caller and target', async () => {
    const chat = {
      startConversation: jest.fn(async () => ({
        conversation_id: 'c1',
        user_1_id: 'a',
        user_2_id: 'b',
        created_at: new Date(),
        updated_at: new Date(),
      })),
    };
    const ctrl = new ChatController(chat as never);
    const res = await ctrl.start(authed, { userId: 'b' });
    expect(chat.startConversation).toHaveBeenCalledWith('a', 'b');
    expect(res.participantIds).toEqual(['a', 'b']);
  });

  it('send delegates to the service and returns the message', async () => {
    const chat = {
      sendMessage: jest.fn(async () => ({
        message_id: 'm1',
        conversation_id: 'c1',
        sender_user_id: 'a',
        receiver_user_id: 'b',
        message_body: 'hi',
        created_at: new Date(),
        updated_at: new Date(),
      })),
    };
    const ctrl = new ChatController(chat as never);
    const res = await ctrl.send(authed, 'c1', { body: 'hi' });
    expect(chat.sendMessage).toHaveBeenCalledWith('a', 'c1', 'hi');
    expect(res.body).toBe('hi');
  });
});
