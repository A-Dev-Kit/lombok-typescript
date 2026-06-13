#!/usr/bin/env node
// Add the `#!/usr/bin/env node` shebang to the built CLI files and chmod +x.
// tsup doesn't do this automatically when the same entry has both ESM and CJS.

import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SHEBANG = '#!/usr/bin/env node\n';
const cliFiles = ['dist/cli/index.js', 'dist/cli/index.cjs'];

for (const rel of cliFiles) {
  const file = resolve(rel);
  if (!existsSync(file)) continue;
  const content = readFileSync(file, 'utf8');
  if (!content.startsWith('#!')) {
    writeFileSync(file, SHEBANG + content);
  }
  chmodSync(file, 0o755);
  console.log(`prepared CLI: ${rel}`);
}
