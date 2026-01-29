// Math utilities for calculations

export class MathUtils {
  static add(a, b) {
    return parseFloat(a) + parseFloat(b);
  }

  static subtract(a, b) {
    return parseFloat(a) - parseFloat(b);
  }

  static multiply(a, b) {
    return parseFloat(a) * parseFloat(b);
  }

  static divide(a, b) {
    if (parseFloat(b) === 0) return 0;
    return parseFloat(a) / parseFloat(b);
  }

  static percent(value, percent) {
    return (parseFloat(value) * parseFloat(percent)) / 100;
  }

  static percentOf(value, total) {
    if (parseFloat(total) === 0) return 0;
    return (parseFloat(value) / parseFloat(total)) * 100;
  }

  static average(...values) {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + parseFloat(b), 0);
    return sum / values.length;
  }

  static sum(...values) {
    return values.reduce((a, b) => a + parseFloat(b), 0);
  }

  static min(...values) {
    return Math.min(...values.map(v => parseFloat(v)));
  }

  static max(...values) {
    return Math.max(...values.map(v => parseFloat(v)));
  }

  static round(value, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round(parseFloat(value) * factor) / factor;
  }

  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, parseFloat(value)));
  }

  static random(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  }
}

export const math = MathUtils;
