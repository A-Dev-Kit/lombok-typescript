# ADR-03: Runtime vs codegen split rules

- **Status:** Open
- **Context:** [README.md](../../README.md) declares a "hybrid approach" but doesn't say which decorators belong on which side. Without rules, every new decorator becomes a fresh argument.
- **Options:**
  1. **Runtime-first** — use codegen only when a decorator literally cannot work at runtime
  2. **Codegen-first** — use runtime only for cross-cutting concerns (`@Memoize`, `@Retry`, etc.)
  3. **Per-decorator decision with documented rules**
- **Trade-offs:**
  - Runtime decorators are simpler to author and test, but are limited by the `useDefineForClassFields` issue (see ADR-06) and by the fact that bare class field declarations don't emit at runtime
  - Codegen decorators can shape the class fully but require a build step and have a harder onboarding story
- **Recommendation:** Option 3 with these rules:
  - **Class shape changes** (adding methods, generating companion classes): **Codegen** — `@Builder`, `@Data`, `@Value`, `@With`, `@ToString`, `@Equals`, `@Getter/@Setter`, `@Accessors`, `@FieldDefaults`, `@Delegate`, `@TemplateMethod`
  - **Class instance lifecycle** (controlling `new`, identity, cloning): **Runtime** — `@Singleton`, `@Prototype`, `@Flyweight`, `@DeepFreeze`
  - **Method wrapping** (intercepting calls): **Runtime** — `@Memoize`, `@Retry`, `@Debounce/@Throttle`, `@Trace`, `@Wraps`
  - **Field validation/transform**: **Runtime** — `@NonNull`, `@Validate` (on assignment hooks)
  - **Registry-based**: **Hybrid** — `@Factory`, `@Strategy` (runtime registry, codegen-typed lookup)
  - **Pattern marker**: **No code** — `@Adapter`, `@Bridge`, `@Facade`, `@Mediator`, `@Interpreter`
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
