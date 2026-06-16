import type { ClassInfo } from '../types.js';
import { equalsFields, hasClassDecorator, wantsEquals } from './helpers.js';

export function emitEqualsFn(info: ClassInfo): string {
  if (!wantsEquals(info)) return '';

  const fields = equalsFields(info);
  const checks = fields.map((f) => `this.${f.name} === other.${f.name}`).join(' &&\n    ');

  return `
function ${info.name}_equals(this: ${info.name}, other: ${info.name} | null | undefined): boolean {
  if (other === null || other === undefined) return false;
  if (!(other instanceof (this.constructor as typeof ${info.name}))) return false;
  return ${checks || 'true'};
}`.trim();
}

export function emitEqualsStaticFn(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Equals')) return '';

  return `
function ${info.name}_equalsStatic(a: ${info.name} | null | undefined, b: ${info.name} | null | undefined): boolean {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined) return false;
  return a.equals(b);
}`.trim();
}
