# ADR-17: Open-source governance

- **Status:** Open
- **Context:** Public OSS project needs an npm name, semver discipline, contribution model, license clarity, and a security posture. [package.json](../../package.json) currently has an empty `author`. Phase 0 added the LICENSE and confirmed `lombok-typescript` is available on npm.

## Sub-decisions

### A. npm package name

1. Unscoped `lombok-typescript` (confirmed available on npm as of 2026-06-12).
2. Scoped `@a-dev-kit/lombok-typescript` (matches the existing GitHub org `A-Dev-Kit`).
3. Brand-new name (`tsbok`, `lomboid`, `tsx-lombok`, etc.).

Recommendation: unscoped `lombok-typescript`. Available, matches the GitHub repo name, maximally discoverable.

### B. Semver pre-1.0 strategy

1. Aggressive 0.x: break freely until v1.0.
2. Conservative: minor bumps only with deprecation warnings.

Recommendation: option 1. v0.x is for iterating; document breaking changes in the CHANGELOG and lock down at v1.0. README states "0.x = breaking changes possible" prominently.

### C. License

Options: MIT, Apache 2.0, dual-licensed.

Recommendation: MIT. Already declared, LICENSE file added in Phase 0.

### D. Contribution model

Recommendation:

- `CONTRIBUTING.md` with PR workflow and Conventional Commits
- `CODE_OF_CONDUCT.md` using [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)
- `SECURITY.md` with a vulnerability disclosure email
- GitHub issue templates for bug, feature, and pattern proposals
- `.github/PULL_REQUEST_TEMPLATE.md` with a checklist (tests, docs, CHANGELOG)

### E. Release process

Recommendation:

- Automated publish on git tag via GitHub Actions (the `release.yml` placeholder is in place; activate before publishing)
- Require npm 2FA on the publishing account
- Use `provenance: true` in `npm publish` (npm 9.5+) for supply-chain trust
- Dependabot or Renovate for dependency updates (Dependabot config added in Phase 0)

- **Decision:** _<blank>_
- **Date decided:** _<blank>_
