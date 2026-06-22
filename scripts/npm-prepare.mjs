#!/usr/bin/env node
/**
 * Patch package.json for npmjs.org publish (unscoped name + registry).
 * Usage: node scripts/npm-prepare.mjs [version]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const targetVersion = process.argv[2] ?? process.env.PUBLISH_VERSION;
const path = 'package.json';
const pkg = JSON.parse(readFileSync(path, 'utf8'));

pkg.name = 'lombok-typescript';
if (targetVersion) {
  pkg.version = targetVersion;
}
pkg.publishConfig = {
  registry: 'https://registry.npmjs.org',
};

writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
