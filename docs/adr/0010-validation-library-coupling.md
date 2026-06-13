# ADR-10: Validation library coupling

- **Status:** Open
- **Context:** `@Validate(z.string().email())` could ship Zod-only, or pluggable. Zod is the obvious target, but Yup and class-validator are entrenched (NestJS uses class-validator officially).
- **Options:**
  1. Zod-only: pick the strongest schema library, ship one path.
  2. Generic adapter contract: define `ValidatorAdapter<TSchema, TValue>`, ship `ZodAdapter`, `YupAdapter`, `ClassValidatorAdapter`.
  3. BYOV (bring your own validator): `@Validate(customValidatorFn)` only.
- **Trade-offs:**

  | Option           | Effort | NestJS interop                   | User flexibility     |
  | ---------------- | ------ | -------------------------------- | -------------------- |
  | Zod-only         | Low    | Friction                         | Locked in            |
  | Adapter contract | Medium | Native (class-validator adapter) | High                 |
  | BYOV             | Low    | Native                           | High but boilerplate |

- **Recommendation:** Option 2. Define a `ValidatorAdapter` interface, ship `ZodAdapter` (default), `YupAdapter`, `ClassValidatorAdapter` as separate exports under `lombok-typescript/validators/*`. The user opts into one via [src/config.ts](../../src/config.ts). Each adapter is an optional peer dep, same pattern as ADR-09.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
