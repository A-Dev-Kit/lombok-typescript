import type { ClassInfo } from '../types.js';
import { hasClassDecorator, visibleFields } from './helpers.js';

export function emitToStringMethod(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'ToString') && !hasClassDecorator(info, 'Data')) {
    return '';
  }

  const fields = visibleFields(info);
  const parts = fields.map((f) => `${f.name}=\${String(this.${f.name})}`).join(', ');

  return `
  toString(): string {
    return \`${info.name}(${parts})\`;
  }`.trim();
}

export function emitToStringMixin(info: ClassInfo): string {
  const body = emitToStringMethod(info);
  if (!body) return '';
  return body;
}
