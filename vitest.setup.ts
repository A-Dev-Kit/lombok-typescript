// Polyfill `Symbol.metadata` on Node runtimes that don't expose it (Node <= 22.4).
// Node 22.5+ and Node 24 have it natively, but the test runner sometimes runs
// on whatever Node a contributor has installed.

if (typeof (Symbol as { metadata?: symbol }).metadata === 'undefined') {
  Object.defineProperty(Symbol, 'metadata', {
    value: Symbol.for('Symbol.metadata'),
    writable: false,
    enumerable: false,
    configurable: false,
  });
}
