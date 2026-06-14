import type { ClassInfo, FieldInfo } from '../types.js';

export function hasClassDecorator(info: ClassInfo, name: string): boolean {
  return info.decorators.some((d) => d.name === name);
}

export function fieldExcludesToString(field: FieldInfo): boolean {
  return field.decorators.some(
    (d) => d.name === 'ToStringExclude' || d.name === 'ToString.Exclude',
  );
}

export function visibleFields(info: ClassInfo): FieldInfo[] {
  if (hasClassDecorator(info, 'ToString')) {
    return info.fields.filter((f) => !fieldExcludesToString(f));
  }
  return info.fields;
}

export function getterName(fieldName: string): string {
  return `get${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
}

export function setterName(fieldName: string): string {
  return `set${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
}

export function builderClassName(className: string): string {
  return `${className}Builder`;
}
