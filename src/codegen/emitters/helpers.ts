import { relative } from 'node:path';
import type { ClassInfo, DecoratorInfo, FieldInfo } from '../types.js';

/** ESM import path from `fromDir` to `sourcePath` (NodeNext requires a `.js` extension). */
export function toImportPath(sourcePath: string, fromDir: string): string {
  let rel = relative(fromDir, sourcePath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\.tsx?$/u, '.js');
}

const CODEGEN_CLASS_DECORATORS = [
  'Builder',
  'Data',
  'ToString',
  'Value',
  'Equals',
  'With',
  'TemplateMethod',
  'AbstractFactory',
  'Visitable',
  'Serializable',
] as const;

export function hasCodegenClassDecorator(info: ClassInfo): boolean {
  return (
    CODEGEN_CLASS_DECORATORS.some((name) => hasClassDecorator(info, name)) ||
    info.fields.some(
      (f) =>
        fieldHasDecorator(f, 'Getter') ||
        fieldHasDecorator(f, 'Setter') ||
        fieldHasDecorator(f, 'With') ||
        fieldHasDecorator(f, 'Delegate'),
    )
  );
}

export function hasClassDecorator(info: ClassInfo, name: string): boolean {
  return info.decorators.some((d) => d.name === name);
}

/** Strip redundant `| undefined` from optional field types (ts-morph 28+ / TS 6). */
export function formatFieldTypeForEmit(type: string, isOptional: boolean): string {
  if (!isOptional) {
    return type;
  }
  return type.replace(/\s*\|\s*undefined$/u, '');
}

export function fieldHasDecorator(field: FieldInfo, name: string): boolean {
  return field.decorators.some((d) => d.name === name);
}

export function getValidateDecorator(decorators: DecoratorInfo[]): DecoratorInfo | undefined {
  return decorators.find((d) => d.name === 'Validate');
}

export function classHasValidate(info: ClassInfo): boolean {
  return getValidateDecorator(info.decorators) !== undefined;
}

export function fieldsWithValidate(info: ClassInfo): FieldInfo[] {
  return info.fields.filter((f) => fieldHasDecorator(f, 'Validate'));
}

export function needsBuilderValidation(info: ClassInfo): boolean {
  return (
    hasClassDecorator(info, 'Builder') &&
    (classHasValidate(info) || fieldsWithValidate(info).length > 0)
  );
}

export function needsValidateImport(classes: readonly ClassInfo[]): boolean {
  return classes.some(needsBuilderValidation);
}

function validateSchemaText(decorators: DecoratorInfo[]): string {
  return String(getValidateDecorator(decorators)?.arguments[0] ?? '');
}

export function needsZodImport(classes: readonly ClassInfo[]): boolean {
  return classes.some((info) => {
    if (!needsBuilderValidation(info)) return false;
    if (validateSchemaText(info.decorators).includes('z.')) return true;
    return fieldsWithValidate(info).some((f) => validateSchemaText(f.decorators).includes('z.'));
  });
}

export function fieldExcludesToString(field: FieldInfo): boolean {
  return field.decorators.some(
    (d) => d.name === 'ToStringExclude' || d.name === 'ToString.Exclude',
  );
}

export function fieldExcludesEquals(field: FieldInfo): boolean {
  return field.decorators.some((d) => d.name === 'EqualsExclude' || d.name === 'Equals.Exclude');
}

export function visibleFields(info: ClassInfo): FieldInfo[] {
  if (
    hasClassDecorator(info, 'ToString') ||
    hasClassDecorator(info, 'Data') ||
    hasClassDecorator(info, 'Value')
  ) {
    return info.fields.filter((f) => !fieldExcludesToString(f));
  }
  return info.fields;
}

export function equalsFields(info: ClassInfo): FieldInfo[] {
  return info.fields.filter((f) => !fieldExcludesEquals(f));
}

