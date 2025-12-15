/**
 * Result Pattern
 * Pattern pour gérer les erreurs de manière typée sans throw
 * Inspiré de Rust Result<T, E>
 * IMPORTANT: ZERO any types
 */

export type Result<T> = { success: true; data: T } | { success: false; error: Error };

export const Result = {
  /**
   * Crée un Result success
   */
  ok<T>(data: T): Result<T> {
    return { success: true, data };
  },

  /**
   * Crée un Result failure
   */
  fail<T>(error: Error): Result<T> {
    return { success: false, error };
  },
};
