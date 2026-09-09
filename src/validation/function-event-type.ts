import { FunctionTypeEnum } from '../requests/typings/function'

/**
 * Every event topic a Contentful Function can accept, as a union of string
 * literals.
 *
 * Expanded from {@link FunctionTypeEnum} with a template literal type, so it
 * stays in step with the enum while remaining *structurally* assignable: a
 * plain `'appaction.call'` satisfies this type, where it would not satisfy the
 * enum itself. Use this to type data read from a manifest or a database, and
 * the enum where a topic is named in code.
 *
 * Distinct from `FunctionEventType` in `./requests`, which is
 * `keyof FunctionEventHandlers`. Because that map is keyed by computed enum
 * members, `keyof` yields the nominal enum type and rejects plain strings —
 * it types a handler's generic parameter, not data read from a manifest.
 *
 * @category Validation
 */
export type FunctionEventTopic = `${FunctionTypeEnum}`

/**
 * Every event topic a Contentful Function can accept, as a plain array of
 * string values.
 *
 * Derived from {@link FunctionTypeEnum} so the two cannot drift: consumers that
 * need the values as data (to build a JSON Schema `enum`, or to check
 * membership) read them from here, and consumers that need a named topic keep
 * referencing the enum member.
 *
 * Typed as {@link FunctionEventTopic}, not as the enum, so a schema built by
 * mapping over these values describes plain strings — matching the data that
 * actually arrives over the wire.
 *
 * @category Validation
 */
export const FUNCTION_EVENT_TYPES = Object.freeze(
  Object.values(FunctionTypeEnum),
) as readonly FunctionEventTopic[]

/**
 * Returns whether a string is an event topic a Contentful Function can accept.
 *
 * Narrows to {@link FunctionEventTopic} rather than the enum, so a validated
 * string stays assignable without a cast.
 *
 * @category Validation
 */
export const isValidFunctionEventType = (value: string): value is FunctionEventTopic =>
  (FUNCTION_EVENT_TYPES as readonly string[]).includes(value)
