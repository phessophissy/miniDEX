// Feature flags service

export class FeatureFlags {
  constructor(defaults = {}) {
    this.flags = defaults;
    this.conditions = new Map();
  }

  isEnabled(flag) {
    return this.flags[flag] === true;
  }

  enable(flag) {
    this.flags[flag] = true;
  }

  disable(flag) {
    this.flags[flag] = false;
  }

  toggle(flag) {
    this.flags[flag] = !this.flags[flag];
  }

  set(flag, value) {
    this.flags[flag] = value;
  }

  get(flag, defaultValue = false) {
    return this.flags[flag] ?? defaultValue;
  }

  registerCondition(flag, condition) {
    this.conditions.set(flag, condition);
  }

  isEnabledFor(flag, context) {
    const condition = this.conditions.get(flag);
    if (condition) {
      return condition(context);
    }
    return this.isEnabled(flag);
  }

  getAll() {
    return { ...this.flags };
  }

  load(flags) {
    this.flags = { ...this.flags, ...flags };
  }
}

export const featureFlags = new FeatureFlags();
