// Plugin system

export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  register(name, plugin) {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin '${name}' already registered`);
    }

    if (plugin.install) {
      plugin.install(this);
    }

    this.plugins.set(name, plugin);
    return this;
  }

  unregister(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.uninstall) {
      plugin.uninstall();
    }
    this.plugins.delete(name);
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  addHook(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(callback);
  }

  removeHook(hookName, callback) {
    const callbacks = this.hooks.get(hookName);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx > -1) {
        callbacks.splice(idx, 1);
      }
    }
  }

  async executeHook(hookName, ...args) {
    const callbacks = this.hooks.get(hookName) || [];
    for (const callback of callbacks) {
      await callback(...args);
    }
  }

  getLoadedPlugins() {
    return Array.from(this.plugins.keys());
  }
}

export const pluginManager = new PluginManager();
