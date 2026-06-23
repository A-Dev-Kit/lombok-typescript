import { dirname, relative } from 'node:path';
import { validateAllClassCompositions } from '../../decorators/shared/composition.js';
import type { ClassInfo } from '../types.js';
import { emitAccessorApplyAssignments, emitAccessorFns } from './accessors-emit.js';
import { emitAbstractFactoryMixin } from './abstract-factory-emit.js';
import { emitBuilderClass } from './builder.js';
import { emitDeclarationShim } from './declaration.js';
import { emitDelegateApplyAssignments, emitDelegateFns } from './delegate-emit.js';
import { emitEqualsFn, emitEqualsStaticFn } from './equals-emit.js';
import {
  builderClassName,
  getAbstractFactoryProducts,
  hasClassDecorator,
  hasCodegenClassDecorator,
  needsValidateImport,
  needsZodImport,
  toImportPath,
  visibleFields,
  wantsEquals,
  wantsToString,
  wantsWithMethods,
  withMethodName,
} from './helpers.js';
import { emitWithFns } from './with-emit.js';
import { emitTemplateMethodApplyAssignment, emitTemplateMethodFn } from './template-method-emit.js';
import { emitSerializableApplyAssignment, emitSerializableMethods } from './serializable-emit.js';
import { emitVisitableAcceptApplyAssignment, emitVisitableAcceptFn } from './visitor-emit.js';

function emitImports(classes: readonly ClassInfo[], importPath: string): string {
  const names = classes.filter(hasCodegenClassDecorator).map((c) => c.name);
  const productTypes = new Set<string>();
  for (const info of classes) {
    if (hasClassDecorator(info, 'AbstractFactory')) {
      for (const product of getAbstractFactoryProducts(info)) {
        productTypes.add(product);
      }
    }
  }
  const importLines: string[] = [];
  if (names.length > 0) {
    importLines.push(`import { ${names.join(', ')} } from '${importPath}';`);
  }
  const extraProducts = [...productTypes].filter((p) => !names.includes(p));
  if (extraProducts.length > 0) {
    importLines.push(`import type { ${extraProducts.join(', ')} } from '${importPath}';`);
  }
  if (needsValidateImport(classes)) {
    importLines.push(
      `import { runValidation } from '@a-dev-kit/lombok-typescript/validators/zod';`,
    );
  }
  if (needsZodImport(classes)) {
    importLines.push(`import { z } from 'zod';`);
  }
  if (importLines.length === 0) return '';
  return importLines.join('\n') + '\n\n';
}

function emitToStringFn(info: ClassInfo): string {
  if (!wantsToString(info)) return '';
  const fields = visibleFields(info);
  const parts = fields.map((f) => `${f.name}=\${String(this.${f.name})}`).join(', ');
  return `
function ${info.name}_toString(this: ${info.name}): string {
  return \`${info.name}(${parts})\`;
}`.trim();
}

function emitApplyMixin(info: ClassInfo): string {
  const assignments: string[] = [];

  assignments.push(...emitAccessorApplyAssignments(info));
  assignments.push(...emitDelegateApplyAssignments(info));

  if (wantsEquals(info)) {
    assignments.push(`prototype.equals = ${info.name}_equals;`);
  }

  if (wantsToString(info)) {
    assignments.push(`prototype.toString = ${info.name}_toString;`);
  }

  for (const field of info.fields) {
    if (wantsWithMethods(info, field)) {
      assignments.push(
        `prototype.${withMethodName(field.name)} = ${info.name}_${withMethodName(field.name)};`,
      );
    }
  }

  if (hasClassDecorator(info, 'Builder')) {
    const bName = builderClassName(info.name);
    assignments.push(
      `(ctor as typeof ${info.name} & { builder(): ${bName} }).builder = ${info.name}_builder;`,
    );
  }

  if (hasClassDecorator(info, 'Equals')) {
    assignments.push(
      `(ctor as typeof ${info.name} & { equals(a: ${info.name} | null | undefined, b: ${info.name} | null | undefined): boolean }).equals = ${info.name}_equalsStatic;`,
    );
  }

  const templateApply = emitTemplateMethodApplyAssignment(info);
  if (templateApply) assignments.push(templateApply);

  const visitableApply = emitVisitableAcceptApplyAssignment(info);
  if (visitableApply) assignments.push(visitableApply);

  const serializableApply = emitSerializableApplyAssignment(info);
  if (serializableApply) assignments.push(serializableApply);

  if (assignments.length === 0) return '';

  return `
export function apply${info.name}Generated(ctor: typeof ${info.name}): void {
  const prototype = ctor.prototype as unknown as Record<string, unknown>;
  ${assignments.join('\n  ')}
}`.trim();
}

