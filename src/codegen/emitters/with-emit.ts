import type { ClassInfo, FieldInfo } from '../types.js';
import { wantsWithMethods, withMethodName } from './helpers.js';

function emitSingleWithFn(info: ClassInfo, field: FieldInfo): string {
  const method = withMethodName(field.name);
  return `
function ${info.name}_${method}(this: ${info.name}, value: ${field.type}): ${info.name} {
  const copy = Object.create(Object.getPrototypeOf(this)) as ${info.name};
  Object.assign(copy, this);
  copy.${field.name} = value;
  return copy;
}`.trim();
}

export function emitWithFns(info: ClassInfo): string {
  const fields = info.fields.filter((f) => wantsWithMethods(info, f));
  if (fields.length === 0) return '';
  return fields.map((f) => emitSingleWithFn(info, f)).join('\n\n');
}
