import {
  type ClassDeclaration,
  type Decorator,
  type MethodDeclaration,
  type ParameterDeclaration,
  Project,
  type PropertyDeclaration,
  type SourceFile,
  SyntaxKind,
} from 'ts-morph';
import type { ClassInfo, DecoratorInfo, FieldInfo, MethodInfo, ParameterInfo } from './types.js';

/**
 * Walk every class in `sourceFile` and return their decorator/field/method
 * shapes as plain data. No ts-morph references leak out.
 */
export function analyzeFile(sourceFile: SourceFile): ClassInfo[] {
  return sourceFile.getClasses().map((cls) => analyzeClassDeclaration(cls));
}

/** Find one class by name in the source file. Returns `undefined` if missing. */
export function analyzeClassByName(
  sourceFile: SourceFile,
  className: string,
): ClassInfo | undefined {
  const cls = sourceFile.getClass(className);
  return cls ? analyzeClassDeclaration(cls) : undefined;
}

/** Parse a source string in an in-memory project and analyze every class in it. */
export function analyzeSourceString(sourceCode: string, fileName = 'analyze.ts'): ClassInfo[] {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(fileName, sourceCode);
  return analyzeFile(sourceFile);
}

/** Analyze a single named class in a source string. Throws if not found. */
export function analyzeClass(sourceCode: string, className: string): ClassInfo {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('analyze.ts', sourceCode);
  const result = analyzeClassByName(sourceFile, className);
  if (!result) {
    throw new Error(`No class named "${className}" found in source`);
  }
  return result;
}

// Internal walkers

function analyzeClassDeclaration(cls: ClassDeclaration): ClassInfo {
  const name = cls.getName() ?? '<anonymous>';
  return {
    name,
    decorators: cls.getDecorators().map(toDecoratorInfo),
    fields: cls.getProperties().map(toFieldInfo),
    methods: cls.getMethods().map(toMethodInfo),
  };
}

function toDecoratorInfo(decorator: Decorator): DecoratorInfo {
  return {
    name: decorator.getName(),
    arguments: decorator.getArguments().map((arg) => arg.getText()),
  };
}

function toFieldInfo(prop: PropertyDeclaration): FieldInfo {
  const initializer = prop.getInitializer();
  return {
    name: prop.getName(),
    type: prop.getType().getText(prop),
    isOptional: prop.hasQuestionToken(),
    isReadonly: prop.isReadonly(),
    hasDefault: initializer !== undefined,
    defaultValue: initializer?.getText(),
    decorators: prop.getDecorators().map(toDecoratorInfo),
  };
}

function toMethodInfo(method: MethodDeclaration): MethodInfo {
  return {
    name: method.getName(),
    returnType: method.getReturnType().getText(method),
    parameters: method.getParameters().map(toParameterInfo),
    decorators: method.getDecorators().map(toDecoratorInfo),
    isAsync: method.isAsync(),
    isStatic: method.isStatic(),
  };
}

function toParameterInfo(param: ParameterDeclaration): ParameterInfo {
  return {
    name: param.getName(),
    type: param.getType().getText(param),
    isOptional:
      param.hasQuestionToken() ||
      param.hasInitializer() ||
      param.getDotDotDotToken()?.getKind() === SyntaxKind.DotDotDotToken,
    decorators: param.getDecorators().map(toDecoratorInfo),
  };
}
