# @DeepFreeze

**Recursively freeze instances** at construction so nested objects and arrays cannot be mutated.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime class      |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { DeepFreeze } from 'lombok-typescript/legacy';

@DeepFreeze
class AppConfig {
  db = { host: 'localhost', port: 5432 };
  features = ['auth', 'billing'];
}

const cfg = new AppConfig();
cfg.db.host = 'other'; // throws in strict mode (frozen object)
```

Plain objects and arrays on the instance are frozen recursively. Non-plain values (e.g. `Date`) are left as-is. Circular references are handled safely via a `WeakSet` visit tracker.
