/**
 * Pattern for an App Action parameter's `id`. It cannot start with a number
 * and `_` is the only delimiter allowed, so a parameter stays reachable via
 * dot notation in JavaScript.
 *
 * Exported as a pattern string so it can be embedded directly in a JSON
 * Schema `pattern` keyword.
 *
 * @category Validation
 */
export const PARAMETER_ID_PATTERN = '^[a-zA-Z][a-zA-Z0-9_]*$'

/** @category Validation */
export const MAX_ACTION_NAME_LENGTH = 40

/** @category Validation */
export const MAX_ACTION_DESCRIPTION_LENGTH = 255

/** @category Validation */
export const MAX_ACTION_PARAMETERS = 8

/** @category Validation */
export const MIN_PARAMETER_ID_LENGTH = 1

/** @category Validation */
export const MAX_PARAMETER_ID_LENGTH = 64

/** @category Validation */
export const MIN_PARAMETER_NAME_LENGTH = 1

/** @category Validation */
export const MAX_PARAMETER_NAME_LENGTH = 64

/** @category Validation */
export const MAX_PARAMETER_DESCRIPTION_LENGTH = 255

/** @category Validation */
export const MAX_PARAMETER_DEFAULT_STRING_LENGTH = 255

/** @category Validation */
export const MIN_PARAMETER_OPTIONS = 1

/** @category Validation */
export const MAX_PARAMETER_OPTIONS = 1000

/** @category Validation */
export const MIN_PARAMETER_OPTION_LABEL_LENGTH = 1

/** @category Validation */
export const MAX_PARAMETER_OPTION_LABEL_LENGTH = 255

/**
 * The value types an App Action parameter can declare.
 *
 * @category Validation
 */
export const PARAMETER_TYPES = ['Boolean', 'Symbol', 'Number', 'Enum'] as const

/** @category Validation */
export type ParameterType = (typeof PARAMETER_TYPES)[number]

type ActionParameterOption = string | Record<string, unknown>

/**
 * The shape of a single App Action parameter definition, as declared in an app
 * manifest.
 *
 * @category Validation
 */
export interface ActionParameterDefinition {
  id: string
  name: string
  description?: string
  type: ParameterType
  required?: boolean
  default?: boolean | string | number
  options?: ActionParameterOption[]
}

const isValidOption = (option: unknown): boolean => {
  if (typeof option === 'string') {
    return (
      option.length >= MIN_PARAMETER_OPTION_LABEL_LENGTH &&
      option.length <= MAX_PARAMETER_OPTION_LABEL_LENGTH
    )
  }
  return typeof option === 'object' && option !== null && Object.keys(option).length === 1
}

/**
 * Validates a single App Action parameter definition and returns a list of
 * human-readable problems with it. An empty array means the parameter is
 * valid.
 *
 * Returns every problem rather than throwing on the first, so a manifest can
 * be reported on in full in one pass.
 *
 * @category Validation
 */
export const validateActionParameter = (parameter: ActionParameterDefinition): string[] => {
  const errors: string[] = []

  if (
    typeof parameter.id !== 'string' ||
    parameter.id.length < MIN_PARAMETER_ID_LENGTH ||
    parameter.id.length > MAX_PARAMETER_ID_LENGTH ||
    !new RegExp(PARAMETER_ID_PATTERN).test(parameter.id)
  ) {
    errors.push(
      `Invalid parameter "id" (must start with a letter, contain only letters, numbers, and "_", and be at most ${MAX_PARAMETER_ID_LENGTH} characters). Received: ${parameter.id}.`,
    )
  }

  if (
    typeof parameter.name !== 'string' ||
    parameter.name.length < MIN_PARAMETER_NAME_LENGTH ||
    parameter.name.length > MAX_PARAMETER_NAME_LENGTH
  ) {
    errors.push(
      `Invalid parameter "name" (must be ${MIN_PARAMETER_NAME_LENGTH}-${MAX_PARAMETER_NAME_LENGTH} characters). Received: ${parameter.name}.`,
    )
  }

  if (
    parameter.description !== undefined &&
    (typeof parameter.description !== 'string' ||
      parameter.description.length > MAX_PARAMETER_DESCRIPTION_LENGTH)
  ) {
    errors.push(
      `Invalid parameter "description" (must be at most ${MAX_PARAMETER_DESCRIPTION_LENGTH} characters).`,
    )
  }

  if (!PARAMETER_TYPES.includes(parameter.type)) {
    errors.push(
      `Invalid parameter "type" (must be one of ${PARAMETER_TYPES.join(', ')}). Received: ${parameter.type}.`,
    )
  }

  if (parameter.default !== undefined) {
    const defaultType = typeof parameter.default
    if (defaultType !== 'boolean' && defaultType !== 'string' && defaultType !== 'number') {
      errors.push('Invalid parameter "default" (must be a boolean, string, or number).')
    } else if (
      defaultType === 'string' &&
      (parameter.default as string).length > MAX_PARAMETER_DEFAULT_STRING_LENGTH
    ) {
      errors.push(
        `Invalid parameter "default" (string default must be at most ${MAX_PARAMETER_DEFAULT_STRING_LENGTH} characters).`,
      )
    }
  }

  if (parameter.options !== undefined) {
    if (
      !Array.isArray(parameter.options) ||
      parameter.options.length < MIN_PARAMETER_OPTIONS ||
      parameter.options.length > MAX_PARAMETER_OPTIONS
    ) {
      errors.push(
        `Invalid parameter "options" (must be an array of ${MIN_PARAMETER_OPTIONS}-${MAX_PARAMETER_OPTIONS} items).`,
      )
    } else if (!parameter.options.every(isValidOption)) {
      errors.push(
        `Invalid parameter "options" (each item must be a non-empty string of at most ${MAX_PARAMETER_OPTION_LABEL_LENGTH} characters, or an object with exactly one property).`,
      )
    }
  }

  return errors
}
