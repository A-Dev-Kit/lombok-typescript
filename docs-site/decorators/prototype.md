# @Prototype

**New instance on every construction** — explicit opposite of singleton semantics for documentation and metadata.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## When to use

- Mark classes that must never be treated as singletons in tooling or future DI adapters
- Document intent when a class sits next to `@Singleton` services in the same module

## When not to use

- Default TypeScript `new` already creates distinct instances — decorator is mainly explicit metadata in v0.1

## Example

```ts
import { Prototype } from 'lombok-typescript/legacy';

@Prototype
export class RequestContext {
  id = crypto.randomUUID();
}

const a = new RequestContext();
const b = new RequestContext();
console.assert(a !== b);
```

## v0.1 limitations

- Behavior matches ordinary `new`; metadata is stored for future framework integrations.
