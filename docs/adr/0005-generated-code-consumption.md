# ADR-05: Generated-code consumption

- **Status:** Open
- **Context:** If codegen produces a `UserBuilder` class in `.lombok/`, how does `User.builder()` show up as typed in the consumer's IDE without them importing anything?
- **Options:**
  1. Declaration merging: codegen emits `.d.ts` files with `declare module` augmentation.
  2. Explicit re-import: the user adds `import './lombok-generated';` once.
  3. Class extension at codegen time: codegen modifies the source class in place, or alongside.
- **Trade-offs:**
  - Declaration merging is invisible but harder to debug when types go wrong.
  - Explicit imports are debuggable but kill the Lombok-style invisibility.
  - Class extension is most Lombok-faithful but requires either source rewriting (intrusive) or alongside-class generation.
- **Recommendation:** Option 1. Auto-generated `.d.ts` files with `declare module './<source>'` augmentation. The user imports nothing extra. A `lombok-typescript/types-shim` referenced in the user's tsconfig `include` covers the loader path.
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
