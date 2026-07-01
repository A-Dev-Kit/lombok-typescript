/** Minimal plugin registry for community decorator extensions. */

export interface LombokPlugin {
  name: string;
  onRegister?: () => void;
}

const plugins = new Map<string, LombokPlugin>();

export function registerLombokPlugin(plugin: LombokPlugin): void {
  if (plugins.has(plugin.name)) {
    throw new Error(`Lombok plugin already registered: ${plugin.name}`);
  }
  plugins.set(plugin.name, plugin);
  plugin.onRegister?.();
}

export function getLombokPlugin(name: string): LombokPlugin | undefined {
  return plugins.get(name);
}

export function listLombokPlugins(): readonly string[] {
  return [...plugins.keys()];
}

export function clearLombokPlugins(): void {
  plugins.clear();
}
