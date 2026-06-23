import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'lombok-typescript',
  description: 'Lombok-like decorators and Gang-of-Four patterns for TypeScript',
  base: '/lombok-typescript/',
  vite: {
    build: {
      target: 'esnext',
    },
    esbuild: {
      target: 'esnext',
    },
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Decorators', link: '/decorators/overview' },
      { text: 'GitHub', link: 'https://github.com/A-Dev-Kit/lombok-typescript' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Architecture', link: '/guide/architecture' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'CLI', link: '/guide/cli' },
          { text: 'Examples', link: '/guide/examples' },
        ],
      },
      {
        text: 'Decorators (v0.1)',
        items: [
          { text: 'Overview', link: '/decorators/overview' },
          { text: '@Data', link: '/decorators/data' },
          { text: '@Builder', link: '/decorators/builder' },
          { text: '@NonNull', link: '/decorators/non-null' },
          { text: '@ToString', link: '/decorators/to-string' },
          { text: '@Singleton', link: '/decorators/singleton' },
          { text: '@Prototype', link: '/decorators/prototype' },
          { text: '@Factory', link: '/decorators/factory' },
          { text: '@Memoize', link: '/decorators/memoize' },
        ],
      },
      {
        text: 'Decorators (Phase 2)',
        items: [
          { text: '@Value', link: '/decorators/value' },
          { text: '@With', link: '/decorators/with' },
          { text: '@Equals', link: '/decorators/equals' },
          { text: '@Getter / @Setter', link: '/decorators/getter-setter' },
          { text: '@Log', link: '/decorators/log' },
          { text: '@Accessors', link: '/decorators/accessors' },
          { text: '@UtilityClass', link: '/decorators/utility-class' },
          { text: '@FieldDefaults', link: '/decorators/field-defaults' },
          { text: '@Delegate', link: '/decorators/delegate' },
        ],
      },
      {
        text: 'Decorators (Phase 3)',
        items: [
          { text: '@Strategy', link: '/decorators/strategy' },
          { text: '@State / @Transition', link: '/decorators/state' },
          { text: '@Command', link: '/decorators/command' },
          { text: '@Memento', link: '/decorators/memento' },
          { text: '@Observable', link: '/decorators/observable' },
          { text: 'Observer adapters', link: '/decorators/observers-adapters' },
          { text: '@ChainOfResponsibility', link: '/decorators/chain-of-responsibility' },
          { text: '@Iterable', link: '/decorators/iterable' },
        ],
      },
      {
        text: 'Decorators (Phase 4)',
        items: [
          { text: '@Flyweight', link: '/decorators/flyweight' },
          { text: '@Proxy', link: '/decorators/proxy' },
          { text: '@Composite', link: '/decorators/composite' },
          { text: '@Wraps', link: '/decorators/wraps' },
          { text: '@TemplateMethod / @Hook', link: '/decorators/template-method' },
          { text: '@AbstractFactory', link: '/decorators/abstract-factory' },
          { text: '@Visitor / @Visitable', link: '/decorators/visitor' },
        ],
      },
      {
        text: 'Decorators (Phase 5)',
        items: [
          { text: '@Retry', link: '/decorators/retry' },
          { text: '@Debounce / @Throttle', link: '/decorators/debounce-throttle' },
          { text: '@Trace', link: '/decorators/trace' },
          { text: '@DeepFreeze', link: '/decorators/deep-freeze' },
          { text: '@Validate', link: '/decorators/validate' },
          { text: '@Serializable', link: '/decorators/serializable' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/A-Dev-Kit/lombok-typescript' }],
    editLink: {
      pattern: 'https://github.com/A-Dev-Kit/lombok-typescript/edit/main/docs-site/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © A-Dev-Kit',
    },
    search: {
      provider: 'local',
    },
  },
});
