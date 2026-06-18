# @Delegate

Forwards selected methods to a field (v0.4.0 scope: explicit method names).

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Example

```ts
import { Delegate } from 'lombok-typescript/legacy';

interface Engine {
  start(): void;
  stop(): void;
}

class Car {
  @Delegate('start', 'stop')
  engine!: Engine;
}
```

Codegen emits `start()` and `stop()` on `Car` that delegate to `this.engine`.
