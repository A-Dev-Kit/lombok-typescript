# ADR-16: 23 vs 24 GoF patterns

- **Status:** Open
- **Context:** The original idea referenced "24 GoF patterns" but the canonical 1994 GoF book lists 23. Common candidates for an unofficial 24th: Object Pool, Null Object, Multiton.
- **Options:**
  1. Ship 23 canonical only. Strict adherence to the book.
  2. Ship 23 + Object Pool as the 24th. Pool is the most commonly cited "missing" pattern.
  3. Ship 23 + Null Object. Useful complement to `@NonNull`.
  4. Ship 23 + all three (Object Pool, Null Object, Multiton) for 26 total.
- **Trade-offs:**
  - Strict 23 keeps the marketing honest ("23 GoF patterns").
  - Adding Object Pool earns the "24" tagline cleanly with a high-utility pattern.
  - Adding all three is overcommitment; Multiton is essentially `@Singleton` + `@Flyweight` composition.
- **Recommendation:** Option 1 for v0.1 through v1.0. Document Object Pool as the most defensible "24th" candidate and ship it as `@Pool` in Phase 7+ (post v1.0). Tagline reads: "23 GoF patterns + Lombok ergonomics + TS-only utilities".
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
