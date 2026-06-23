# @Trace

**Log method entry, exit, timing, and errors** for classes or individual methods.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Trace } from 'lombok-typescript/legacy';

@Trace({ redact: ['password'], args: true, result: true, timing: true })
class UserService {
  createUser(email: string, password: string) {
    return { email };
  }
}
```

## Options

| Option   | Default              | Description                |
| -------- | -------------------- | -------------------------- |
| `logger` | `console.info`       | Custom logger with `log()` |
| `redact` | —                    | Argument names to mask     |
| `args`   | `true`               | Log arguments on entry     |
| `result` | `true`               | Log return value on exit   |
| `timing` | `true`               | Log elapsed ms on exit     |
| `name`   | class or method name | Prefix in log lines        |

Class-level `@Trace` wraps every own prototype method. Method-level `@Trace` wraps a single method.
