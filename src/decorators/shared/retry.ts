import { computeBackoffDelay, sleep, type BackoffStrategy } from './timing-utils.js';

export interface RetryOptions {
  /** Total attempts including the first call. Default `3`. */
  attempts?: number;
  /** Base delay in ms between retries. Default `1000`. */
  delay?: number;
  backoff?: BackoffStrategy;
  retryIf?: (error: unknown) => boolean;
  /** Per-attempt timeout in ms. */
  timeout?: number;
}

async function runWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Retry attempt timed out')), timeoutMs);
    }),
  ]);
}

export function retryMethod<T extends (...args: unknown[]) => Promise<unknown>>(
  original: T,
  options: RetryOptions = {},
): T {
  const attempts = options.attempts ?? 3;
  const delay = options.delay ?? 1000;
  const backoff = options.backoff ?? 'fixed';
  const retryIf = options.retryIf ?? (() => true);

  return async function (this: unknown, ...args: unknown[]) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const run = () => original.apply(this, args) as Promise<unknown>;
        if (options.timeout !== undefined) {
          return await runWithTimeout(run, options.timeout);
        }
        return await run();
      } catch (error) {
        lastError = error;
        if (attempt >= attempts || !retryIf(error)) {
          throw error;
        }
        await sleep(computeBackoffDelay(delay, attempt, backoff));
      }
    }
    throw lastError;
  } as T;
}
