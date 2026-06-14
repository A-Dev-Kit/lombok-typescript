import { describe, expect, it } from 'vitest';
import { createFromFactory, factoryClassLegacy, registerFactory } from './factory.js';
import { legacyBackend } from '../../legacy/backend.js';
import type { AnyClass } from '../../legacy/decorate.js';

describe('factory', () => {
  it('registers and creates instances by key', () => {
    class EmailService {
      kind = 'email';
    }
    factoryClassLegacy(legacyBackend, EmailService as AnyClass, 'email');
    const instance = createFromFactory<{ kind: string }>('email');
    expect(instance.kind).toBe('email');
  });

  it('registerFactory allows manual registration', () => {
    class SmsService {
      kind = 'sms';
    }
    registerFactory('sms', SmsService as AnyClass);
    expect(createFromFactory<{ kind: string }>('sms').kind).toBe('sms');
  });

  it('throws for unknown keys', () => {
    expect(() => createFromFactory('missing')).toThrow(/No factory registered/);
  });
});
