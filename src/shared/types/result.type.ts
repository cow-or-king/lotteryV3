/**
 * Result Pattern - Gestion des erreurs sans exceptions
 * Utilisé dans toute la logique métier pour éviter les throw
 */

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export const Result = {
  ok: <T, E = Error>(data: T): Result<T, E> => ({
    success: true,
    data,
  }),

  fail: <E = Error>(error: E): Result<never, E> => ({
    success: false,
    error,
  }),

  isOk: <T, E>(result: Result<T, E>): result is { success: true; data: T } => {
    return result.success === true;
  },

  isFail: <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
    return result.success === false;
  },

  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
    if (Result.isOk(result)) {
      return Result.ok<U, E>(fn(result.data));
    }
    return result as Result<U, E>;
  },

  flatMap: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> => {
    if (Result.isOk(result)) {
      return fn(result.data);
    }
    return result as Result<U, E>;
  },

  combine: <T extends readonly Result<unknown, unknown>[]>(
    results: T,
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
    T[number] extends Result<unknown, infer E> ? E : never
  > => {
    const errors = results.filter(Result.isFail);
    if (errors.length > 0) {
      return Result.fail(errors[0]!.error) as never;
    }

    const values = results.map((r) => (r as { success: true; data: unknown }).data);
    return Result.ok(values) as never;
  },
};
