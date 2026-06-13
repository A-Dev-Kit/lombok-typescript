# ADR-08: MVP / release scope

- **Status:** Open
- **Context:** The recommended v0.1 set in [MVP.md Phase 1](../MVP.md#phase-1-v01-preview) is 8 decorators: `@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Singleton`, `@Prototype`, `@Factory`, `@Memoize`. Is that the right cut, or smaller, or larger?
- **Options:**
  1. 8 cross-cutting (the current MVP.md recommendation).
  2. 4 minimal: `@NonNull`, `@ToString`, `@Singleton`, `@Memoize`. One per archetype.
  3. Full Tier 1 plus all 5 Creational = 12.
- **Trade-offs:**

  | Option | Time-to-preview | Vision proof            | User impression |
  | ------ | --------------- | ----------------------- | --------------- |
  | 8      | Medium          | Strong, dual-purpose    | Polished        |
  | 4      | Fast            | Weak (looks like a toy) | Skeletal        |
  | 12     | Slow            | Very strong             | Comprehensive   |

- **Recommendation:** Option 1, 8 decorators. Smaller doesn't prove the dual-purpose vision; larger delays the public preview unnecessarily. Each of the 8 covers a distinct archetype: runtime field, codegen class, runtime class, runtime method, GoF Creational variations, Lombok composite.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
