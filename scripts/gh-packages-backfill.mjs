#!/usr/bin/env node
/**
 * Backfill all historical versions to GitHub Packages in ascending semver order.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const VERSIONS = ['0.1.0', '0.2.0', '0.3.0', '0.4.0', '0.5.0', '0.6.0'];
const DEFAULT_BRANCH = process.env.DEFAULT_BRANCH ?? 'main';

function run(cmd, env = {}) {
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
}

function preparePackage(version) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  pkg.name = '@a-dev-kit/lombok-typescript';
  pkg.version = version;
  pkg.publishConfig = { registry: 'https://npm.pkg.github.com' };
  writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
}

for (const version of VERSIONS) {
  console.log(`\n=== Publishing ${version} ===\n`);
  run(`git fetch origin ${DEFAULT_BRANCH} --tags`);
  run('git reset --hard');
  run('git clean -fd -e node_modules');
  run(`git checkout -f v${version}`);
  run(`git checkout origin/${DEFAULT_BRANCH} -- scripts/gh-packages-prepare.mjs scripts/gh-packages-publish.mjs scripts/gh-packages-backfill.mjs`);
  preparePackage(version);
  try {
    run('pnpm install --frozen-lockfile');
  } catch {
    run('pnpm install');
  }
  run('pnpm build');
  const isLatest = version === '0.6.0';
  run('node scripts/gh-packages-publish.mjs', {
    PUBLISH_VERSION: version,
    PUBLISH_AS_LATEST: isLatest ? 'true' : 'false',
  });
}

console.log('\nBackfill complete.\n');
