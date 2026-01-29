// Date and time utilities

export class DateUtils {
  static now() {
    return Date.now();
  }

  static format(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  static addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  static addHours(date, hours) {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
  }

  static addMinutes(date, minutes) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + minutes);
    return d;
  }

  static addSeconds(date, seconds) {
    const d = new Date(date);
    d.setSeconds(d.getSeconds() + seconds);
    return d;
  }

  static getDaysBetween(start, end) {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((new Date(end) - new Date(start)) / msPerDay);
  }

  static isToday(date) {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  }

  static isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const d = new Date(date);
    return d.toDateString() === yesterday.toDateString();
  }

  static isThisMonth(date) {
    const now = new Date();
    const d = new Date(date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  static isThisYear(date) {
    const now = new Date();
    const d = new Date(date);
    return d.getFullYear() === now.getFullYear();
  }
}

export const date = DateUtils;
