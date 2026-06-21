# @Wraps

**GoF Decorator** — wrap an inner instance and delegate selectively.

|                         |                                   |
| ----------------------- | --------------------------------- |
| **Kind**                | Runtime                           |
| **Backends**            | `legacy`, `stage3`                |
| **Requires `generate`** | No (declaration shim for `inner`) |

Named `@Wraps` per [ADR-15](https://github.com/A-Dev-Kit/lombok-typescript-planning/blob/main/adr/0015-gof-decorator-pattern-naming.md) to avoid confusion with TypeScript decorators.

## Example

```ts
import { Wraps } from 'lombok-typescript/legacy';

class Coffee {
  cost() {
    return 2;
  }
}

@Wraps(Coffee)
class WithMilk {
  cost() {
    return this.inner.cost() + 0.5;
  }
}

const drink = new WithMilk(new Coffee());
```

The wrapper constructor expects the inner instance as its first argument. The inner is exposed as `protected inner`.

## Composition notes

Avoid combining with `@Singleton` when each wrapper must wrap a distinct inner instance.
