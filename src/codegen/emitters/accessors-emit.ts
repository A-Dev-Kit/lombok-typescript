import type { ClassInfo, FieldInfo } from '../types.js';
import {
  getterName,
  hasFluentAccessors,
  setterName,
  wantsGetter,
  wantsSetter,
} from './helpers.js';

function emitGetterFn(info: ClassInfo, field: FieldInfo): string {
  const g = getterName(field.name);
  return `
function ${info.name}_${g}(this: ${info.name}): ${field.type} {
  return this.${field.name};
}`.trim();
}

function emitSetterFn(info: ClassInfo, field: FieldInfo): string {
  const s = setterName(field.name);
  const fluent = hasFluentAccessors(info);
  const ret = fluent ? `return this;` : '';
  const returnType = fluent ? info.name : 'void';
  return `
function ${info.name}_${s}(this: ${info.name}, value: ${field.type}): ${returnType} {
  this.${field.name} = value;
  ${ret}
}`.trim();
}

export function emitAccessorFns(info: ClassInfo): string {
  const fns: string[] = [];
  for (const field of info.fields) {
    if (wantsGetter(info, field)) {
      fns.push(emitGetterFn(info, field));
    }
    if (wantsSetter(info, field)) {
      fns.push(emitSetterFn(info, field));
    }
  }
  return fns.join('\n\n');
}

export function emitAccessorApplyAssignments(info: ClassInfo): string[] {
  const assignments: string[] = [];
  for (const field of info.fields) {
    if (wantsGetter(info, field)) {
      assignments.push(`prototype.${getterName(field.name)} = ${info.name}_${getterName(field.name)};`);
    }
    if (wantsSetter(info, field)) {
      assignments.push(`prototype.${setterName(field.name)} = ${info.name}_${setterName(field.name)};`);
    }
  }
  return assignments;
}
