# Method wrappers

> **Phase 1+ preview.** `@Memoize` ships in Phase 1 (one of the eight v0.1 decorators). `@Retry`, `@Debounce`, `@Throttle`, and `@Trace` ship in Phase 5 alongside the rest of the TS-only utilities. Examples describe the planned API.

These decorators wrap a method's implementation: cache its results, retry on failure, debounce or throttle its invocation, log its entry and exit. They're all pure runtime, no codegen involved.

## `@Memoize`

Caches the result of a method call keyed on its arguments. Repeated calls with the same args return the cached value.

### Basic

```ts
import { Memoize } from 'lombok-typescript/legacy';

class Math {
  @Memoize
  fib(n: number): number {
    if (n <= 1) return n;
    return this.fib(n - 1) + this.fib(n - 2);
  }
}

new Math().fib(40); // computed once, fast
new Math().fib(40); // cached, instant
```

The cache key is built from the JSON-serialized arguments. Works for primitives, plain objects, and arrays. For object identity, see "custom keying" below.

### With TTL

For results that go stale (network calls, time-sensitive computations):

```ts
class Api {
  @Memoize({ ttl: 60_000 }) // 1 minute
  async fetchUser(id: string) {
    return await fetch(`/users/${id}`).then((r) => r.json());
  }
}
```

After 60 seconds the cache entry expires and the next call recomputes.

### LRU cap

```ts
@Memoize({ maxSize: 100 })
expensive(input: string) { /* ... */ }
```

Holds at most 100 entries; oldest go first. Useful when you don't want the cache to grow unbounded.

### Custom key function

```ts
@Memoize({ key: (user: User) => user.id })
fetchProfile(user: User): Profile { /* ... */ }
```

Bypasses JSON serialization. Necessary when arguments contain functions, dates, or non-serializable objects.

### Per-instance vs shared cache

By default each instance gets its own cache. To share across all instances:

```ts
@Memoize({ scope: 'static' })
expensive(input: string) { /* ... */ }
```

Use static scope sparingly; it leaks between unrelated callers.

### Manual invalidation

```ts
const m = new Math();
m.fib(40);
m.fib.invalidate(); // clear all cached fib calls
m.fib.invalidateKey(40); // clear just fib(40)
```

The decorator augments the method with `invalidate()` and `invalidateKey()` helpers.

## `@Retry`

Retries an async method on failure. Useful for flaky network calls.

### Basic

```ts
import { Retry } from 'lombok-typescript/legacy';

class Api {
  @Retry({ attempts: 3, delay: 1000 })
  async fetchData(endpoint: string) {
    return await fetch(endpoint).then((r) => r.json());
  }
}
```

Three total attempts with a 1-second wait between them. If all three fail, the original error throws.

### Backoff strategies

```ts
@Retry({ attempts: 5, delay: 1000, backoff: 'exponential' })
async fetchData(endpoint: string) { /* ... */ }
```

`backoff` options:

- `'fixed'`: constant `delay` between attempts
- `'linear'`: `delay`, `2*delay`, `3*delay`, ...
- `'exponential'`: `delay`, `2*delay`, `4*delay`, `8*delay`, ...

### Retry condition

```ts
@Retry({
  attempts: 3,
  retryIf: (error) => error.code === 'ECONNRESET' || error.status === 503,
})
async fetchData(endpoint: string) { /* ... */ }
```

Only retry on transient errors. Permanent errors (4xx) bubble up immediately.

### Per-attempt timeout

```ts
@Retry({ attempts: 3, timeout: 5000 })
async slowOperation() { /* ... */ }
```

Each attempt has 5 seconds before it's aborted and the next attempt starts.

## `@Debounce` / `@Throttle`

Rate-limit method invocations. Mostly used in event handlers.

### `@Debounce`

Delays execution until calls stop. The classic use case: search input.

```ts
import { Debounce } from 'lombok-typescript/legacy';

class SearchBox {
  @Debounce(300)
  onInput(query: string) {
    this.performSearch(query);
  }
}
```

`onInput('h')`, `onInput('he')`, `onInput('hel')` in quick succession results in one `performSearch('hel')` call, 300ms after the last keystroke.

Trailing-edge fire by default. To fire on the leading edge instead:

```ts
@Debounce(300, { leading: true, trailing: false })
```

### `@Throttle`

Limits execution to once per interval. Use case: scroll handler.

```ts
import { Throttle } from 'lombok-typescript/legacy';

class ScrollWatcher {
  @Throttle(100)
  onScroll(position: number) {
    this.updateUI(position);
  }
}
```

`onScroll(0)`, `onScroll(10)`, `onScroll(20)` in 50ms results in one `updateUI(0)` call. The next call after the 100ms window can fire.

### Cancel and flush

```ts
const sb = new SearchBox();
sb.onInput('hello');
sb.onInput.cancel(); // discard pending invocation
sb.onInput.flush(); // run pending invocation immediately
```

Both decorators add `cancel()` and `flush()` to the method.

## `@Trace`

Logs method entry, exit, arguments, return value, and elapsed time. The cheapest observability you can add.

### Class-level

```ts
import { Trace } from 'lombok-typescript/legacy';

@Trace
class UserService {
  async create(data: UserData) {
    /* ... */
  }
  async update(id: string, data: Partial<UserData>) {
    /* ... */
  }
}
```

Every method on the class gets traced. Output:

```
> UserService.create({ name: 'John' })
< UserService.create [42ms] -> User { id: 'u1', name: 'John' }
> UserService.update('u1', { age: 26 })
< UserService.update [12ms] -> User { id: 'u1', name: 'John', age: 26 }
```

### Method-level

To trace just one method, apply `@Trace` directly:

```ts
class UserService {
  @Trace
  async create(data: UserData) {
    /* ... */
  }
}
```

### Sensitive arguments

```ts
@Trace({ redact: ['password', 'token', 'apiKey'] })
class AuthService {
  async login(username: string, password: string) {
    /* ... */
  }
}
```

Logged output redacts those argument names: `> AuthService.login('john', '[REDACTED]')`.

### Custom logger

```ts
import { logger } from './my-logger';

@Trace({ logger })
class Service {
  /* ... */
}
```

Defaults to the logger configured under `log` in `lombok.config.ts`. The custom-logger override wins per-class.

### Just timing

```ts
@Trace({ timing: true, args: false, result: false })
async expensive() { /* ... */ }
```

Output: `< Service.expensive [123ms]`. Useful when you want to know where time is going without flooding logs with payloads.

## Composing them

Common pattern for an outbound API call:

```ts
class Api {
  @Trace
  @Retry({ attempts: 3, backoff: 'exponential' })
  @Memoize({ ttl: 30_000 })
  async fetchUser(id: string): Promise<User> {
    return await fetch(`/users/${id}`).then((r) => r.json());
  }
}
```

Order of wrapping (outermost first): `@Trace` wraps `@Retry`, which wraps `@Memoize`, which wraps the original method. Decorators apply bottom-up by default; the order matters when one wrapper changes the function shape.

If a decorator returns a Promise (async method), every wrapper above it must also handle promises. All four decorators in this doc do.

Next: [08-behavioral-patterns.md](./08-behavioral-patterns.md).
