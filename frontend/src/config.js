// Application configuration manager

export class ConfigManager {
  constructor(defaultConfig = {}) {
    this.config = defaultConfig;
    this.watchers = new Map();
  }

  set(key, value) {
    const keys = key.split('.');
    let obj = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
    this.notifyWatchers(key);
  }

  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return defaultValue;
      }
    }

    return value;
  }

  watch(key, callback) {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, []);
    }
    this.watchers.get(key).push(callback);

    return () => {
      const callbacks = this.watchers.get(key);
      callbacks.splice(callbacks.indexOf(callback), 1);
    };
  }

  notifyWatchers(key) {
    if (this.watchers.has(key)) {
      const value = this.get(key);
      this.watchers.get(key).forEach(callback => callback(value));
    }
  }

  getAll() {
    return JSON.parse(JSON.stringify(this.config));
  }

  merge(config) {
    this.config = { ...this.config, ...config };
  }

  reset(defaultConfig) {
    this.config = defaultConfig;
    this.watchers.forEach((callbacks) => {
      callbacks.forEach(callback => callback(null));
    });
  }
}

export const configManager = new ConfigManager();
