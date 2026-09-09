/**
 * Pattern for the `id` of a hosted or function-backed App Action.
 *
 * Exported as a pattern string so it can be embedded directly in a JSON
 * Schema `pattern` keyword.
 *
 * @category Validation
 */
export const ACTION_ID_PATTERN = '^[a-zA-Z0-9]+$'

/** @category Validation */
export const MIN_ACTION_ID_LENGTH = 1

/** @category Validation */
export const MAX_ACTION_ID_LENGTH = 64

/**
 * Returns whether a string is a valid App Action `id`.
 *
 * @category Validation
 */
export const isValidActionId = (id: string): boolean =>
  typeof id === 'string' &&
  id.length >= MIN_ACTION_ID_LENGTH &&
  id.length <= MAX_ACTION_ID_LENGTH &&
  new RegExp(ACTION_ID_PATTERN).test(id)
