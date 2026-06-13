# ADR-07: Decorator composition rules

- **Status:** Open
- **Context:** Decorators stack. `@Data + @Value` conflict (mutable vs immutable). `@Builder + @Data` need a defined codegen ordering. `@Data` already produces `toString()`, so stacking `@ToString` on top is either redundant or contradictory. Without rules, the behavior is undefined.
- **Options:**
  1. Fail loudly: the codegen analyzer detects conflicts and emits compile-time errors.
  2. Last decorator wins: silent merge with documented precedence.
  3. Precedence table: explicit, layered application order.
- **Recommendation:** Combine options 1 and 3.
  - Conflicts produce a compile-time error: `@Data + @Value`, `@UtilityClass + anything-data-related`.
  - Compatible decorators apply in this order, regardless of source order:
    1. `@FieldDefaults` (sets baseline modifiers)
    2. `@Data` / `@Value` (generates accessors, ctor, toString, equals)
    3. Field decorators: `@NonNull`, `@Getter`, `@Setter`, `@With`
    4. `@Builder` (consumes the ctor and fields)
    5. `@Log` (independent, just adds `this.log`)
    6. Runtime wrappers: `@Memoize`, `@Trace`, `@Singleton`, `@Prototype`
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
