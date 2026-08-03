import { BcryptPasswordHasher } from './bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  it('hashes a password and round-trips compare() correctly', async () => {
    const hasher = new BcryptPasswordHasher();

    const hash = await hasher.hash('correct-password');

    expect(hash).not.toBe('correct-password');
    await expect(hasher.compare('correct-password', hash)).resolves.toBe(true);
    await expect(hasher.compare('wrong-password', hash)).resolves.toBe(false);
  });
});
