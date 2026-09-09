/**
 * Pattern for a Contentful Function's `id`.
 *
 * Structurally identical to {@link ACTION_ID_PATTERN} today, but kept as its
 * own export because a Function id and an App Action id are distinct concepts
 * that may diverge independently.
 *
 * @category Validation
 */
export const FUNCTION_ID_PATTERN = '^[a-zA-Z0-9]+$'

/** @category Validation */
export const MIN_FUNCTION_ID_LENGTH = 1

/** @category Validation */
export const MAX_FUNCTION_ID_LENGTH = 64

/**
 * Returns whether a string is a valid Contentful Function `id`.
 *
 * @category Validation
 */
export const isValidFunctionId = (id: string): boolean =>
  typeof id === 'string' &&
  id.length >= MIN_FUNCTION_ID_LENGTH &&
  id.length <= MAX_FUNCTION_ID_LENGTH &&
  new RegExp(FUNCTION_ID_PATTERN).test(id)
