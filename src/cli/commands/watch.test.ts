import { describe, expect, it } from 'vitest';
import { runWatch } from './watch.js';

describe('runWatch', () => {
  it('logs a "coming soon" message and resolves', async () => {
    const logs: string[] = [];
    await runWatch({ log: (m) => logs.push(m) });
    expect(logs.join('\n')).toMatch(/not implemented yet/i);
    expect(logs.join('\n')).toMatch(/Phase 2/);
  });
});
