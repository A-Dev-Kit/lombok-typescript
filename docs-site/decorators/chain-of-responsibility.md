# @ChainOfResponsibility / @Handler

**Ordered handler chain** — call `handle(context)` to run `@Handler` methods in `order` until one handles the request.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { ChainOfResponsibility, Handler } from 'lombok-typescript/legacy';

@ChainOfResponsibility
class AuthMiddleware {
  @Handler({ order: 1 })
  checkToken(req: { token?: string }) {
    return Boolean(req.token);
  }

  @Handler({ order: 2 })
  checkRole(req: { role?: string }) {
    return req.role === 'admin';
  }
}

const ok = new AuthMiddleware().handle({ token: 'x', role: 'admin' });
```

A handler stops the chain when it returns `true` or any value other than `false` / `undefined`.
