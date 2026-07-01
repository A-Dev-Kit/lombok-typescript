import { describe, expect, it, afterEach } from 'vitest';
import {
  clearLombokPlugins,
  getLombokPlugin,
  listLombokPlugins,
  registerLombokPlugin,
} from './plugins.js';

describe('registerLombokPlugin', () => {
  afterEach(() => {
    clearLombokPlugins();
  });

  it('registers and lists plugins', () => {
    let called = false;
    registerLombokPlugin({
      name: 'demo',
      onRegister: () => {
        called = true;
      },
    });
    expect(called).toBe(true);
    expect(listLombokPlugins()).toEqual(['demo']);
    expect(getLombokPlugin('demo')?.name).toBe('demo');
  });

  it('rejects duplicate names', () => {
    registerLombokPlugin({ name: 'dup' });
    expect(() => registerLombokPlugin({ name: 'dup' })).toThrow(/already registered/);
  });
});
