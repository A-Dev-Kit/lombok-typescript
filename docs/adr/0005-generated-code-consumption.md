# ADR-05: Generated-code consumption

- **Status:** Open
- **Context:** If codegen produces a `UserBuilder` class in `.lombok/`, how does `User.builder()` become typed in the consumer's IDE without them importing anything?
- **Options:**
  1. **Declaration merging** — codegen emits `.d.ts` files with `declare module` augmentation
  2. **Explicit re-import** — user adds `import './lombok-generated';` once
  3. **Class extension at codegen time** — codegen modifies the source class in place (or alongside)
- **Trade-offs:**
  - Declaration merging is invisible to the user but harder to debug when types go wrong
  - Explicit import is debuggable but adds boilerplate that defeats the "Lombok magic" feel
  - Class extension is most Lombok-faithful but requires either source rewriting (intrusive) or alongside-class generation
- **Recommendation:** Option 1 — declaration merging via auto-generated `.d.ts` files. Each generated module emits `declare module './<source>'` augmentation. User imports nothing extra. Add a `lombok-typescript/types-shim` file the user references in their `tsconfig.json` `include`.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
