import type { ClassInfo } from '../types.js';
import { builderClassName, hasClassDecorator, toImportPath } from './helpers.js';

export function emitDeclarationShim(
  sourcePath: string,
  classes: readonly ClassInfo[],
  cwd: string,
): string {
  const relSource = toImportPath(sourcePath, cwd);
  const lines: string[] = [
    '// Auto-generated type augmentation by lombok-typescript.',
    '// Do not edit. Regenerate via `lombok-ts generate`.',
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
      lines.push(`  interface ${info.name} {`);
      lines.push(`    static builder(): ${builderName};`);
      lines.push('  }');
    }

    if (hasClassDecorator(info, 'Data')) {
      lines.push(`  interface ${info.name} {`);
      for (const f of info.fields) {
        const g = `get${f.name.charAt(0).toUpperCase()}${f.name.slice(1)}`;
        lines.push(`    ${g}(): ${f.type};`);
        if (!f.isReadonly) {
          const s = `set${f.name.charAt(0).toUpperCase()}${f.name.slice(1)}`;
          lines.push(`    ${s}(value: ${f.type}): void;`);
        }
      }
      lines.push(`    equals(other: ${info.name} | null | undefined): boolean;`);
      lines.push(`    toString(): string;`);
      lines.push('  }');
    } else if (hasClassDecorator(info, 'ToString')) {
      lines.push(`  interface ${info.name} {`);
      lines.push('    toString(): string;');
      lines.push('  }');
    }
  }

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}
