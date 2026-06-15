import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'lombok-typescript',
  description: 'Lombok-like decorators and Gang-of-Four patterns for TypeScript',
  base: '/lombok-typescript/',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Decorators', link: '/decorators/overview' },
      { text: 'GitHub', link: 'https://github.com/A-Dev-Kit/lombok-typescript' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'CLI', link: '/guide/cli' },
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
    ],
  },
});
