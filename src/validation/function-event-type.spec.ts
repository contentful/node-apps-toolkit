import { describe, it, expect } from 'vitest'
import {
  FUNCTION_EVENT_TYPES,
  isValidFunctionEventType,
  type FunctionEventTopic,
} from './function-event-type'
import { FunctionTypeEnum } from '../requests/typings/function'

describe('FUNCTION_EVENT_TYPES', () => {
  it('holds exactly the values of FunctionTypeEnum', () => {
    // The array is derived from the enum so the two cannot drift apart.
    expect([...FUNCTION_EVENT_TYPES].sort()).toEqual([...Object.values(FunctionTypeEnum)].sort())
  })
})

describe('FunctionEventTopic', () => {
  it('accepts a plain string literal, unlike the enum itself', () => {
    // A TypeScript enum is nominal for assignment: a bare 'appaction.call'
    // does not satisfy FunctionTypeEnum, which breaks callers that read topics
    // from a manifest or a database as plain strings. The template literal
    // type stays in step with the enum while remaining structurally
    // assignable. This asserts at compile time; the runtime check is
    // incidental.
    const fromManifest: FunctionEventTopic = 'graphql.field.mapping'
    const accepts: FunctionEventTopic[] = ['graphql.field.mapping', 'graphql.query']
    expect(fromManifest).toBe(FunctionTypeEnum.GraphqlFieldMapping)
    expect(accepts).toHaveLength(2)
  })

  it('accepts an enum member too', () => {
    const named: FunctionEventTopic = FunctionTypeEnum.AppActionCall
    expect(named).toBe('appaction.call')
  })

  it('narrows an unknown string through the predicate', () => {
    const raw: string = 'appevent.filter'
    if (isValidFunctionEventType(raw)) {
      const narrowed: FunctionEventTopic = raw
      expect(narrowed).toBe(FunctionTypeEnum.AppEventFilter)
    } else {
      expect.unreachable('expected a known topic to narrow')
    }
  })
})

describe('isValidFunctionEventType', () => {
  it('accepts every event type a Function can declare', () => {
    for (const eventType of Object.values(FunctionTypeEnum)) {
      expect(isValidFunctionEventType(eventType)).toBe(true)
    }
  })

  it('accepts a known topic passed as a plain string', () => {
    expect(isValidFunctionEventType('appaction.call')).toBe(true)
  })

  it('rejects an unknown event type', () => {
    expect(isValidFunctionEventType('not.a.real.event')).toBe(false)
    expect(isValidFunctionEventType('webhooks.rest')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isValidFunctionEventType('')).toBe(false)
  })

  it('rejects an enum key rather than its value', () => {
    expect(isValidFunctionEventType('AppActionCall')).toBe(false)
  })
})
