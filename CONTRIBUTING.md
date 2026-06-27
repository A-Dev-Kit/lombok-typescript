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

Optional peer dependencies (`class-validator`, `zod`, `yup`, etc.) may be auto-installed locally via pnpm `autoInstallPeers` for integration tests. They are **not** bundled in the published npm tarball (`files` is limited to `dist`, `README.md`, `LICENSE`).

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

Publishing to GitHub Packages and npmjs.org is **fully automated** after you push the tag. Maintainers do not run publish scripts from this repository.

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

### Install channels

| Channel         | Command                                          |
| --------------- | ------------------------------------------------ |
| GitHub Packages | `npm install @a-dev-kit/lombok-typescript@X.Y.Z` |
| npm stable      | `npm install lombok-typescript`                  |
| npm preview     | `npm install lombok-typescript@preview`          |

## Architecture

The library uses a hybrid runtime + codegen model. Import decorators from `./legacy` or `./stage3` depending on your tsconfig. Run `lombok-ts generate` after changing decorated classes.
