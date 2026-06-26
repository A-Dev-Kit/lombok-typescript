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

## CI

Push and pull request events run automated checks via GitHub Actions. All required status checks must pass before merge.

### Codecov (coverage badge)

The README coverage badge uses [Codecov](https://about.codecov.io/) (free for public repos).

**One-time setup (repo admin):**

1. Sign in at [codecov.io](https://codecov.io) with GitHub and enable `A-Dev-Kit/lombok-typescript`.
2. CI uploads `coverage/lcov.info` on every push to `main`.

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

1. Confirm all **required CI checks** are **green** on the merge commit on `main`.
2. Confirm `package.json` `version` and `CHANGELOG.md` entry match the intended release (e.g. `0.8.0`).
3. Tag and push from `main`:
   ```bash
   git checkout main && git pull
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```
4. Verify the new version appears on [GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript).
5. When npm publish is enabled, verify the matching version on [npmjs.org](https://www.npmjs.com/package/lombok-typescript).

Optional: `gh release create vX.Y.Z --generate-notes`

### GitHub Packages

`@a-dev-kit/lombok-typescript` is published to [GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript) on each `v*.*.*` tag push.

The publish workflow sets the version from the tag (`v0.8.0` → `0.8.0`) via `scripts/gh-packages-prepare.mjs`. [gh-packages-publish.mjs](../scripts/gh-packages-publish.mjs) skips if that version already exists.

### npmjs.org

Public npm publish uses the unscoped name **`lombok-typescript`**.

Dist-tags:

- **`latest`** — current stable release
- **`preview`** — one version ahead of `latest`

Scripts (maintainers):

- `scripts/npm-prepare.mjs` — unscoped name, version, consumer `README.md` from `docs/npm-readme/{version}.md`
- `scripts/npm-publish.mjs` — idempotent publish (no provenance attestation)
- `scripts/validate-npm-readme.mjs` — blocks internal/stale copy on npm
- `scripts/npm-backfill-plan.mjs` — next `latest` / `preview` pair and publish target
- `scripts/npm-apply-dist-tags.mjs` — `npm dist-tag add` for `latest` and `preview`

Consumer-facing npm readmes live in [`docs/npm-readme/`](../docs/npm-readme/). Regenerate templates: `node scripts/generate-npm-readmes.mjs`.

npm readmes must be **consumer-only**: install, decorators in that release, quick start, CLI summary, docs-site link. Do **not** include repo paths (`.lombok/`, `coverage/`), release-queue/version-chain wording, internal CI links, or codegen internals (`applyAllGenerated`). `validate-npm-readme.mjs` enforces this before publish.

#### npm validation checklist

Run locally before publishing:

```bash
pnpm install && pnpm build
node scripts/npm-prepare.mjs 0.10.0
node scripts/validate-npm-readme.mjs 0.10.0
npm publish --dry-run --registry=https://registry.npmjs.org
npm pack
# Inspect package/package.json — name must be lombok-typescript
git checkout -- package.json README.md
```

- [ ] Dry-run shows unscoped `lombok-typescript@0.8.0`
- [ ] `npm pack` tarball installs in a clean project
- [ ] Imports work: `lombok-typescript/legacy`, `/stage3`; CLI `lombok-ts --help`
- [ ] plain-ts and nestjs examples work against the packed tarball

## Architecture

The library uses a hybrid runtime + codegen model. Import decorators from `./legacy` or `./stage3` depending on your tsconfig. Run `lombok-ts generate` after changing decorated classes.
