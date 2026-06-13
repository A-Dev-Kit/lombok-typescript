# ADR-09: Logger backend dependency strategy

- **Status:** Open
- **Context:** `@Log` claims to support `console`, `winston`, `pino`, `bunyan`. How are these distributed?
- **Options:**
  1. Hard peer deps: the user must install whichever logger they use.
  2. Optional peer deps via `peerDependenciesMeta: { optional: true }`.
  3. Dynamic resolution: `await import('winston')` at runtime.
  4. BYOL (bring your own logger): the user passes the logger instance, no built-in adapters.
- **Trade-offs:**
  - Hard peer deps cause `npm install` warnings for users who only need `console`.
  - Optional peer deps are clean but assume Node 16+ (already required) and pnpm/npm 7+.
  - Dynamic resolution is brittle and bundler-unfriendly.
  - BYOL is most flexible but pushes adapter writing to the user.
- **Recommendation:** Combine options 2 and 4. Built-in adapters for `console` (default), `winston`, `pino`, `bunyan` declared as optional peer deps. BYOL escape hatch via `@Log({ logger: customInstance })` for anything else (Nest's Logger, log4js, Sentry breadcrumb logger, etc.).
- **Decision:** _<blank>_
- **Date decided:** _<blank>_
