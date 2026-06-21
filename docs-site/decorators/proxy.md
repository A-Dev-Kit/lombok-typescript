# @Proxy

**Runtime method interception** via `Proxy` around each instance.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Hybrid (runtime)   |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Proxy } from 'lombok-typescript/legacy';

@Proxy({
  before: (method, args) => console.log(method, args),
  after: (method, result) => console.log(method, '→', result),
})
class Service {
  compute(x: number) {
    return x * 2;
  }
}
```

Hooks receive `(methodName, args)` and `(methodName, result)`. Field access is not intercepted.
