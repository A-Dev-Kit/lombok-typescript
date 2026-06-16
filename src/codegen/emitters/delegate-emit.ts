import type { ClassInfo } from '../types.js';
import { fieldHasDecorator, getDelegateMethods } from './helpers.js';

export function emitDelegateFns(info: ClassInfo): string {
  const fns: string[] = [];

  for (const field of info.fields) {
    if (!fieldHasDecorator(field, 'Delegate')) continue;
    const methods = getDelegateMethods(field);
    for (const method of methods) {
      fns.push(`
function ${info.name}_${method}(this: ${info.name}, ...args: unknown[]): unknown {
  const target = this.${field.name} as { ${method}: (...a: unknown[]) => unknown };
  return target.${method}(...args);
}`.trim());
    }
  }

  return fns.join('\n\n');
}

export function emitDelegateApplyAssignments(info: ClassInfo): string[] {
  const assignments: string[] = [];
  for (const field of info.fields) {
    if (!fieldHasDecorator(field, 'Delegate')) continue;
    for (const method of getDelegateMethods(field)) {
      assignments.push(`prototype.${method} = ${info.name}_${method};`);
    }
  }
  return assignments;
}
