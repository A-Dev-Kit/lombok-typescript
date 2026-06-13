# ADR-03: Runtime vs codegen split

- **Status:** Open
- **Context:** [README.md](../../README.md) calls the approach "hybrid" but doesn't say which decorators go runtime and which go codegen. Without a rule, every new decorator becomes a fresh debate.
- **Options:**
  1. Runtime-first: codegen only when there's no other way.
  2. Codegen-first: runtime only for cross-cutting concerns (`@Memoize`, `@Retry`, etc.).
  3. Per-decorator decision with documented rules.
- **Trade-offs:**
  - Runtime decorators are simpler to write and test, but limited by the `useDefineForClassFields` issue (see ADR-06): bare class field declarations don't emit at runtime.
  - Codegen decorators can shape the class freely but add a build step and have a harder onboarding story.
- **Recommendation:** Option 3, with these rules:
  - Class shape changes (adding methods, generating companion classes): codegen. Examples: `@Builder`, `@Data`, `@Value`, `@With`, `@ToString`, `@Equals`, `@Getter`/`@Setter`, `@Accessors`, `@FieldDefaults`, `@Delegate`, `@TemplateMethod`.
  - Class instance lifecycle (controlling `new`, identity, cloning): runtime. Examples: `@Singleton`, `@Prototype`, `@Flyweight`, `@DeepFreeze`.
  - Method wrapping (intercepting calls): runtime. Examples: `@Memoize`, `@Retry`, `@Debounce`/`@Throttle`, `@Trace`, `@Wraps`.
  - Field validation/transform: runtime. Examples: `@NonNull`, `@Validate` via assignment hooks.
  - Registry-based: hybrid. Runtime registry, codegen-typed lookup. Examples: `@Factory`, `@Strategy`.
  - Pattern marker: no code at all. Examples: `@Adapter`, `@Bridge`, `@Facade`, `@Mediator`, `@Interpreter`.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
