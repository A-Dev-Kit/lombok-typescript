import { dirname } from 'node:path';
import type { ClassInfo } from '../types.js';
import {
  builderClassName,
  fieldHasDecorator,
  getterName,
  getDelegateMethods,
  hasClassDecorator,
  setterName,
  wantsEquals,
  wantsGetter,
  wantsSetter,
  wantsToString,
  wantsWithMethods,
  withMethodName,
  toImportPath,
} from './helpers.js';

function emitDeclarationModuleBlock(relSource: string, classes: readonly ClassInfo[]): string {
  const lines: string[] = [`declare module '${relSource}' {`];

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
      lines.push(`  namespace ${info.name} {`);
      lines.push(`    export function builder(): ${builderName};`);
      lines.push('  }');
      lines.push('');
    }

    const augments: string[] = [];
    for (const f of info.fields) {
      if (wantsGetter(info, f)) {
        augments.push(`    ${getterName(f.name)}(): ${f.type};`);
      }
      if (wantsSetter(info, f)) {
        const ret = hasClassDecorator(info, 'Accessors') ? info.name : 'void';
        augments.push(`    ${setterName(f.name)}(value: ${f.type}): ${ret};`);
      }
      if (wantsWithMethods(info, f)) {
        augments.push(`    ${withMethodName(f.name)}(value: ${f.type}): ${info.name};`);
      }
      if (fieldHasDecorator(f, 'Delegate')) {
        for (const method of getDelegateMethods(f)) {
          augments.push(`    ${method}(...args: unknown[]): unknown;`);
        }
      }
    }

    if (wantsEquals(info)) {
      augments.push(`    equals(other: ${info.name} | null | undefined): boolean;`);
    }
    if (wantsToString(info)) {
      augments.push('    toString(): string;');
    }

    if (augments.length > 0) {
      lines.push(`  interface ${info.name} {`);
      lines.push(...augments);
      lines.push('  }');
    }

    if (hasClassDecorator(info, 'Equals')) {
      lines.push(`  namespace ${info.name} {`);
      lines.push(
        `    export function equals(a: ${info.name} | null | undefined, b: ${info.name} | null | undefined): boolean;`,
      );
      lines.push('  }');
      lines.push('');
    }
  }

  lines.push('}');
  return lines.join('\n');
}

/** Standalone augmentation file (no sibling `.ts`, so TypeScript loads it). */
export function emitDeclarationShim(
  sourcePath: string,
  companionOutputPath: string,
  classes: readonly ClassInfo[],
): string {
  const relSource = toImportPath(sourcePath, dirname(companionOutputPath));
  const moduleBlock = emitDeclarationModuleBlock(relSource, classes);
  return [
    '// Auto-generated type augmentation by lombok-typescript.',
    '// Do not edit. Regenerate via `lombok-ts generate`.',
    '',
    'export {};',
    '',
    moduleBlock,
    '',
  ].join('\n');
}
