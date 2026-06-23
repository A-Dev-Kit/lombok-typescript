# @Debounce / @Throttle

**Rate-limit method calls** — debounce waits for a pause; throttle enforces a minimum interval.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## @Debounce

```ts
import { Debounce } from 'lombok-typescript/legacy';

class SearchBox {
  @Debounce(300)
  onInput(query: string) {
    this.search(query);
  }
}
```

Wrapped methods expose `cancel()` and `flush()` on the function object (legacy descriptor wiring).

Options: `{ leading?: boolean; trailing?: boolean }` (default trailing).

## @Throttle

```ts
import { Throttle } from 'lombok-typescript/legacy';

class ScrollHandler {
  @Throttle(100)
  onScroll(y: number) {
    this.render(y);
  }
}
```

Also supports `cancel()` and `flush()` on the wrapped function.

## When to use

- **Debounce** — search boxes, resize handlers, autosave after typing stops
- **Throttle** — scroll/mousemove streams where you want periodic updates
