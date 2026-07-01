import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { LogNest } from './log-nest.js';

describe('LogNest', () => {
  it('wraps class methods with Nest Logger', () => {
    const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    @LogNest({ context: 'TestSvc' })
    class TestSvc {
      run(value: number) {
        return value + 1;
      }
    }

    const svc = new TestSvc();
    expect(svc.run(1)).toBe(2);
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
