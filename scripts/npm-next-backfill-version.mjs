#!/usr/bin/env node
/**
 * Returns the next npm backfill version (0.2.0–0.10.0) not yet on registry.npmjs.org.
 * Usage: node scripts/npm-next-backfill-version.mjs [overrideVersion]
 * Exit 0 + prints version, or exit 0 with no output and SKIP_BACKFILL=1 when queue is done.
 */
import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const QUEUE = ['0.2.0', '0.3.0', '0.4.0', '0.5.0', '0.6.0', '0.7.0', '0.8.0', '0.9.0', '0.10.0'];

const override = process.argv[2] ?? process.env.BACKFILL_VERSION;

function isPublished(version) {
  try {
    execSync(
      `npm view lombok-typescript@${version} version --registry=https://registry.npmjs.org`,
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN },
      },
    );
    return true;
  } catch {
    return false;
  }
}

function markSkip() {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, 'skip=true\n');
  }
  process.env.SKIP_BACKFILL = '1';
}

function emitVersion(version) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `tag=v${version}\n`);
  }
  console.log(version);
}

if (override) {
  emitVersion(override.replace(/^v/, ''));
  process.exit(0);
}

for (const version of QUEUE) {
  if (!isPublished(version)) {
    emitVersion(version);
    process.exit(0);
  }
}

markSkip();
console.log('npm backfill queue complete (0.2.0–0.10.0 already on registry)');
