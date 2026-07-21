# @Synchronized

**Async mutex** for methods — overlapping calls queue FIFO and run one at a time. The
TypeScript equivalent of Java Lombok's `@Synchronized`.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Why this matters in single-threaded JS

JS has no threads, but **async interleaving is real**: while one call is suspended at an
`await`, another call to the same method can run and race a read-modify-write.

```ts
import { Synchronized } from 'lombok-typescript/legacy';

class Account {
  balance = 100;

  @Synchronized()
  async withdraw(amount: number) {
    const before = this.balance; // without the mutex, both calls read 100…
    await audit(amount);
    this.balance = before - amount; // …and the balance ends at 50, not 0
  }
}

await Promise.all([acc.withdraw(50), acc.withdraw(50)]); // balance: 0 ✔
```

## Locks

- **Default (Java parity):** every `@Synchronized` method on an instance shares one lock
  (`'$lock'`, matching Java Lombok's field name) — they all serialize against each other.
- **Named locks:** `@Synchronized('cache')` uses a separate lock, so methods on different
  names don't contend (Java's `@Synchronized("field")`).
- **Per instance:** locks live in a `WeakMap` keyed by `this` — separate instances never
  contend, and locks are garbage-collected with the instance.

## Options

| Option    | Type     | Purpose                                                                                   |
| --------- | -------- | ----------------------------------------------------------------------------------------- |
| `name`    | `string` | Lock name. Defaults to `'$lock'` (shared across the instance's `@Synchronized` methods).  |
| `timeout` | `number` | Max ms a queued call waits for the lock before rejecting with `SynchronizedTimeoutError`. |

`@Synchronized('name')` is shorthand for `@Synchronized({ name: 'name' })`.

```ts
import { Synchronized, SynchronizedTimeoutError } from 'lombok-typescript/legacy';

class Uploader {
  @Synchronized({ timeout: 5_000 })
  async upload(file: Blob) {
    /* … */
  }
}

try {
  await uploader.upload(file);
} catch (err) {
  if (err instanceof SynchronizedTimeoutError) {
    // err.lockName === '$lock', err.timeout === 5000
  }
}
```

A timed-out call never runs and never holds the lock; the queue continues in order.

## Caveats

- **The wrapped method always returns a Promise** — even if the method body is sync.
  Callers must `await`.
- **No reentrancy:** a `@Synchronized` method calling another `@Synchronized` method on
  the same lock **deadlocks** (the inner call waits for the lock the outer call holds).
  Workaround: put shared logic in an un-decorated private method and call that.
- Rejections don't poison the queue — the next queued call still runs.

## Non-goals (v1)

- **Static/class-level locks** (Java's `$LOCK`) — deferred.
- Fairness beyond FIFO ordering, and reentrancy detection.
