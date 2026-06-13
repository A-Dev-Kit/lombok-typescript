# ADR-07: Decorator composition rules

- **Status:** Open
- **Context:** Decorators stack. `@Data + @Value` conflict semantically (mutable vs immutable). `@Builder + @Data` need a defined codegen ordering. `@Data` already produces `toString()`, so stacking `@ToString` on top is redundant or contradictory. Without rules, behavior is undefined.
- **Options:**
  1. **Fail loudly** — codegen analyzer detects conflicts and emits compile-time errors
  2. **Last decorator wins** — silent merge with documented precedence
  3. **Precedence table** — explicit, layered application order
- **Recommendation:** Option 1 + Option 3 combined:
  - **Conflicts → error** (`@Data + @Value`, `@UtilityClass + anything-data-related`)
  - **Composition order (when compatible)** — apply in this sequence regardless of source order:
    1. `@FieldDefaults` (sets baseline modifiers)
    2. `@Data` / `@Value` (generates accessors, ctor, toString, equals)
    3. Field decorators (`@NonNull`, `@Getter`, `@Setter`, `@With`)
    4. `@Builder` (consumes ctor + fields)
    5. `@Log` (independent — adds `this.log`)
    6. Runtime wrappers (`@Memoize`, `@Trace`, `@Singleton`, `@Prototype`)
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
