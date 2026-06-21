# @Flyweight

**Shared instance pool** keyed by constructor arguments.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Flyweight } from 'lombok-typescript/legacy';

@Flyweight({ key: (color: string) => color })
class TreeType {
  constructor(public color: string) {}
}

const a = new TreeType('green');
const b = new TreeType('green');
console.assert(a === b);
```

Pools are isolated per decorated class. The first constructor arguments win for a pooled instance.

## Composition notes

Do not combine with `@Singleton` or `@Prototype` — all three override constructor behavior.
