/**
 * Pattern for the `path` of a hosted App Action or Contentful Function: it
 * starts with a letter or number, may contain letters, numbers and the `/`,
 * `_` and `-` delimiters, and ends in `.js` or `.mjs`.
 *
 * Exported as a pattern string so it can be embedded directly in a JSON
 * Schema `pattern` keyword. The `.` before the extension is escaped — left
 * unescaped it matches any character, accepting paths with no extension
 * separator at all.
 *
 * @category Validation
 */
export const HOSTED_CODE_PATH_PATTERN = '^[a-zA-Z0-9][a-zA-Z0-9_/-]*\\.(m?js)$'

/**
 * Returns whether a string is a valid hosted App Action or Contentful
 * Function `path`.
 *
 * @category Validation
 */
export const isValidHostedCodePath = (path: string): boolean =>
  typeof path === 'string' && new RegExp(HOSTED_CODE_PATH_PATTERN).test(path)
