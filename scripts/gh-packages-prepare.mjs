#!/usr/bin/env node
/**
 * Patch package.json for GitHub Packages publish (scoped name + registry).
 * Usage: node scripts/gh-packages-prepare.mjs [version]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const targetVersion = process.argv[2];
const path = 'package.json';
const pkg = JSON.parse(readFileSync(path, 'utf8'));

pkg.name = '@a-dev-kit/lombok-typescript';
if (targetVersion) {
  pkg.version = targetVersion;
}
pkg.publishConfig = {
  registry: 'https://npm.pkg.github.com',
};

writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
