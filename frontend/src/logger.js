// Logger service

export class Logger {
  static DEBUG = 'DEBUG';
  static INFO = 'INFO';
  static WARN = 'WARN';
  static ERROR = 'ERROR';

  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };

    console.log(`[${timestamp}] ${level}: ${message}`, data || '');

    this.store(logEntry);
  }

  static debug(message, data) {
    this.log(this.DEBUG, message, data);
  }

  static info(message, data) {
    this.log(this.INFO, message, data);
  }

  static warn(message, data) {
    this.log(this.WARN, message, data);
  }

  static error(message, data) {
    this.log(this.ERROR, message, data);
  }

  static store(entry) {
    try {
      const logs = JSON.parse(localStorage.getItem('minidex_logs') || '[]');
      logs.push(entry);
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }
      localStorage.setItem('minidex_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  static getLogs() {
    try {
      return JSON.parse(localStorage.getItem('minidex_logs') || '[]');
    } catch {
      return [];
    }
  }

  static clearLogs() {
    localStorage.removeItem('minidex_logs');
  }
}

export const logger = Logger;
