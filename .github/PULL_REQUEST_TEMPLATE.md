## Summary

<!-- What changed and why -->

## Checklist

- [ ] Tests added or updated (`pnpm test:coverage` ≥ 95% on changed code)
- [ ] `pnpm typecheck` / `pnpm lint` / `pnpm format:check` pass
- [ ] CHANGELOG.md updated (Unreleased section)
- [ ] Docs updated if public API changed

## Maintainer (release PRs only)

Merge alone does **not** publish. After merge to `main`:

- [ ] CI green on the merge commit
- [ ] `package.json` version matches the release (e.g. `0.8.0`)
- [ ] Tag pushed: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`
- [ ] [Publish GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/actions/workflows/publish-github-packages.yml) workflow succeeded
- [ ] Planning repo `RELEASE_QUEUE.md` slot updated

See [CONTRIBUTING.md — Release process](./CONTRIBUTING.md#release-process).
