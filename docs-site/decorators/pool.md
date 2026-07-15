# @Pool

**Object pool** with a checkout/return lifecycle — the "24th" GoF pattern
([ADR-16](https://github.com/A-Dev-Kit/lombok-typescript-planning/blob/main/adr/0016-23-vs-24-gof-patterns.md)).

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Pool, PoolExhaustedError, type Pooled } from 'lombok-typescript/legacy';

@Pool({
  size: 5,
  factory: () => new DbConnection('postgres://…'),
  reset: (c) => c.clear(),
})
class DbConnection {
  clear() {
    /* … */
  }
}

const Pooled = DbConnection as Pooled<typeof DbConnection>;

const conn = Pooled.acquire();
try {
  // …use conn…
} finally {
  Pooled.release(conn);
}
```

`new DbConnection(...)` still works for non-pooled use; only `acquire()` / `release()` participate in pooling.

## Options

| Option    | Type                    | Purpose                                                                                                |
| --------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `size`    | `number` (required)     | Maximum live instances (available + leased). `acquire()` throws when this is reached and all leased.   |
| `factory` | `() => T`               | How to create fresh instances. Defaults to `new Class()` — omit only if the class has a zero-arg ctor. |
| `reset`   | `(instance: T) => void` | Cleanup callback invoked on `release` before returning the instance to the pool.                       |

## Semantics

- **`acquire()`** — returns an available instance if any; otherwise, if fewer than `size` instances are leased, builds a fresh one via `factory` (or `new Class()`); otherwise **throws `PoolExhaustedError`**.
- **`release(x)`** — no-op if `x` was never acquired (idempotent). Otherwise `reset?.(x)` runs, then the instance returns to the pool. If `reset` throws, the instance is **discarded** (not returned) so a broken object is never re-used.

```ts
try {
  Pooled.acquire();
} catch (err) {
  if (err instanceof PoolExhaustedError) {
    // err.className, err.size
  }
}
```

## @Pool vs @Flyweight

Both share instance state, but the semantics differ:

|                 | `@Flyweight`                     | `@Pool`                                           |
| --------------- | -------------------------------- | ------------------------------------------------- |
| Return contract | Same instance for a given `key`  | _Any available_ instance                          |
| Lifecycle       | `new` returns pooled (dedup)     | Explicit `acquire()` / `release()`                |
| Fixed capacity  | No                               | Yes (`size`)                                      |
| Typical use     | Immutable value objects (glyphs) | Reusable mutable resources (buffers, connections) |

## Typed access

TypeScript's `experimentalDecorators` doesn't see the wrapper's added statics, so cast when you want typed `acquire()` / `release()`:

```ts
import type { Pooled } from 'lombok-typescript/legacy';

const P = MyClass as Pooled<typeof MyClass>;
P.acquire(); // typed as InstanceType<typeof MyClass>
```

## Non-goals (v1)

- **Async acquire** (waiters queue) — deferred to a later phase. Today, exhaustion is synchronous throw.
- The Java Lombok library has no `@Pool` annotation; this is a GoF-only addition.