export function getterName(fieldName: string): string {
  return `get${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
}

export function setterName(fieldName: string): string {
  return `set${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
}

export function withMethodName(fieldName: string): string {
  return `with${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
}

export function builderClassName(className: string): string {
  return `${className}Builder`;
}

export function hasDataOrValue(info: ClassInfo): boolean {
  return hasClassDecorator(info, 'Data') || hasClassDecorator(info, 'Value');
}

export function wantsWithMethods(info: ClassInfo, field: FieldInfo): boolean {
  return (
    hasClassDecorator(info, 'Value') ||
    hasClassDecorator(info, 'With') ||
    fieldHasDecorator(field, 'With')
  );
}

export function wantsGetter(info: ClassInfo, field: FieldInfo): boolean {
  return hasDataOrValue(info) || fieldHasDecorator(field, 'Getter');
}

export function wantsSetter(info: ClassInfo, field: FieldInfo): boolean {
  if (hasClassDecorator(info, 'Value')) return false;
  if (hasClassDecorator(info, 'Data')) return !effectiveReadonly(info, field);
  return fieldHasDecorator(field, 'Setter');
}

export function wantsEquals(info: ClassInfo): boolean {
  return (
    hasClassDecorator(info, 'Data') ||
    hasClassDecorator(info, 'Value') ||
    hasClassDecorator(info, 'Equals')
  );
}

export function wantsToString(info: ClassInfo): boolean {
  return (
    hasClassDecorator(info, 'ToString') ||
    hasClassDecorator(info, 'Data') ||
    hasClassDecorator(info, 'Value')
  );
}

export function effectiveReadonly(info: ClassInfo, field: FieldInfo): boolean {
  if (field.isReadonly) return true;
  const defaults = getFieldDefaultsOptions(info);
  return defaults?.makeFinal === true;
}

export function getFieldDefaultsOptions(
  info: ClassInfo,
): { level: string; makeFinal: boolean } | undefined {
  const dec = info.decorators.find((d) => d.name === 'FieldDefaults');
  if (!dec) return undefined;
  const [first] = dec.arguments;
  if (typeof first === 'string' && first.startsWith('{')) {
    try {
      const parsed = JSON.parse(first.replace(/(\w+):/g, '"$1":').replace(/'/g, '"')) as {
        level?: string;
        makeFinal?: boolean;
      };
      return {
        level: parsed.level ?? 'public',
        makeFinal: parsed.makeFinal ?? false,
      };
    } catch {
      return { level: 'public', makeFinal: false };
    }
  }
  return { level: 'public', makeFinal: false };
}

export function hasFluentAccessors(info: ClassInfo): boolean {
  const dec = info.decorators.find((d) => d.name === 'Accessors');
  if (!dec) return false;
  const [first] = dec.arguments;
  if (typeof first === 'string') {
    return first.includes('chain') || first.includes('fluent');
  }
  return false;
}

export function getDelegateMethods(field: FieldInfo): string[] {
  const dec = field.decorators.find((d) => d.name === 'Delegate');
  if (!dec || dec.arguments.length === 0) return [];
  if (dec.arguments.length === 1 && String(dec.arguments[0]).startsWith('[')) {
    try {
      return JSON.parse(String(dec.arguments[0]).replace(/'/g, '"')) as string[];
    } catch {
      return [];
    }
  }
  return dec.arguments.map((a) => String(a).replace(/^['"]|['"]$/g, ''));
}

export function parseDecoratorObjectArg(dec: DecoratorInfo | undefined): Record<string, unknown> {
  if (!dec || dec.arguments.length === 0) return {};
  const [first] = dec.arguments;
  if (typeof first !== 'string' || !first.startsWith('{')) return {};
  try {
    return JSON.parse(first.replace(/(\w+):/g, '"$1":').replace(/'/g, '"')) as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

export function parseDecoratorArrayArg(dec: DecoratorInfo | undefined): string[] {
  if (!dec || dec.arguments.length === 0) return [];
  const [first] = dec.arguments;
  const text = String(first);
  if (!text.startsWith('[')) return [];
  try {
    return JSON.parse(text.replace(/'/g, '"')) as string[];
  } catch {
    return [];
  }
}

export function getAbstractFactoryProducts(info: ClassInfo): string[] {
  const dec = info.decorators.find((d) => d.name === 'AbstractFactory');
  const fromArray = parseDecoratorArrayArg(dec);
  if (fromArray.length > 0) return fromArray;
  const obj = parseDecoratorObjectArg(dec);
  return Array.isArray(obj.products) ? (obj.products as string[]) : [];
}

export function getTemplateMethodSteps(info: ClassInfo): string[] {
  const dec = info.decorators.find((d) => d.name === 'TemplateMethod');
  const obj = parseDecoratorObjectArg(dec);
  return Array.isArray(obj.steps) ? (obj.steps as string[]) : [];
}

export function getTemplateMethodName(info: ClassInfo): string {
  const dec = info.decorators.find((d) => d.name === 'TemplateMethod');
  const obj = parseDecoratorObjectArg(dec);
  return typeof obj.template === 'string' ? obj.template : 'execute';
}

export function getHookMethodNames(info: ClassInfo): string[] {
  return info.methods
    .filter((m) => m.decorators.some((d) => d.name === 'Hook'))
    .map((m) => {
      const hookDec = m.decorators.find((d) => d.name === 'Hook');
      const opts = parseDecoratorObjectArg(hookDec);
      return typeof opts.name === 'string' ? opts.name : m.name;
    });
}

export function visitMethodName(className: string): string {
  return `visit${className}`;
}
