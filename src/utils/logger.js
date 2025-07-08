/**
 * Sistema de logging condicional para desenvolvimento e produção
 */

const isDevelopment = process.env.NODE_ENV === "development";

export class Logger {
  static log(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  static error(...args) {
    if (isDevelopment) {
      console.error(...args);
    }
  }

  static warn(...args) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  static info(...args) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  static debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
}

export default Logger;
