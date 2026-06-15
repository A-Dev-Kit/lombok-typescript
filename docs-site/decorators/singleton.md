# @Singleton

**One shared instance** per decorated class.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## When to use

- Application-wide services (caches, config holders, stateless facades)
- NestJS services that should not be re-instantiated per injection site when used without Nest's default scope

## When not to use

- Request-scoped or per-user state — use prototype scope or Nest request scope
- Types that must be mockable with fresh instances in every unit test (prefer manual DI in tests)

## Example

```ts
import { Singleton } from 'lombok-typescript/legacy';

@Singleton
export class AppConfig {
  load() {
    return { env: 'production' };
  }
}

const a = new AppConfig();
const b = new AppConfig();
console.assert(a === b);
```

Works alongside `@Injectable()` in [examples/nestjs](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/nestjs).

## v0.1 limitations

- Process-wide singleton (not cluster-safe distributed singleton).
- No destroy/teardown hook.
