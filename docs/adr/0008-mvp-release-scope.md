# ADR-08: MVP / release scope

- **Status:** Open
- **Context:** The recommended v0.1 set in [MVP.md §5 Phase 1](../MVP.md#phase-1--public-preview-mvp-v01) is 8 decorators (`@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Singleton`, `@Prototype`, `@Factory`, `@Memoize`). Is that the right cut?
- **Options:**
  1. **8 cross-cutting** — recommended in MVP.md
  2. **4 minimal** — `@NonNull`, `@ToString`, `@Singleton`, `@Memoize` (one per archetype)
  3. **Full Tier 1 + Creational** — all 7 Lombok Tier 1 + all 5 GoF Creational = 12
- **Trade-offs:**

  | Option | Time-to-preview | Vision proof                  | User impression           |
  | ------ | --------------- | ----------------------------- | ------------------------- |
  | 8      | Medium          | Strong (dual-purpose evident) | Polished                  |
  | 4      | Fast            | Weak (looks like a toy)       | Skeletal                  |
  | 12     | Slow            | Very strong                   | Comprehensive but delayed |

- **Recommendation:** Option 1 (8). Smaller doesn't prove the dual-purpose vision; larger delays the public preview unnecessarily. The 8 chosen each fit a distinct archetype slot (runtime-field, codegen-class, runtime-class, runtime-method, GoF-Creational variations, Lombok-composite).
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
