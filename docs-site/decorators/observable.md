# @Observable

**Reactive properties** — subscribe to changes on instance fields and derived getters.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Observable } from 'lombok-typescript/legacy';

@Observable
class Counter {
  count = 0;
}

const c = new Counter();
c.subscribe('count', (next, prev) => console.log(next, prev));
c.count = 1;

c.subscribe('*', (key, next, prev) => console.log(key, next, prev));
```

## Derived getters

```ts
@Observable
class Cart {
  items: number[] = [];

  @Observable.Derived
  get total() {
    return this.items.reduce((s, n) => s + n, 0);
  }
}
```

`@Observer` is an alias for `@Observable` (GoF naming).

## Adapters

- [RxJS / MobX adapters](./observers-adapters.md)

## Caveats

- Instances are wrapped in a `Proxy`; `instanceof` checks against the undecorated class may fail.
- Assign properties on the instance returned from `new` so the proxy `set` trap fires.
