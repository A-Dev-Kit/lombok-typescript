export interface SynchronizedOptions {
  /**
   * Lock name. All `@Synchronized` methods on an instance that share a name share a
   * lock. Defaults to `'$lock'` (Java Lombok's field name), so by default every
   * `@Synchronized` method on the instance serializes against every other.
   */
  name?: string;
  /**
   * Max time in ms a queued call waits to acquire the lock before rejecting with
   * {@link SynchronizedTimeoutError}. Omit to wait indefinitely.
   */
  timeout?: number;
}

/** Thrown when a queued call cannot acquire the lock within `timeout` ms. */
export class SynchronizedTimeoutError extends Error {
  readonly lockName: string;
  readonly timeout: number;
  constructor(lockName: string, timeout: number) {
    super(`@Synchronized lock '${lockName}' not acquired within ${timeout}ms`);
    this.name = 'SynchronizedTimeoutError';
    this.lockName = lockName;
    this.timeout = timeout;
  }
}

const DEFAULT_LOCK_NAME = '$lock';

/** Per-instance named lock tails. A tail settles when the lock is next free. */
const locks = new WeakMap<object, Map<string, Promise<unknown>>>();

/** Lock holder for unbound calls (no usable `this`). */
const orphanHolder: object = {};

/** Sentinel resolved by a timed-out call's execution slot (nothing ran). */
const SKIPPED: unique symbol = Symbol('synchronized:skipped');

function lockMapFor(holder: object): Map<string, Promise<unknown>> {
  let byName = locks.get(holder);
  if (!byName) {
    byName = new Map();
    locks.set(holder, byName);
  }
  return byName;
}

/**
 * Wrap a method in a per-instance async mutex: overlapping calls queue FIFO and run one
 * at a time. The wrapper always returns a Promise, even for sync methods.
 */
export function synchronizedMethod(
  original: (...args: unknown[]) => unknown,
  options: SynchronizedOptions = {},
): (...args: unknown[]) => Promise<unknown> {
  const name = options.name ?? DEFAULT_LOCK_NAME;
  const timeoutMs = options.timeout;

  return function synchronizedWrapper(this: unknown, ...args: unknown[]): Promise<unknown> {
    const holder =
      this !== null && (typeof this === 'object' || typeof this === 'function')
        ? (this as object)
        : orphanHolder;
    const byName = lockMapFor(holder);
    const previous = byName.get(name) ?? Promise.resolve();
    const acquired = previous.then(
      () => undefined,
      () => undefined,
    );

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Runs the method once the lock frees; a timed-out call resolves SKIPPED instead
    // (still settling exactly when the lock frees, so later waiters keep correct order).
    const execution = acquired.then(() => {
      if (cancelled) return SKIPPED;
      if (timer !== undefined) clearTimeout(timer);
      return original.apply(this, args);
    });

    // The next waiter's acquisition chains on this call's completion, errors ignored.
    byName.set(
      name,
      execution.then(
        () => undefined,
        () => undefined,
      ),
    );

    if (timeoutMs === undefined) {
      return execution as Promise<unknown>;
    }

    const timedOut = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        cancelled = true;
        reject(new SynchronizedTimeoutError(name, timeoutMs));
      }, timeoutMs);
    });
    return Promise.race([execution, timedOut]);
  };
}
