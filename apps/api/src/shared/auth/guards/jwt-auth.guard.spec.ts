import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

function contextStub(): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  it('allows the request through when the route is marked @Public()', () => {
    const reflector = { getAllAndOverride: jest.fn(() => true) } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate');

    expect(guard.canActivate(contextStub())).toBe(true);
    expect(superCanActivateSpy).not.toHaveBeenCalled();

    superCanActivateSpy.mockRestore();
  });

  it('delegates to the JWT strategy when the route is not public', () => {
    const reflector = { getAllAndOverride: jest.fn(() => false) } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    const superCanActivateSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    expect(guard.canActivate(contextStub())).toBe(true);
    expect(superCanActivateSpy).toHaveBeenCalled();

    superCanActivateSpy.mockRestore();
  });
});
