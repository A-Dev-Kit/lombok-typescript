# ExtensionMethod

**Expose a helper class's static methods as instance methods on the decorated class.**
`instance.foo(...args)` becomes `Helper.foo(instance, ...args)` at runtime, with `this`
forwarded as the first argument.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Java parity — with a twist

Java Lombok's `@ExtensionMethod` is a **source-level rewrite**: the compiler inspects
each call site and, if `foo.bar(x)` doesn't resolve on `foo`'s type but a matching
`static bar(Foo, x)` exists on a listed helper class, it rewrites the call. TypeScript
decorators can't rewrite arbitrary call sites, so the port here does what it honestly
can: it **installs the helper's static methods on the decorated class's prototype**.
Calls to those method names are then routed through the helper by normal method dispatch,
receiving `this` as the first argument.

This is class-scoped: no global `String.prototype` pollution, no compiler plugins.

```ts
import { ExtensionMethod } from 'lombok-typescript/legacy';

class BoxUtils {
  static describe(box: { value: number }, prefix: string): string {
    return `${prefix}:${box.value}`;
  }
  static double(box: { value: number }): number {
    return box.value * 2;
  }
}

@ExtensionMethod([BoxUtils])
class Box {
  constructor(public value: number) {}
  // Type shims — runtime installs the implementations.
  declare describe: (prefix: string) => string;
  declare double: () => number;
}

const b = new Box(21);
b.describe('n'); // "n:21"
b.double(); // 42
```

## Options

| Option       | Type                              | Default   | Purpose                                                                                                                    |
| ------------ | --------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `onConflict` | `'error' \| 'skip' \| 'override'` | `'error'` | What to do when a helper method's name already exists on the class (own or ancestor, excluding `Object.prototype` members). |
| `include`    | `readonly string[]`               | —         | Only install methods with these names.                                                                                     |
| `exclude`    | `readonly string[]`               | —         | Skip methods with these names.                                                                                             |

`onConflict: 'error'` fails fast at decoration time with a message naming the class,
method, and helper — matching the fail-fast style of `@BuilderDefault` and `@Singular`.

## Semantics

- **Static methods only.** Non-function static properties (numbers, strings, nested
  objects) are ignored. `name`, `length`, and `prototype` are always skipped.
- **Multiple helpers.** Pass them in a list: `@ExtensionMethod([A, B, C])`. They're
  processed in order; under `override`, later helpers win when names clash.
- **Conflict detection ignores `Object.prototype`.** A helper named `toString` doesn't
  clash with the default `Object.prototype.toString`, but it *does* clash with a
  `toString()` you (or a parent class) declared explicitly.
- **`this` forwarding.** The installed wrapper calls `Helper.method(this, ...args)`, so
  the helper receives the instance as its first argument. Keep your helpers pure —
  don't rely on their own `this`.
- **Introspection.** The decorator records
  `{ helperName, methods: string[] }[]` under `MetadataKeys.EXTENSION_METHOD` on the class.

## Non-goals (v1)

- **Source-level call-site rewriting.** Impossible without a `ts-patch` or Babel plugin.
- **Augmenting built-in prototypes** (`String.prototype`, `Number.prototype`, etc.) —
  explicitly not supported to avoid cross-cutting pollution.
- **Type augmentation via codegen `.lombok.augment.d.ts`.** Deferred to a later
  release; for now, use the `declare` shims shown above.

## Java Lombok migrants

| Java pattern                               | Port                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| `@ExtensionMethod(StringUtils.class)` at class level | `@ExtensionMethod([StringUtils])` — installs statics on the decorated class only |
| `s.reverse()` compiler-rewritten to `StringUtils.reverse(s)` | Call `instance.method(...)` on the decorated class; not on unrelated strings.  |
