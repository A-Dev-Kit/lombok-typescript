#!/usr/bin/env node
/**
 * Idempotent publish of @a-dev-kit/lombok-typescript (and nestjs satellite on v1+)
 * to GitHub Packages. Intended for release-on-tag.yml using GITHUB_TOKEN.
 *
 * Env: PUBLISH_VERSION, NODE_AUTH_TOKEN
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.env.PUBLISH_VERSION;
const token = process.env.NODE_AUTH_TOKEN;

if (!version) {
  console.error('publish-github-packages: PUBLISH_VERSION is required');
  process.exit(1);
}
if (!token) {
  console.error('publish-github-packages: NODE_AUTH_TOKEN is required');
  process.exit(1);
}

const registry = 'https://npm.pkg.github.com';
const env = { ...process.env, NODE_AUTH_TOKEN: token };

function isPublished(name) {
  try {
    execSync(`npm view ${name}@${version} version --registry=${registry}`, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
    });
    return true;
  } catch {
    return false;
  }
}

function publish(cwd, name) {
  if (isPublished(name)) {
    console.log(`Skip: ${name}@${version} already on GitHub Packages`);
    return;
  }
  execSync('pnpm publish --no-git-checks --access public', {
    stdio: 'inherit',
    env,
    cwd,
  });
  console.log(`Published ${name}@${version}`);
}

const rootPkgPath = 'package.json';
const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'));
rootPkg.name = '@a-dev-kit/lombok-typescript';
rootPkg.version = version;
rootPkg.publishConfig = { registry };
writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);

publish(process.cwd(), '@a-dev-kit/lombok-typescript');

const isV1Plus =
  version === '1.0.0' ||
  version.startsWith('1.') ||
  Number.parseInt(version.split('.')[0], 10) >= 1;

if (isV1Plus) {
  const nestPkgPath = 'packages/nestjs/package.json';
  const nestPkg = JSON.parse(readFileSync(nestPkgPath, 'utf8'));
  nestPkg.version = version;
  nestPkg.publishConfig = { registry };
  writeFileSync(nestPkgPath, `${JSON.stringify(nestPkg, null, 2)}\n`);
  publish('packages/nestjs', '@lombok-typescript/nestjs');
}
