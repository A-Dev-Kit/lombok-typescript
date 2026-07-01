import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOMBOK_NEST_CONFIG,
  LOMBOK_NEST_CONFIG,
} from './lombok.constants.js';
import { LombokModule } from './lombok.module.js';

describe('LombokModule', () => {
  it('forRoot provides LOMBOK_NEST_CONFIG', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        LombokModule.forRoot({
          logAdapter: 'nest',
          defaultProviderScope: 'REQUEST',
        }),
      ],
    }).compile();

    const config = moduleRef.get(LOMBOK_NEST_CONFIG);
    expect(config.logAdapter).toBe('nest');
    expect(config.defaultProviderScope).toBe('REQUEST');
    await moduleRef.close();
  });

  it('forRoot merges defaults', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LombokModule.forRoot()],
    }).compile();

    const config = moduleRef.get(LOMBOK_NEST_CONFIG);
    expect(config).toEqual(DEFAULT_LOMBOK_NEST_CONFIG);
    await moduleRef.close();
  });
});
