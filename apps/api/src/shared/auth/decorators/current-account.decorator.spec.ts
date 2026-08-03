import { ExecutionContext } from '@nestjs/common';
import { currentAccountFactory } from './current-account.decorator';

describe('currentAccountFactory', () => {
  it('extracts accountId from the authenticated request user', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { accountId: 'acc-1' } }),
      }),
    } as unknown as ExecutionContext;

    expect(currentAccountFactory(undefined, ctx)).toBe('acc-1');
  });
});
