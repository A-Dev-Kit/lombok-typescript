#!/usr/bin/env node
/**
 * Idempotent publish to GitHub Packages (skip when version already exists).
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const version =
  process.env.PUBLISH_VERSION ?? JSON.parse(readFileSync('package.json', 'utf8')).version;
const name = '@a-dev-kit/lombok-typescript';

function npmView() {
  try {
    execSync(`npm view ${name}@${version} version --registry=https://npm.pkg.github.com`, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN },
    });
    return true;
  } catch {
    return false;
  }
}

if (npmView()) {
  console.log(`Skip: ${name}@${version} already published`);
  process.exit(0);
}

execSync('pnpm publish --no-git-checks --access public', {
  stdio: 'inherit',
  env: process.env,
});
