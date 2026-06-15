---
layout: home

hero:
  name: lombok-typescript
  text: Lombok + GoF patterns for TypeScript
  tagline: Reduce boilerplate with decorators and generated companions — legacy and Stage 3 backends, side by side.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Decorator reference
      link: /decorators/overview
    - theme: alt
      text: View on GitHub
      link: https://github.com/A-Dev-Kit/lombok-typescript

features:
  - title: Dual backends
    details: Use experimentalDecorators (NestJS, TypeORM) or Stage 3 ECMAScript decorators — same API surface from lombok-typescript/legacy or /stage3.
  - title: Hybrid model
    details: Runtime decorators for lifecycle and method behavior; codegen for class shape (@Data, @Builder, @ToString) via lombok-ts generate.
  - title: CLI codegen
    details: Companion files under .lombok/ with .lombok.ts implementations and .lombok.d.ts type augmentation.
---

## What it is

**lombok-typescript** brings [Project Lombok](https://projectlombok.org/)-style annotations and Gang-of-Four design patterns to TypeScript. You decorate classes and methods; the library applies runtime behavior or generates companion code so you write less boilerplate.

Phase 1 (v0.1) ships eight decorators: `@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Singleton`, `@Prototype`, `@Factory`, and `@Memoize`.

## Who it's for

- TypeScript application developers tired of hand-written getters, builders, and `toString`
- **NestJS** teams who want pattern decorators that work alongside `@Injectable()`
- Developers coming from **Java / Spring** who miss `@Data`, `@Builder`, and similar ergonomics
- Anyone learning GoF patterns through a single decorator plus a concrete example

## What it isn't

lombok-typescript is **not** a dependency-injection container (use NestJS, Inversify, or tsyringe), an ORM, or a state-management library. It targets **TypeScript 5+** and **Node 22+** and does not polyfill older runtimes.

## Status

**Version 0.1.0** — code-complete on `main`, **not published to npm yet**. See the [changelog on GitHub](https://github.com/A-Dev-Kit/lombok-typescript/blob/main/CHANGELOG.md).

| Resource           | Link                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full documentation | You are here                                                                                                                                                                                 |
| Source & issues    | [github.com/A-Dev-Kit/lombok-typescript](https://github.com/A-Dev-Kit/lombok-typescript)                                                                                                     |
| Runnable examples  | [examples/plain-ts](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/plain-ts), [examples/nestjs](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/nestjs) |

## Quick links

- [Introduction](/guide/introduction) — problem, solution, and hybrid model
- [Getting started](/guide/getting-started) — install, configure, generate
- [Architecture](/guide/architecture) — runtime vs codegen vs hybrid
- [Decorator overview](/decorators/overview) — all v0.1 decorators at a glance
