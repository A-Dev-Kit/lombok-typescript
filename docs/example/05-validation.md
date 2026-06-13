# Validation

> **Phase 1+ preview.** `@NonNull` ships in Phase 1 (it's one of the eight v0.1 decorators). `@Validate` lands in Phase 5 alongside the rest of the TS-only utilities. Examples below describe the planned API.

Two decorators handle most input validation: `@NonNull` for the simple null/undefined check, `@Validate` for richer schema-based checks via Zod / Yup / class-validator.

## `@NonNull`

Throws a `TypeError` if a field or method parameter is set to `null` or `undefined`. Pure runtime, no codegen.

### On a field

```ts
import { NonNull } from 'lombok-typescript/legacy';

class User {
  @NonNull name: string = '';
  age?: number;
}

const u = new User();
u.name = 'John'; // fine
u.name = null as any; // TypeError: User.name cannot be null/undefined
```

The error message includes the class name and field name so you can find the offending site quickly.

### On a method parameter

```ts
class Greeter {
  greet(@NonNull message: string, name?: string): string {
    return `${message}, ${name ?? 'world'}`;
  }
}

new Greeter().greet('Hello', 'John'); // ok
new Greeter().greet(null as any); // TypeError: Greeter.greet param 0 cannot be null
```

Stage 3 doesn't have parameter decorators in the spec, so parameter-level `@NonNull` is legacy-only. Stage 3 users can still apply it on fields.

### What it does behind the scenes

For fields, `@NonNull` installs a property accessor that runs the check on every assignment. For parameters, it registers the parameter index in metadata; the check runs at method entry, wrapped via `defineMethodDecorator` internally.

There's no compile-time check involved. TypeScript already catches `null` and `undefined` at type-level if you use `strictNullChecks: true`. `@NonNull` is for the runtime case (data coming from JSON, network, untyped sources).

## `@Validate`

Schema validation on assignment or construction. Pluggable backend; you choose Zod, Yup, or class-validator in `lombok.config.ts`.

### With Zod

```ts
import { Validate } from 'lombok-typescript/legacy';
import { z } from 'zod';

class Signup {
  @Validate(z.string().email())
  email: string = '';

  @Validate(z.number().int().min(18).max(120))
  age: number = 0;

  @Validate(z.string().min(8))
  password: string = '';
}

const s = new Signup();
s.email = 'not-an-email'; // throws ZodError
```

### With class-validator (NestJS-style)

```ts
import { Validate } from 'lombok-typescript/legacy';
import { IsEmail, IsInt, Min, Max, MinLength } from 'class-validator';

class Signup {
  @Validate([IsEmail()])
  email: string = '';

  @Validate([IsInt(), Min(18), Max(120)])
  age: number = 0;

  @Validate([MinLength(8)])
  password: string = '';
}
```

### Class-level validation

Apply `@Validate` to the class itself for whole-object validation on construction:

```ts
@Validate(
  z.object({
    email: z.string().email(),
    age: z.number().int().min(18),
  }),
)
class Signup {
  email: string = '';
  age: number = 0;
}

new Signup(); // throws if construction would fail validation
```

### Picking a backend

In `lombok.config.ts`:

```ts
export default defineConfig({
  validate: {
    provider: 'zod', // 'zod' | 'yup' | 'class-validator'
    throwOnError: true, // false to collect errors instead
  },
});
```

Each adapter ships under a sub-path:

```ts
import { ZodAdapter } from 'lombok-typescript/validators/zod';
import { YupAdapter } from 'lombok-typescript/validators/yup';
import { ClassValidatorAdapter } from 'lombok-typescript/validators/class-validator';
```

Adapters are optional peer dependencies; you only install the validator library you actually use.

### Collecting errors instead of throwing

```ts
export default defineConfig({
  validate: {
    provider: 'zod',
    throwOnError: false,
  },
});

const s = new Signup();
s.email = 'not-an-email';

// Errors collected on a per-instance accessor
console.log(s.validationErrors); // [ZodIssue, ...]
```

Useful for form validation where you want to show every error at once, not the first one to throw.

## Composing with data classes

`@NonNull` and `@Validate` both compose cleanly with `@Data` and `@Builder`:

```ts
@Data
@Builder
class Signup {
  @NonNull
  @Validate(z.string().email())
  email: string;

  @NonNull
  @Validate(z.number().int().min(18))
  age: number;
}

Signup.builder().email('john@example.com').age(25).build(); // validates on build()
```

When `@Builder` is in play, validation runs at `build()` time, not at field setter time on the builder. That way you can chain partial state in the builder without tripping over half-set fields.

Next: [06-creational-patterns.md](./06-creational-patterns.md).
