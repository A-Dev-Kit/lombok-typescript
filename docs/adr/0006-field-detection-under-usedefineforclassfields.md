# ADR-06: Field detection under useDefineForClassFields

- **Status:** Open
- **Context:** [tsconfig.json](../../tsconfig.json) has `useDefineForClassFields: true`, which matches modern TS defaults. Under this setting, bare field declarations like `name: string;` produce no runtime emit; they're purely type-level. That breaks runtime decorators that try to introspect the class shape (e.g. a runtime `@NonNull` on `@NonNull name: string;`).
- **Options:**
  1. Document the limitation: codegen handles class-shape introspection, runtime decorators only operate on assignments / initialized fields.
  2. Require initializers for decorated fields (`@NonNull name: string = ''`).
  3. Disable the flag in the user's tsconfig (regress to old behavior).
- **Trade-offs:**
  - Option 1 keeps user code clean but pushes more work into codegen.
  - Option 2 is intrusive: `name: string = ''` looks weird when the field has no real default.
  - Option 3 fights the language; not viable.
- **Recommendation:** Option 1. Codegen-mode decorators (per ADR-03) handle field introspection at compile time, sidestepping the issue entirely. Runtime field decorators (`@NonNull`, `@Validate`) operate via property accessor injection on assignment, so they don't need to know the field exists at construction time.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
