import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';
import type { MetadataStore } from '../../core/metadata-store.js';
import { normalizeFromStates, type TransitionOptions } from './transition.js';

export interface StateLifecycleHooks {
  onEnter?: (state: string) => void;
  onExit?: (state: string) => void;
  onTransition?: (from: string, to: string) => void;
}

export interface StateOptions extends StateLifecycleHooks {
  states: string[];
  initial: string;
}

const STATE_SYMBOL = Symbol('lombok-ts:state');

function collectTransitionMethods(
  metadata: MetadataStore,
  proto: object,
  classMetadata?: object,
): Map<string, { options: TransitionOptions; original: (...args: unknown[]) => unknown }> {
  const transitions = new Map<
    string,
    { options: TransitionOptions; original: (...args: unknown[]) => unknown }
  >();

  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue;
    const options =
      metadata.get<TransitionOptions>(MetadataKeys.TRANSITION, proto, key) ??
      (classMetadata
        ? metadata.get<TransitionOptions>(MetadataKeys.TRANSITION, classMetadata, key)
        : undefined);
    if (!options) continue;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || typeof desc.value !== 'function') continue;
    transitions.set(key, { options, original: desc.value as (...args: unknown[]) => unknown });
  }

  return transitions;
}

function applyStateWrapping(
  backend: Backend,
  target: AnyClass,
  options: StateOptions,
  classMetadata?: object,
): AnyClass {
  const { states, initial, onEnter, onExit, onTransition } = options;

  if (!states.includes(initial)) {
    throw new Error(`@State initial state "${initial}" is not in states: [${states.join(', ')}]`);
  }

  const transitions = collectTransitionMethods(
    backend.metadata,
    target.prototype as object,
    classMetadata,
  );

  const StateClass = class extends target {
    constructor(...args: unknown[]) {
      super(...args);
      Object.defineProperty(this, STATE_SYMBOL, {
        value: initial,
        writable: true,
        enumerable: false,
        configurable: false,
      });
      onEnter?.(initial);
    }

    get state(): string {
      return (this as unknown as Record<symbol, string>)[STATE_SYMBOL] ?? initial;
    }
  };

  const stateProto = StateClass.prototype as object;

  for (const [methodName, { options: transition, original }] of transitions) {
    const fromStates = normalizeFromStates(transition.from);
    const toState = transition.to;

    if (!states.includes(toState)) {
      throw new Error(`@Transition on "${methodName}" targets unknown state "${toState}"`);
    }
    for (const from of fromStates) {
      if (!states.includes(from)) {
        throw new Error(`@Transition on "${methodName}" references unknown state "${from}"`);
      }
    }

    Object.defineProperty(stateProto, methodName, {
      configurable: true,
      enumerable: false,
      writable: true,
      value: function stateTransitionWrapper(this: unknown, ...args: unknown[]) {
        const self = this as Record<symbol, string>;
        const current = self[STATE_SYMBOL] ?? '';
        if (!fromStates.includes(current)) {
          throw new Error(
            `Cannot transition from "${current}" to "${toState}" via ${methodName}()`,
          );
        }
        onExit?.(current);
        const result = original.apply(this, args);
        self[STATE_SYMBOL] = toState;
        onTransition?.(current, toState);
        onEnter?.(toState);
        return result;
      },
    });
  }

  return StateClass as AnyClass;
}

export function stateClassLegacy(
  backend: Backend,
  target: AnyClass,
  options: StateOptions,
): AnyClass {
  backend.metadata.set(MetadataKeys.STATE, target, undefined, options);
  return applyStateWrapping(backend, target, options);
}

export function stateClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
  options: StateOptions,
): AnyClass {
  backend.metadata.set(MetadataKeys.STATE, context.metadata as object, undefined, options);
  return applyStateWrapping(backend, value, options, context.metadata as object);
}
