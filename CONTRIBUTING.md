# Contributing to lombok-typescript

Thank you for your interest in contributing.

## Development setup

```bash
git clone https://github.com/A-Dev-Kit/lombok-typescript.git
cd lombok-typescript
pnpm install
pnpm test
pnpm build
```

Requires Node 22+ and pnpm 10+.

### Codecov (coverage badge)

The README coverage badge uses [Codecov](https://about.codecov.io/) (free for public repos).

**One-time setup (repo admin):**

1. Sign in at [codecov.io](https://codecov.io) with GitHub and enable `A-Dev-Kit/lombok-typescript`.
2. CI uploads `coverage/lcov.info` on every push to `main` via GitHub OIDC (`use_oidc: true` in `.github/workflows/ci.yml`) — no `CODECOV_TOKEN` secret is required for public repos.

If uploads still fail, add a repository upload token as the GitHub Actions secret `CODECOV_TOKEN` (Codecov repo settings → copy token).

### Documentation site

```bash
pnpm --dir docs-site install
pnpm --dir docs-site dev    # local preview
pnpm --dir docs-site build  # production build (also run in CI / GitHub Pages)
```

Source lives under `docs-site/`. Deployed to [a-dev-kit.github.io/lombok-typescript](https://a-dev-kit.github.io/lombok-typescript/).

## Pull request workflow

1. Fork the repository and create a feature branch from `main`.
2. Make focused changes with tests (target **95%+** coverage on touched code).
3. Run `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, and `pnpm test:coverage`.
4. Update `CHANGELOG.md` under **Unreleased** for user-visible changes.
5. Open a PR using the template checklist.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `test:`, `chore:`, etc.

## Release process

### GitHub Packages (active)

`@a-dev-kit/lombok-typescript` is published to [GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript) on each `v*.*.*` tag push via `.github/workflows/publish-github-packages.yml`.

To publish a new version after merging a release PR:

1. Bump `package.json` and `CHANGELOG.md`.
2. `git tag -a vX.Y.Z -m "vX.Y.Z"` and `git push origin vX.Y.Z`.
3. CI publishes automatically.

#### Git tag map (retrospective releases)

Logical release queue versions and the git commits used for GitHub Packages backfill:

| Tag      | Commit    | Notes                                                |
| -------- | --------- | ---------------------------------------------------- |
| `v0.1.0` | `490b5d4` | Phase 1 merge                                        |
| `v0.2.0` | `32ef000` | Phase 2 merge (2a scope); version patched at publish |
| `v0.3.0` | `32ef000` | Phase 2 merge (2b scope); version patched at publish |
| `v0.4.0` | `32ef000` | Phase 2 merge; `package.json` was `0.4.0`            |
| `v0.5.0` | `bd4118d` | Phase 3 merge (3a scope); version patched at publish |
| `v0.6.0` | `bd4118d` | Phase 3 merge; `package.json` was `0.6.0`            |

Versions `0.2.0`/`0.3.0` share the Phase 2 merge tree; `0.5.0`/`0.6.0` share the Phase 3 merge tree. This matches the release-queue slots when those phases landed as single PRs.

### npmjs.org (deferred)

Public npm publish is **not** on every merge. Maintainers accumulate versions in a private release queue and publish in batch via GitHub Actions when the queue is full. The `release.yml` workflow stays disabled until then.

When active, publishing is tag-driven: push `v*.*.*` tags to trigger CI publish with npm provenance to `registry.npmjs.org` as unscoped `lombok-typescript`.

## Architecture

The library uses a hybrid runtime + codegen model. Import decorators from `./legacy` or `./stage3` depending on your tsconfig. Run `lombok-ts generate` after changing decorated classes.