function emitBuilderFn(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Builder')) return '';
  const bName = builderClassName(info.name);
  return `
function ${info.name}_builder(): ${bName} {
  return ${bName}.builder();
}`.trim();
}

function emitClassCompanionBlocks(info: ClassInfo): string {
  const blocks: string[] = [];

  const builder = emitBuilderClass(info);
  if (builder) blocks.push(builder);

  const accessors = emitAccessorFns(info);
  if (accessors) blocks.push(accessors);

  const withFns = emitWithFns(info);
  if (withFns) blocks.push(withFns);

  const equalsFn = emitEqualsFn(info);
  if (equalsFn) blocks.push(equalsFn);

  const equalsStatic = emitEqualsStaticFn(info);
  if (equalsStatic) blocks.push(equalsStatic);

  const toString = emitToStringFn(info);
  if (toString) blocks.push(toString);

  const delegate = emitDelegateFns(info);
  if (delegate) blocks.push(delegate);

  const builderFn = emitBuilderFn(info);
  if (builderFn) blocks.push(builderFn);

  const templateMethod = emitTemplateMethodFn(info);
  if (templateMethod) blocks.push(templateMethod);

  const visitableAccept = emitVisitableAcceptFn(info);
  if (visitableAccept) blocks.push(visitableAccept);

  const abstractFactory = emitAbstractFactoryMixin(info);
  if (abstractFactory) blocks.push(abstractFactory);

  const serializable = emitSerializableMethods(info);
  if (serializable) blocks.push(serializable);

  const apply = emitApplyMixin(info);
  if (apply) blocks.push(apply);

  return blocks.filter(Boolean).join('\n\n');
}

export function emitCompanionFile(
  sourcePath: string,
  companionOutputPath: string,
  classes: readonly ClassInfo[],
  cwd: string,
): { ts: string; dts: string } {
  validateAllClassCompositions(classes);

  const header = [
    '// Auto-generated by lombok-typescript.',
    '// Source: ' + relative(cwd, sourcePath).replace(/\\/g, '/'),
    '// Do not edit. Regenerate via `lombok-ts generate`.',
    '',
  ].join('\n');

  const importPath = toImportPath(sourcePath, dirname(companionOutputPath));
  const blocks: string[] = [];

  for (const info of classes) {
    const chunk = emitClassCompanionBlocks(info);
    if (chunk) blocks.push(chunk);
  }

  const classesWithApply = classes.filter((c) => emitApplyMixin(c).length > 0);
  const applyAll =
    classesWithApply.length > 0
      ? `\n\nexport function applyAllGenerated(handlers: {\n${classesWithApply
          .map((c) => `  ${c.name}: typeof ${c.name};`)
          .join('\n')}\n}): void {\n${classesWithApply
          .map((c) => `  apply${c.name}Generated(handlers.${c.name});`)
          .join('\n')}\n}\n`
      : '\nexport {};\n';

  const imports = emitImports(classes, importPath);
  const ts = header + imports + blocks.join('\n\n') + applyAll;
  const dts = emitDeclarationShim(sourcePath, companionOutputPath, classes);

  return { ts, dts };
}

export { emitDeclarationShim };
