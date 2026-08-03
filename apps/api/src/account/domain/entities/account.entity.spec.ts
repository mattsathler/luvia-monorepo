import { Account } from './account.entity';

describe('Account.create', () => {
  it('normalizes the email (trim + lowercase) and sets createdAt', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const account = Account.create({ email: '  Ana@Example.com  ', passwordHash: 'hash' }, 'acc-1', now);

    expect(account.email).toBe('ana@example.com');
    expect(account.passwordHash).toBe('hash');
    expect(account.createdAt).toEqual(now);
    expect(account.id).toBe('acc-1');
  });
});
