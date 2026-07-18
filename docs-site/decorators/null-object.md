# @NullObject

**Marker + type-aid** — documents that a class is a safe do-nothing implementation of some
contract. Callers use it in place of `null` to avoid null checks.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Marker-only class  |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { NullObject } from 'lombok-typescript/legacy';

class ConsoleLogger {
  log(msg: string) {
    console.info(msg);
  }
}

@NullObject({ of: ConsoleLogger })
class NullLogger implements ConsoleLogger {
  log(_msg: string) {
    /* no-op */
  }
}

function logSomething(logger: ConsoleLogger = new NullLogger()) {
  logger.log('hello');
}
```

## Options

| Option | Type       | Purpose                                                                           |
| ------ | ---------- | --------------------------------------------------------------------------------- |
| `of`   | `AnyClass` | Required. The class/interface constructor this null implementation stands in for. |

`of` is validated at decoration time — a non-constructor value throws
`@NullObject of must be a constructor function`.

## Reading the metadata

`@NullObject` is a marker: no runtime behavior beyond one metadata write. Tools that want
to discover null implementations can read the marker via the same helper used for the
other GoF markers:

```ts
import { getGoFMarkerMetadata } from 'lombok-typescript/legacy';
import { MetadataKeys } from 'lombok-typescript/core';

const meta = getGoFMarkerMetadata<{ of: new () => object }>(NullLogger, MetadataKeys.NULL_OBJECT);
// meta?.of === ConsoleLogger
```

## @NullObject vs an optional field

Sometimes you don't need a class at all — an optional field (`logger?: Logger`) with
null-safe callsites works. Reach for `@NullObject` when:

- You want a **single, stable default** instance callers can share, rather than checking
  for `undefined` at every call.
- The absence of the dependency is a **documented alternative** (like a silent logger),
  not just a missing configuration.
- Tooling needs to **find** null implementations by contract.

Java Lombok has no `@NullObject` — this is a GoF-only addition.

## Non-goals (v1)

- **No runtime singleton.** The decorator does not add `NullLogger.instance()` — callers
  `new` the null object themselves. A `.instance()` helper could be a follow-up if demand
  surfaces.
- **No `NullObjectOf<T>` mapped type.** The `{ of: Class }` reference is the type-aid; a
  separate mapped type would add surface for little gain in v1.
