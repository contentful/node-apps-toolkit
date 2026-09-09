import { describe, it, expect } from 'vitest'
import { isValidActionId, MAX_ACTION_ID_LENGTH } from './action-id'

describe('isValidActionId', () => {
  it('accepts an alphanumeric id', () => {
    expect(isValidActionId('myAction123')).toBe(true)
  })

  it('rejects an id with non-alphanumeric characters', () => {
    expect(isValidActionId('my-action')).toBe(false)
    expect(isValidActionId('my_action')).toBe(false)
    expect(isValidActionId('my action')).toBe(false)
  })

  it('rejects an empty id', () => {
    expect(isValidActionId('')).toBe(false)
  })

  it('accepts an id at the maximum length', () => {
    expect(isValidActionId('a'.repeat(MAX_ACTION_ID_LENGTH))).toBe(true)
  })

  it('rejects an id exceeding the maximum length', () => {
    expect(isValidActionId('a'.repeat(MAX_ACTION_ID_LENGTH + 1))).toBe(false)
  })
})
