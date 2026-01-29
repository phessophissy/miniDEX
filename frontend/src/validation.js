// Input validation helpers

export class ValidationHelper {
  static isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isPhone(phone) {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone);
  }

  static isZipCode(zip) {
    const re = /^\d{5}(-\d{4})?$/;
    return re.test(zip);
  }

  static isStrong(password) {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  }

  static isUsername(username) {
    const re = /^[a-zA-Z0-9_-]{3,16}$/;
    return re.test(username);
  }

  static isEmpty(value) {
    return !value || value.trim().length === 0;
  }

  static isNumber(value) {
    return !isNaN(parseFloat(value));
  }

  static isInteger(value) {
    return Number.isInteger(parseFloat(value));
  }

  static isBetween(value, min, max) {
    const num = parseFloat(value);
    return num >= parseFloat(min) && num <= parseFloat(max);
  }

  static isHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  static isIPAddress(ip) {
    const re = /^(\d{1,3}\.){3}\d{1,3}$/;
    return re.test(ip);
  }
}

export const validation = ValidationHelper;
