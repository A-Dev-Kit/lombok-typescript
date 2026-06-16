import type { ClassInfo } from '../types.js';
import { equalsFields, getterName, hasClassDecorator, setterName } from './helpers.js';
import { emitToStringMethod } from './toString.js';

export function emitDataAccessors(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Data')) {
    return '';
  }

  return info.fields
    .map((f) => {
      const getter = `
  ${getterName(f.name)}(): ${f.type} {
    return this.${f.name};
  }`.trim();
      if (f.isReadonly) {
        return getter;
      }
      return `${getter}

  ${setterName(f.name)}(value: ${f.type}): void {
    this.${f.name} = value;
  }`.trim();
    })
    .join('\n\n');
}

export function emitDataEquals(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Data')) {
    return '';
  }

  const checks = equalsFields(info)
    .map((f) => `this.${f.name} === other.${f.name}`)
    .join(' &&\n      ');

  return `
  equals(other: ${info.name} | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (!(other instanceof ${info.name})) return false;
    return (
      ${checks || 'true'}
    );
  }`.trim();
}

export function emitDataConstructor(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Data') || info.fields.length === 0) {
    return '';
  }

  const params = info.fields
    .map((f) => `${f.name}${f.isOptional ? '?' : ''}: ${f.type}`)
    .join(', ');
  const assigns = info.fields.map((f) => `this.${f.name} = ${f.name};`).join('\n    ');

  return `
  constructor(${params}) {
    ${assigns}
  }`.trim();
}

export function emitDataMethods(info: ClassInfo): string {
  const parts = [
    emitDataConstructor(info),
    emitDataAccessors(info),
    emitDataEquals(info),
    hasClassDecorator(info, 'Data') ? emitToStringMethod(info) : '',
  ].filter(Boolean);

  return parts.join('\n\n');
}
