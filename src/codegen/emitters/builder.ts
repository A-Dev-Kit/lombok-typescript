import type { ClassInfo } from '../types.js';
import { builderClassName, hasClassDecorator } from './helpers.js';

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

  const buildArgs = info.fields.map((f) => `this._${f.name}!`).join(', ');

  return `
export class ${builderName} {
${fieldLines.join('\n')}

  static builder(): ${builderName} {
    return new ${builderName}();
  }

${setterMethods.join('\n\n')}

  build(): ${info.name} {
    return new ${info.name}(${buildArgs});
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
