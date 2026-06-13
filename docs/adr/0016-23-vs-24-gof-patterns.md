# ADR-16: 23 vs 24 GoF patterns

- **Status:** Open
- **Context:** The user mentioned "24 GoF patterns" but the canonical 1994 GoF book lists 23. Common candidates for an unofficial 24th: Object Pool, Null Object, Multiton.
- **Options:**
  1. **Ship 23 canonical only** — strict adherence to the book
  2. **Ship 23 + Object Pool as 24th** — pool is the most commonly cited "missing" pattern
  3. **Ship 23 + Null Object** — useful complement to `@NonNull`
  4. **Ship 23 + ALL three (Object Pool, Null Object, Multiton)** = 26 patterns
- **Trade-offs:**
  - Strict 23 keeps marketing honest ("23 GoF patterns")
  - Adding Object Pool earns the "24" tagline cleanly with a high-utility pattern
  - Adding all three is overcommitment; Multiton is essentially `@Singleton` + `@Flyweight` composition
- **Recommendation:** Option 1 for v0.1 → v1.0. Ship 23 canonical. Document Object Pool as the most common "24th" candidate and ship it as `@Pool` in Phase 7+ (post v1.0). Marketing tagline: "23 GoF patterns + Lombok ergonomics + TypeScript-unique utilities".
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
