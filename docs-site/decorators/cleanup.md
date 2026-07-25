# Cleanup

**Auto-close a field at dispose time.** Any class with a `Cleanup`-marked field
automatically implements `[Symbol.dispose]()` — use it directly, or via TypeScript 5.2's
`using` block.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Java parity — with a twist

Java Lombok's `@Cleanup` is a **local-variable** annotation: it auto-calls `close()` (or
a named method) at end of the enclosing block. TypeScript decorators can't target locals,
so `Cleanup` here targets **class fields** — and the enclosing class becomes the disposal
unit. TS 5.2's `using` gives us the same block-scope teardown ergonomics:

```ts
import { Cleanup } from 'lombok-typescript/legacy';

class Session {
  @Cleanup() readonly conn = openConnection(); // .close() at dispose
  @Cleanup('end') readonly stream = openStream(); // .end() at dispose
  declare [Symbol.dispose]: () => void; // type-shim; runtime installs it
}

{
  using session = new Session();
  session.conn.query('…');
} // session[Symbol.dispose]() runs → stream.end() then conn.close() (reverse order)
```

## Options

| Option   | Type     | Purpose                                                         |
| -------- | -------- | --------------------------------------------------------------- |
| `method` | `string` | Cleanup method to call on the field value. Defaults to `close`. |

`Cleanup('end')` is shorthand for `Cleanup({ method: 'end' })`.

## Semantics

- **Installs `[Symbol.dispose]()`** on the class prototype the first time any field on it
  is marked. Idempotent: multiple marked fields register with a single installer.
- **Reverse declaration order (LIFO)** — mirroring Java's block-scope teardown; the
  most recently declared cleanup field is disposed first.
- **Null/undefined field values** are skipped silently — safe for optional resources.
- **Missing cleanup method** on a non-null field value throws
  `Error: Cleanup: field '<name>' value has no method '<method>'` — surfaces typos loudly.
- **Best-effort teardown:** if one cleanup throws, later fields still run. The first
  error is rethrown after all fields have been attempted.
- **Chains a pre-existing `[Symbol.dispose]()`:**
  - If the class already has a user-defined dispose (in the class body), that runs
    **first**, then the Cleanup field walk — matches "class body statements run before
    field teardown."
  - If the previous dispose was installed by a parent-class `Cleanup`, the more-derived
    class's fields run **first**, then the parent's dispose — LIFO across inheritance.

## Subclasses

Both parent- and child-class `Cleanup` fields are honoured:

```ts
class Parent {
  @Cleanup() readonly p = mk('p');
  declare [Symbol.dispose]: () => void;
}
class Child extends Parent {
  @Cleanup() readonly c = mk('c');
}

{
  using x = new Child();
}
// Order: child-c → parent-p
```

## Nest integration

For Nest **providers**, prefer `OnModuleDestroy` — Nest's own lifecycle hook aligns with
container teardown. Reserve `Cleanup` for short-lived helper objects inside providers
(request-scoped sessions, transient handles) that you manage with `using`.

## Non-goals (v1)

- **`Symbol.asyncDispose` / `await using`** — deferred. If you need async teardown, wrap
  the async work in a fire-and-forget call inside a sync `close()`, or wait for a future
  `AsyncCleanup` phase.
- **Finalizers / GC-time cleanup** — you must reach dispose via `using` or an explicit
  `[Symbol.dispose]()` call.
