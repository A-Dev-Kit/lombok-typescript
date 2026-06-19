# @Strategy

**Two-level strategy registry** — register algorithm classes under a family and resolve by name.

|                         |                           |
| ----------------------- | ------------------------- |
| **Kind**                | Hybrid (runtime registry) |
| **Backends**            | `legacy`, `stage3`        |
| **Requires `generate`** | No                        |

## Example

```ts
import { Strategy, StrategyRegistry } from 'lombok-typescript/legacy';

@Strategy('compression', 'gzip')
class GzipCompressor {
  compress(data: string) {
    return `gzip:${data}`;
  }
}

const algo = StrategyRegistry.get<{ compress(d: string): string }>('compression', 'gzip');
StrategyRegistry.list('compression'); // ['gzip', ...]
```

Advanced: `registerStrategy`, `getStrategyRegistry`.
