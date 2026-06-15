# @Builder

**Fluent builder** for constructing class instances field-by-field.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## When to use

- Many optional constructor parameters
- Readable object construction (`User.builder().name('a').age(1).build()`)
- Alongside [`@Data`](/decorators/data) on the same class

## When not to use

- Single-field or two-argument constructors where a plain object literal is simpler
- Immutable value types (future `@Value` in Phase 2)

## Example

```ts
import { Builder } from 'lombok-typescript/legacy';

@Builder
export class Order {
  item!: string;
  qty!: number;
}
```

After `lombok-ts generate` and `applyAllGenerated`:

```ts
const order = Order.builder().item('Widget').qty(3).build();
```

Static entry point: `Order.builder()` is mixed onto the class by `applyOrderGenerated`.

## Codegen steps

1. Generates `OrderBuilder` class in `.lombok/.../order.lombok.ts`.
2. Declaration shim adds `static builder()` to `Order` in `.lombok.d.ts`.
3. Run `applyAllGenerated({ Order })` at startup.

## v0.1 limitations

- `build()` creates `new Order()` then assigns accumulated fields — properties must be assignable on the instance.
- No validation of required fields at build time (unset fields may be `undefined` unless you use definite assignment in source).
