# @State / @Transition

**Finite state machine** — guard methods with allowed transitions; illegal moves throw at runtime.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { State, Transition } from 'lombok-typescript/legacy';

@State({ states: ['draft', 'done'], initial: 'draft' })
class Task {
  @Transition({ from: 'draft', to: 'done' })
  complete() {}

  @Transition({ from: ['draft', 'done'], to: 'archived' })
  archive() {}
}

const task = new Task();
task.state; // 'draft'
task.complete();
task.state; // 'done'
```

Optional hooks: `onEnter`, `onExit`, `onTransition` in `@State({ ... })`.

## Caveats

- Invalid transitions throw `Error` at runtime (not compile-time).
- Combining with NestJS request-scoped providers can surprise you if state is shared.
