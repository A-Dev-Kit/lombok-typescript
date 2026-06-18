# @Log

Wraps instance methods with logging (default: `console`).

|              |                    |
| ------------ | ------------------ |
| **Kind**     | Runtime            |
| **Backends** | `legacy`, `stage3` |

## Example

```ts
import { Log } from 'lombok-typescript/legacy';

@Log({ name: 'UserService', level: 'info' })
class UserService {
  findById(id: string) {
    return { id };
  }
}
```

Configure defaults in `lombok.config.ts` under `log` (provider reserved for future adapters).
