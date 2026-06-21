import type { ClassInfo } from '../types.js';
import {
  getHookMethodNames,
  getTemplateMethodName,
  getTemplateMethodSteps,
  hasClassDecorator,
} from './helpers.js';

export function emitTemplateMethodFn(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'TemplateMethod')) return '';

  const templateName = getTemplateMethodName(info);
  const steps = getTemplateMethodSteps(info);
  const hookNames = getHookMethodNames(info);

  for (const step of steps) {
    if (!hookNames.includes(step)) {
      throw new Error(`@TemplateMethod on ${info.name}: missing @Hook method for step "${step}"`);
    }
  }

  const calls = steps.map((step) => `this.${step}();`).join(' ');
  return `
function ${info.name}_${templateName}(this: ${info.name}): void {
  ${calls}
}`.trim();
}

export function emitTemplateMethodApplyAssignment(info: ClassInfo): string | undefined {
  if (!hasClassDecorator(info, 'TemplateMethod')) return undefined;
  const templateName = getTemplateMethodName(info);
  return `prototype.${templateName} = ${info.name}_${templateName};`;
}
