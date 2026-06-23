# @Retry

**Retry async methods** with configurable attempts, delay, backoff, and per-attempt timeout.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Retry } from 'lombok-typescript/legacy';

class ApiClient {
  @Retry({ attempts: 3, delay: 500, backoff: 'exponential' })
  async fetchUser(id: string) {
    return await fetch(`/users/${id}`).then((r) => r.json());
  }
}
```

## Options

| Option     | Default    | Description                          |
| ---------- | ---------- | ------------------------------------ |
| `attempts` | `3`        | Total tries including the first call |
| `delay`    | `1000`     | Base delay in ms between retries     |
| `backoff`  | `'fixed'`  | `'fixed'`, `'linear'`, `'exponential'` |
| `retryIf`  | always     | Predicate to decide whether to retry |
| `timeout`  | —          | Per-attempt timeout in ms            |

## Composition

Stack with `@Trace` for observability. Place `@Trace` above `@Retry` in source order so tracing wraps the retry wrapper.
