# ADR-13: GoF coverage strategy

- **Status:** Open
- **Context:** Of the 23 GoF patterns, ~17 translate to "Real" decorators, 1 is a "Helper", and 5 are "Marker-only" (Adapter, Bridge, Facade, Mediator, Interpreter). See [PATTERNS.md](../PATTERNS.md).
- **Options:**
  1. **Ship all 23** — Real where possible, Helper/Marker honestly labeled
  2. **Ship only the ~17 Real ones** — document the rest as "out of scope for decorator implementation"
  3. **Opt-in expansion pack** — Real ones in core, marker decorators in `@lombok-typescript/patterns/markers`
- **Trade-offs:**
  - Option 1 supports the "all 23 GoF patterns" tagline but ships some low-utility decorators
  - Option 2 is honest but loses the marketing/educational story
  - Option 3 is a middle ground but adds package surface complexity
- **Recommendation:** Option 1. Ship all 23 with viability ratings prominent in JSDoc, the docs site, and PATTERNS.md. Educational value of complete GoF coverage outweighs the cost. Marker-only decorators provide TypeScript typing aids (e.g. `@Adapter({ adapts: X, target: Y })` validates structural compatibility) which is non-zero value.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
