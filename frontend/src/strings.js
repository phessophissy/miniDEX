// String manipulation utilities

export class StringUtils {
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static uppercase(str) {
    return str.toUpperCase();
  }

  static lowercase(str) {
    return str.toLowerCase();
  }

  static trim(str) {
    return str.trim();
  }

  static truncate(str, length = 20, suffix = '...') {
    return str.length > length ? str.substring(0, length) + suffix : str;
  }

  static contains(str, substring) {
    return str.toLowerCase().includes(substring.toLowerCase());
  }

  static startsWith(str, prefix) {
    return str.toLowerCase().startsWith(prefix.toLowerCase());
  }

  static endsWith(str, suffix) {
    return str.toLowerCase().endsWith(suffix.toLowerCase());
  }

  static replace(str, search, replacement) {
    return str.replace(new RegExp(search, 'gi'), replacement);
  }

  static split(str, separator = ',') {
    return str.split(separator).map(s => s.trim());
  }

  static join(array, separator = ',') {
    return array.join(separator);
  }

  static reverse(str) {
    return str.split('').reverse().join('');
  }

  static isEmpty(str) {
    return !str || str.trim().length === 0;
  }

  static slug(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static camelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  }

  static random(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const str = StringUtils;
