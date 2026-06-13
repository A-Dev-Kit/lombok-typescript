# ADR-15: GoF Decorator pattern naming

- **Status:** Open
- **Context:** TypeScript uses `@decorator` syntax for all decorators. The GoF "Decorator" pattern is a specific structural OOP pattern (wrapping classes to add behavior). Naming a TypeScript decorator `@Decorator` would be a vocabulary collision waiting to happen.
- **Options:**
  1. `@DecoratorPattern`. Explicit but verbose.
  2. `@Wraps`. Concise, verb form, semantically accurate.
  3. `@Decorate`. Verb form, but still echoes "decorator".
  4. `@Wrapper`. Noun form.
  5. `@Compose`. Emphasizes the pattern's compositional nature, but overloads the FP `compose` term.
- **Trade-offs:**

  | Option              | Readability   | Discoverability | Vocabulary clash |
  | ------------------- | ------------- | --------------- | ---------------- |
  | `@DecoratorPattern` | Low (verbose) | High (literal)  | Some             |
  | `@Wraps`            | High          | Medium          | None             |
  | `@Decorate`         | Medium        | Medium          | High             |
  | `@Wrapper`          | High          | Medium          | None             |
  | `@Compose`          | Medium        | Low             | Some (FP)        |

- **Recommendation:** Option 2, `@Wraps`. Reads naturally: `@Wraps(Coffee)` says "this class wraps Coffee". Concise, no clash with TS decorator syntax or FP `compose`. Cross-reference "GoF Decorator Pattern" in JSDoc (`@see`) for searchability.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
