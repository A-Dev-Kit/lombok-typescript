#!/usr/bin/env node
/**
 * Idempotent publish to npmjs.org (skip when version already exists).
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const version =
  process.env.PUBLISH_VERSION ?? JSON.parse(readFileSync('package.json', 'utf8')).version;
const name = 'lombok-typescript';
const distTag = process.env.NPM_DIST_TAG ?? 'latest';

function npmView() {
  try {
    execSync(`npm view ${name}@${version} version --registry=https://registry.npmjs.org`, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN },
    });
    return true;
  } catch {
    return false;
  }
}

if (npmView()) {
  console.log(`Skip: ${name}@${version} already published on npm`);
  process.exit(0);
}

const tagFlag = distTag === 'latest' ? '' : ` --tag ${distTag}`;
execSync(`pnpm publish --no-git-checks --provenance --access public${tagFlag}`, {
  stdio: 'inherit',
  env: process.env,
});
