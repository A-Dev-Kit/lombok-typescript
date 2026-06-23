import type { ClassInfo, FieldInfo } from '../types.js';
import { hasClassDecorator } from './helpers.js';

function isSerializableExcluded(field: FieldInfo): boolean {
  return field.decorators.some(
    (d) => d.name === 'SerializableExclude' || d.name === 'Exclude',
  );
}

function serializableFields(info: ClassInfo): FieldInfo[] {
  return info.fields.filter((f) => !isSerializableExcluded(f));
}

function fieldAlias(field: FieldInfo): string | undefined {
  const alias = field.decorators.find(
    (d) => d.name === 'SerializableAlias' || d.name === 'Alias',
  );
  return alias?.arguments[0] ? String(alias.arguments[0]).replace(/^['"]|['"]$/g, '') : undefined;
}

function jsonKey(field: FieldInfo): string {
  return fieldAlias(field) ?? field.name;
}

function hasSerializableTransform(field: FieldInfo): boolean {
  return field.decorators.some(
    (d) => d.name === 'SerializableTransform' || d.name === 'Transform',
  );
}

export function emitSerializableMethods(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Serializable')) {
    return '';
  }

  const fields = serializableFields(info);
  const serializeBody = fields
    .map((f) => {
      const key = jsonKey(f);
      if (hasSerializableTransform(f)) {
        return `    '${key}': __serializableTransforms['${f.name}'].serialize(this.${f.name}),`;
      }
      return `    '${key}': this.${f.name},`;
    })
    .join('\n');

  const deserializeBody = fields
    .map((f) => {
      const key = jsonKey(f);
      if (hasSerializableTransform(f)) {
        return `  instance.${f.name} = __serializableTransforms['${f.name}'].deserialize(json['${key}']);`;
      }
      return `  instance.${f.name} = json['${key}'] as ${f.type};`;
    })
    .join('\n');

  const transformLiterals = fields
    .filter((f) => hasSerializableTransform(f))
    .map((f) => {
      const transformArg =
        f.decorators.find(
          (d) => d.name === 'SerializableTransform' || d.name === 'Transform',
        )?.arguments[0] ?? '{}';
      return `'${f.name}': ${transformArg}`;
    });

  const transforms =
    transformLiterals.length > 0
      ? `const __serializableTransforms: Record<string, { serialize: (v: unknown) => unknown; deserialize: (v: unknown) => unknown }> = {\n  ${transformLiterals.join(',\n  ')}\n};\n\n`
      : '';

  return `${transforms}function ${info.name}_toJSON(this: ${info.name}): Record<string, unknown> {
  return {
${serializeBody}
  };
}

function ${info.name}_fromJSON(json: Record<string, unknown>): ${info.name} {
  const instance = Object.create(${info.name}.prototype) as ${info.name};
${deserializeBody}
  return instance;
}`.trim();
}

export function emitSerializableApplyAssignment(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'Serializable')) return '';
  return `prototype.toJSON = ${info.name}_toJSON;
  (ctor as typeof ${info.name} & { fromJSON(json: Record<string, unknown>): ${info.name} }).fromJSON = ${info.name}_fromJSON;`;
}
