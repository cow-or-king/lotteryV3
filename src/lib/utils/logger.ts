/**
 * Logger centralisé pour remplacer console.log
 * Logs uniquement en développement, silencieux en production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  info(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.warn(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.warn(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
