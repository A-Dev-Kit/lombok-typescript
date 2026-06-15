import { dirname } from 'node:path';
import type { ClassInfo } from '../types.js';
import { builderClassName, hasClassDecorator, toImportPath } from './helpers.js';

export function emitDeclarationShim(
  sourcePath: string,
  companionOutputPath: string,
  classes: readonly ClassInfo[],
): string {
  const relSource = toImportPath(sourcePath, dirname(companionOutputPath));
  const lines: string[] = [
    '// Auto-generated type augmentation by lombok-typescript.',
    '// Do not edit. Regenerate via `lombok-ts generate`.',
    '',
    'export {};',
    '',
    `declare module '${relSource}' {`,
  ];

  for (const info of classes) {
    if (hasClassDecorator(info, 'Builder')) {
      const builderName = builderClassName(info.name);
      lines.push(`  export class ${builderName} {`);
      lines.push(`    static builder(): ${builderName};`);
      for (const f of info.fields) {
        lines.push(`    ${f.name}(value: ${f.type}): ${builderName};`);
      }
      lines.push(`    build(): ${info.name};`);
      lines.push('  }');
      lines.push('');
    }

    if (hasClassDecorator(info, 'Builder')) {
      const builderName = builderClassName(info.name);
      lines.push(`  export class ${info.name} {`);
      lines.push(`    static builder(): ${builderName};`);
      lines.push('  }');
      lines.push('');
    }

    const augments: string[] = [];
    if (hasClassDecorator(info, 'Data')) {
      for (const f of info.fields) {
        const g = `get${f.name.charAt(0).toUpperCase()}${f.name.slice(1)}`;
        augments.push(`    ${g}(): ${f.type};`);
        if (!f.isReadonly) {
          const s = `set${f.name.charAt(0).toUpperCase()}${f.name.slice(1)}`;
          augments.push(`    ${s}(value: ${f.type}): void;`);
        }
      }
      augments.push(`    equals(other: ${info.name} | null | undefined): boolean;`);
      augments.push(`    toString(): string;`);
    } else if (hasClassDecorator(info, 'ToString')) {
      augments.push('    toString(): string;');
    }

    if (augments.length > 0) {
      lines.push(`  interface ${info.name} {`);
      lines.push(...augments);
      lines.push('  }');
    }
  }

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}
