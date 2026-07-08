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

## Field defaults — `@BuilderDefault`

By default the builder overwrites **every** field, so a class field initializer is ignored
when you don't call its setter (matching Java Lombok's behavior). Mark a field with
`@BuilderDefault` to keep its initializer as the default when the builder omits it — the
TypeScript equivalent of Java's `@Builder.Default`.

```ts
import { Builder, BuilderDefault } from 'lombok-typescript/legacy';

@Builder
export class Account {
  name!: string;

  @BuilderDefault
  role: string = 'member';
}
```

```ts
Account.builder().name('ada').build().role; // 'member' — initializer kept
Account.builder().name('neo').role('admin').build().role; // 'admin' — overridden
```

The generated `build()` only assigns a defaulted field when its setter was called, so the
`new Account()` initializer survives otherwise.

> **Requires an initializer.** `@BuilderDefault` on a field with no initializer (e.g.
> `role!: string`) fails `lombok-ts generate` with a clear error — there is nothing to
> default to.

## Collections — `@Singular`

Mark an **array** field with `@Singular` and the builder generates _accumulator_ methods
instead of a single setter — the TypeScript equivalent of Java Lombok's `@Singular`:

```ts
import { Builder, Singular } from 'lombok-typescript/legacy';

@Builder
export class User {
  name!: string;

  @Singular()
  roles: string[] = [];
}
```

Generates three methods (the add-one name is auto-singularized: `roles` → `role`):

```ts
User.builder().name('ada').role('admin').role('user').build().roles; // ['admin', 'user']
User.builder().roles(['a', 'b']).clearRoles().role('c').build().roles; // ['c']
```

- `role(value)` — append one item
- `roles(values)` — append many
- `clearRoles()` — reset to empty
- an unset `@Singular` field builds to `[]`.

**Irregular plurals:** pass an explicit name — `@Singular('person') people: string[]` →
`person()` / `people()` / `clearPeople()`.

> **Arrays only (this release).** `@Singular` requires a `T[]` / `Array<T>` field. It errors
> at `lombok-ts generate` on a non-array field, on a name it can't singularize (pass one via
> `@Singular('...')`), or when combined with `@BuilderDefault` on the same field.

## Codegen steps

1. Generates `OrderBuilder` class in `.lombok/.../order.lombok.ts`.
2. Declaration shim adds `static builder()` to `Order` in `.lombok.d.ts`.
3. Run `applyAllGenerated({ Order })` at startup.

## v0.1 limitations

- `build()` creates `new Order()` then assigns accumulated fields — properties must be assignable on the instance.
- No validation of required fields at build time (unset fields may be `undefined` unless you use definite assignment in source).
