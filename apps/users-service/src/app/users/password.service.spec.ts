import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const svc = new PasswordService();

  it('hashes to something other than the plaintext', async () => {
    const hash = await svc.hash('s3cret!!');
    expect(hash).not.toBe('s3cret!!');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('compares correctly', async () => {
    const hash = await svc.hash('s3cret!!');
    expect(await svc.compare('s3cret!!', hash)).toBe(true);
    expect(await svc.compare('wrong', hash)).toBe(false);
  });
});
