import { describe, it, expect } from 'vitest'
import { isValidFunctionId, MAX_FUNCTION_ID_LENGTH } from './function-id'

describe('isValidFunctionId', () => {
  it('accepts an alphanumeric id', () => {
    expect(isValidFunctionId('myFunction123')).toBe(true)
  })

  it('rejects an id with non-alphanumeric characters', () => {
    expect(isValidFunctionId('my-function')).toBe(false)
    expect(isValidFunctionId('my_function')).toBe(false)
    expect(isValidFunctionId('my function')).toBe(false)
  })

  it('rejects an empty id', () => {
    expect(isValidFunctionId('')).toBe(false)
  })

  it('accepts an id at the maximum length', () => {
    expect(isValidFunctionId('a'.repeat(MAX_FUNCTION_ID_LENGTH))).toBe(true)
  })

  it('rejects an id exceeding the maximum length', () => {
    expect(isValidFunctionId('a'.repeat(MAX_FUNCTION_ID_LENGTH + 1))).toBe(false)
  })
})
