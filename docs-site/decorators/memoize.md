# @Memoize

**Cache method results** keyed by serialized arguments.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## When to use

- Pure or expensive methods called repeatedly with the same arguments
- Service methods where idempotent reads should not hit downstream systems every time

## When not to use

- Methods with side effects that must run on every call
- Methods whose arguments are mutable objects (cache key uses serialization — unstable for deep objects)
- Unbounded argument domains (memory growth)

## Example

```ts
import { Memoize, Singleton } from 'lombok-typescript/legacy';

@Singleton
class UserService {
  @Memoize()
  loadUser(id: string) {
    return { id, name: `User-${id}` };
  }
}

const svc = new UserService();
svc.loadUser('1') === svc.loadUser('1'); // true
```

## v0.1 limitations

- In-memory cache only; no TTL or LRU eviction.
- Cache is per decorator instance (per class instance for instance methods).
