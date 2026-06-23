import type { ClassInfo } from '../types.js';
import {
  builderClassName,
  fieldsWithValidate,
  getValidateDecorator,
  hasClassDecorator,
} from './helpers.js';

function emitBuildValidation(info: ClassInfo): string {
  const lines: string[] = [];
  const classValidate = getValidateDecorator(info.decorators);
  if (classValidate?.arguments[0]) {
    lines.push(`    runValidation(${classValidate.arguments[0]}, instance, 'zod');`);
  }
  for (const field of fieldsWithValidate(info)) {
    const validateDec = getValidateDecorator(field.decorators);
    if (validateDec?.arguments[0]) {
      lines.push(`    runValidation(${validateDec.arguments[0]}, instance.${field.name}, 'zod');`);
    }
  }
  return lines.join('\n');
}

export function emitBuilderClass(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Builder')) {
    return '';
  }

  const builderName = builderClassName(info.name);
  const fieldLines = info.fields.map((f) => {
    if (f.isOptional) {
      return `  private _${f.name}?: ${f.type};`;
    }
    return `  private _${f.name}!: ${f.type};`;
  });

  const setterMethods = info.fields.map((f) =>
    `
  ${f.name}(value: ${f.type}): ${builderName} {
    this._${f.name} = value;
    return this;
  }`.trim(),
  );

  const validationLines = emitBuildValidation(info);
  const validationBlock = validationLines ? `\n${validationLines}\n` : '';

  return `
export class ${builderName} {
${fieldLines.join('\n')}

  static builder(): ${builderName} {
    return new ${builderName}();
  }

${setterMethods.join('\n\n')}

  build(): ${info.name} {
    const instance = new ${info.name}();
${info.fields.map((f) => `    instance.${f.name} = this._${f.name}${f.isOptional ? '' : '!'};`).join('\n')}${validationBlock}    return instance;
  }
}`.trim();
}

export function emitBuilderStaticMethod(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Builder')) return '';
  const builderName = builderClassName(info.name);
  return `
  static builder(): ${builderName} {
    return ${builderName}.builder();
  }`.trim();
}
