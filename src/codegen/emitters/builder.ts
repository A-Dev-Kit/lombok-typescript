import type { ClassInfo } from '../types.js';
import {
  builderClassName,
  fieldHasBuilderDefault,
  fieldsWithValidate,
  getValidateDecorator,
  hasClassDecorator,
  resolveSingularFields,
  type SingularField,
} from './helpers.js';

function emitSingularMethods(fieldName: string, s: SingularField, builderName: string): string {
  return `
  ${s.adder}(value: ${s.element}): ${builderName} {
    this._${fieldName}.push(value);
    return this;
  }

  ${fieldName}(values: ${s.element}[]): ${builderName} {
    this._${fieldName}.push(...values);
    return this;
  }

  ${s.clearName}(): ${builderName} {
    this._${fieldName} = [];
    return this;
  }`.trim();
}

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
  const singularOf = resolveSingularFields(info);

  for (const f of info.fields) {
    if (fieldHasBuilderDefault(f) && !f.hasDefault) {
      throw new Error(
        `@BuilderDefault on ${info.name}.${f.name}: the field has no initializer to fall back to`,
      );
    }
  }

  const fieldLines = info.fields.flatMap((f) => {
    const singular = singularOf.get(f.name);
    if (singular) {
      return [`  private _${f.name}: ${singular.element}[] = [];`];
    }
    if (fieldHasBuilderDefault(f)) {
      return [`  private _${f.name}?: ${f.type};`, `  private _${f.name}Set = false;`];
    }
    if (f.isOptional) {
      return [`  private _${f.name}?: ${f.type};`];
    }
    return [`  private _${f.name}!: ${f.type};`];
  });

  const setterMethods = info.fields.map((f) => {
    const singular = singularOf.get(f.name);
    if (singular) {
      return emitSingularMethods(f.name, singular, builderName);
    }
    const setFlag = fieldHasBuilderDefault(f) ? `\n    this._${f.name}Set = true;` : '';
    return `
  ${f.name}(value: ${f.type}): ${builderName} {
    this._${f.name} = value;${setFlag}
    return this;
  }`.trim();
  });

  const assignLines = info.fields.map((f) => {
    if (singularOf.has(f.name)) {
      return `    instance.${f.name} = this._${f.name};`;
    }
    if (fieldHasBuilderDefault(f)) {
      return `    if (this._${f.name}Set) instance.${f.name} = this._${f.name}!;`;
    }
    return `    instance.${f.name} = this._${f.name}${f.isOptional ? '' : '!'};`;
  });

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
${assignLines.join('\n')}${validationBlock}    return instance;
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
