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

Publishing is **tag-driven only** — merging to `main` does **not** publish. After every version-bump release PR lands on `main`, maintainers must push a matching git tag.

### Post-merge maintainer checklist (required)

Use this after merging a release PR (e.g. Phase 4b / `v0.8.0`):

1. Confirm CI is **green** on the merge commit on `main`.
2. Confirm `package.json` `version` and `CHANGELOG.md` entry match the intended release (e.g. `0.8.0`).
3. Tag and push from `main`:
   ```bash
   git checkout main && git pull
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```
4. Verify [Publish GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/publish-github-packages.yml) succeeded for the tag.
5. When npm is enabled, verify [Release](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/release.yml) succeeded for the same tag.
6. Update the private planning repo [RELEASE_QUEUE.md](https://github.com/A-Dev-Kit/lombok-typescript-planning/blob/main/RELEASE_QUEUE.md) slot status.

Optional: `gh release create vX.Y.Z --generate-notes`

### GitHub Packages (active)

`@a-dev-kit/lombok-typescript` is published to [GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript) on each `v*.*.*` tag push via `.github/workflows/publish-github-packages.yml`.

The publish workflow sets the version from the tag (`v0.8.0` → `0.8.0`) via `scripts/gh-packages-prepare.mjs`. [gh-packages-publish.mjs](../scripts/gh-packages-publish.mjs) skips if that version already exists.

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
| `v0.7.0` | —         | Phase 4a merge                                       |
| `v0.8.0` | `92c3c1c` | Phase 4b merge                                       |

Versions `0.2.0`/`0.3.0` share the Phase 2 merge tree; `0.5.0`/`0.6.0` share the Phase 3 merge tree.

### npmjs.org (ready — gated)

Public npm publish uses the unscoped name **`lombok-typescript`** (ADR-17). The [release.yml](../.github/workflows/release.yml) workflow is **tag-driven** (same `v*.*.*` tags as GitHub Packages) but **disabled by default** until you enable it:

1. Complete the [npm validation checklist](#npm-validation-checklist) below.
2. Add `NPM_TOKEN` (npm Automation token, publish scope) to repository secrets.
3. Set repository variable `NPM_PUBLISH_ENABLED` to `true` (Settings → Secrets and variables → Actions → Variables).
4. Optional: set `NPM_DIST_TAG` to `next` or `preview` for the first public publish before promoting to `latest`.

Scripts: `scripts/npm-prepare.mjs` (unscoped name + registry) and `scripts/npm-publish.mjs` (idempotent, provenance).

**Forward-only (recommended):** first npm tag `v0.8.0`. Historical `0.1.0`–`0.7.0` remain GitHub Packages–only unless you run a backfill session.

#### npm validation checklist

Run locally before adding `NPM_TOKEN` or setting `NPM_PUBLISH_ENABLED`:

```bash
pnpm install && pnpm build
node scripts/npm-prepare.mjs 0.8.0
npm publish --dry-run --registry=https://registry.npmjs.org
npm pack
# Inspect package/package.json — name must be lombok-typescript
git checkout -- package.json   # restore scoped dev package.json
```

- [ ] Dry-run shows unscoped `lombok-typescript@0.8.0`
- [ ] `npm pack` tarball installs in a clean project
- [ ] Imports work: `lombok-typescript/legacy`, `/stage3`; CLI `lombok-ts --help`
- [ ] plain-ts and nestjs examples work against the packed tarball

## Architecture

The library uses a hybrid runtime + codegen model. Import decorators from `./legacy` or `./stage3` depending on your tsconfig. Run `lombok-ts generate` after changing decorated classes.
