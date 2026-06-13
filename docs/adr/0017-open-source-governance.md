# ADR-17: Open-source governance

- **Status:** Open
- **Context:** Public OSS project needs npm name, semver discipline, contribution model, license clarity, security posture. Currently [package.json](../../package.json) has empty `author`, no LICENSE file before Phase 0 (added in Phase 0), and the package name `lombok-typescript` was unverified on npm before Phase 0 (now confirmed available).

## Sub-decisions

### A. npm package name

- **Options:**
  1. Unscoped `lombok-typescript` (confirmed available on npm as of 2026-06-12)
  2. Scoped `@a-dev-kit/lombok-typescript` (matches existing GitHub org `A-Dev-Kit`)
  3. Brand-new name (`tsbok`, `lomboid`, `tsx-lombok`, etc.)
- **Recommendation:** Unscoped `lombok-typescript` — already available, matches the GitHub repo, maximally discoverable.

### B. Semver pre-1.0 strategy

- **Options:**
  1. Aggressive 0.x — break freely until v1.0
  2. Conservative — minor bumps only with deprecation warnings
- **Recommendation:** Option 1. v0.x is for iterating; document breaking changes in CHANGELOG; lock down at v1.0. Communicate "0.x = breaking changes possible" prominently in README.

### C. License

- **Options:** MIT / Apache 2.0 / dual-licensed
- **Recommendation:** MIT (already declared). LICENSE file added in Phase 0.

### D. Contribution model

- **Recommendation:**
  - `CONTRIBUTING.md` with PR workflow, commit message conventions (Conventional Commits)
  - `CODE_OF_CONDUCT.md` using the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)
  - `SECURITY.md` with vulnerability disclosure email
  - GitHub issue templates for bug / feature / pattern proposal
  - `.github/PULL_REQUEST_TEMPLATE.md` with checklist (tests, docs, CHANGELOG)

### E. Release process

- **Recommendation:**
  - Automated publish on git tag via GitHub Actions (`.github/workflows/release.yml` placeholder added in Phase 0; activate before publishing)
  - Require npm 2FA on the publishing account
  - Use `provenance: true` in `npm publish` (npm 9.5+) for supply-chain trust
  - Dependabot or Renovate for dependency updates (Dependabot config added in Phase 0)

- **Decision:** _<blank>_
- **Date decided:** _<blank>_
