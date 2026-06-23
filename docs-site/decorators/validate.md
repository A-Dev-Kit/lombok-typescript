# @Validate

**Schema validation** on field assignment or class construction via pluggable adapters (Zod, Yup, class-validator).

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Hybrid             |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Partial (`@Builder`) |

## Example (Zod)

```ts
import { Validate } from 'lombok-typescript/legacy';
import { z } from 'zod';
import 'lombok-typescript/validators/zod';

class Signup {
  @Validate(z.string().email())
  email: string = '';

  @Validate(z.number().int().min(18))
  age: number = 0;
}
```

## Adapters

Install the validator library you use, then import its adapter once:

```ts
import 'lombok-typescript/validators/zod';
import 'lombok-typescript/validators/yup';
import 'lombok-typescript/validators/class-validator';
```

## Collecting errors

Pass `{ throwOnError: false }` to collect errors on `instance.validationErrors` instead of throwing:

```ts
@Validate(z.string().email(), { throwOnError: false })
email: string = '';
```

## Builder integration

With `@Data` + `@Builder`, field validation runs at `build()` time (codegen emits `runValidation` calls). Builder setters stay unvalidated so you can chain partial state.

## Config note

Per-decorator `options` override defaults. Global `validate` settings in `lombok.config.ts` apply to CLI/codegen paths in v0.9.0; runtime decorators default to `zod` unless you pass `provider` in options.
