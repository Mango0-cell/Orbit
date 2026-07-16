import { messageBroker } from './message-broker.js';

describe('messageBroker', () => {
  it('should work', () => {
    expect(messageBroker()).toEqual('message-broker');
  });
});
