import { sharedAuth } from './shared-auth.js';

describe('sharedAuth', () => {
  it('should work', () => {
    expect(sharedAuth()).toEqual('shared-auth');
  });
});
