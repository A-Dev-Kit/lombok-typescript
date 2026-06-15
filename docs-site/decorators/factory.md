# @Factory

**Named factory registry** — register implementations and resolve by string key.

|                         |                                                                |
| ----------------------- | -------------------------------------------------------------- |
| **Kind**                | Hybrid (runtime registry)                                      |
| **Backends**            | `legacy`, `stage3`                                             |
| **Requires `generate`** | No (optional companions if class has other codegen decorators) |

## When to use

- Multiple implementations of a concept selected by name (`'email'`, `'sms'`)
- Lightweight factory pattern without a full DI container

## When not to use

- Complex dependency graphs — use NestJS or Inversify
- When TypeScript discriminated unions and a plain `switch` are clearer

## Example

```ts
import { Factory, createFromFactory } from 'lombok-typescript/legacy';

@Factory('email')
export class EmailNotifier {
  channel = 'email';
}

@Factory('sms')
export class SmsNotifier {
  channel = 'sms';
}

const email = createFromFactory<{ channel: string }>('email');
```

Registry helpers: `registerFactory`, `getFactoryRegistry` (advanced).

## NestJS

See [examples/nestjs](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/nestjs) for `@Injectable()` + `@Factory` together.

## v0.1 limitations

- String keys are not compile-time checked — typos fail at runtime.
- No lifecycle management (singleton scope per key is manual).
