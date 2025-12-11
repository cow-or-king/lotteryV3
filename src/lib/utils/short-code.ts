/**
 * Utilities for generating unique short codes
 */

/**
 * Generates a random short code of specified length
 * Uses alphanumeric characters (a-z, A-Z, 0-9)
 */
export function generateShortCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
