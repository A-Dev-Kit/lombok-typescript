# @Adapter

**Marker-only** — documents that a class adapts one API to another. Does not generate methods; implement the target interface manually.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Marker-only class  |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

> Not to be confused with `ValidatorAdapter` in `lombok-typescript/validators/*`.

## Example

```ts
import { Adapter } from 'lombok-typescript/legacy';

interface ModernApi {
  fetch(): Promise<string>;
}

class LegacyApi {
  load(cb: (err: Error | null, data: string) => void) {
    cb(null, 'ok');
  }
}

@Adapter({ adapts: LegacyApi, target: ModernApi })
class LegacyApiAdapter implements ModernApi {
  private legacy = new LegacyApi();
  fetch(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.legacy.load((err, data) => (err ? reject(err) : resolve(data)));
    });
  }
}
```

Options are stored in metadata for tooling and documentation.
