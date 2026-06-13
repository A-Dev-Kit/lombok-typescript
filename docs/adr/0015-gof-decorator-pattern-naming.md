# ADR-15: GoF Decorator pattern naming

- **Status:** Open
- **Context:** TypeScript uses `@decorator` syntax for ALL decorators. The GoF "Decorator" pattern is a specific structural OOP pattern (wrapping classes to add behavior). Naming a TypeScript decorator `@Decorator` would create severe vocabulary collision.
- **Options:**
  1. **`@DecoratorPattern`** — explicit but verbose
  2. **`@Wraps`** — concise, verb form, semantically accurate
  3. **`@Decorate`** — verb form but still echoes "decorator"
  4. **`@Wrapper`** — noun form
  5. **`@Compose`** — emphasizes the pattern's compositional nature
- **Trade-offs:**

  | Option              | Readability   | Discoverability | Vocabulary clash   |
  | ------------------- | ------------- | --------------- | ------------------ |
  | `@DecoratorPattern` | Low (verbose) | High (literal)  | Some               |
  | `@Wraps`            | High          | Medium          | None               |
  | `@Decorate`         | Medium        | Medium          | High               |
  | `@Wrapper`          | High          | Medium          | None               |
  | `@Compose`          | Medium        | Low             | Some (FP overload) |

- **Recommendation:** Option 2 (`@Wraps`). Reads naturally — `@Wraps(Coffee)` means "this class wraps Coffee". Concise. No clash with TS decorator vocabulary or FP `compose`. Always document under "GoF Decorator Pattern" with a `@see` JSDoc cross-reference for searchability.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
