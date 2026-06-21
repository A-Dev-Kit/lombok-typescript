import type { ClassInfo } from '../types.js';
import { hasClassDecorator, visitMethodName } from './helpers.js';

export function emitVisitableAcceptFn(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Visitable')) return '';

  const methodName = visitMethodName(info.name);
  return `
function ${info.name}_accept(this: ${info.name}, visitor: unknown): unknown {
  const handler = (visitor as Record<string, unknown>)['${methodName}'];
  if (typeof handler !== 'function') {
    throw new Error(\`Visitor missing ${methodName} for ${info.name}\`);
  }
  return handler.call(visitor, this);
}`.trim();
}

export function emitVisitableAcceptApplyAssignment(info: ClassInfo): string | undefined {
  if (!hasClassDecorator(info, 'Visitable')) return undefined;
  return `prototype.accept = ${info.name}_accept;`;
}
