import { describe, it, expect, vi, afterEach } from 'vitest'
import { createValidateStatusCode, HttpError, Response } from '.'

const makeResponse = (statusCode: number, body = '{"sys":{"type":"Error"}}') =>
  ({ statusCode, body } as Response)

describe('createValidateStatusCode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the response when status code is allowed', () => {
    const validate = createValidateStatusCode([200, 201])
    const response = makeResponse(201)
    expect(validate(response)).toBe(response)
  })

  it('throws HttpError when status code is not allowed', () => {
    const validate = createValidateStatusCode([201])
    const response = makeResponse(404, '{"sys":{"type":"Error","id":"NotFound"}}')
    expect(() => validate(response)).toThrow(HttpError)
  })

  it('does not write to stdout when throwing', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    const validate = createValidateStatusCode([201])
    try {
      validate(makeResponse(404))
    } catch {
      // expected
    }
    expect(consoleSpy).not.toHaveBeenCalled()
  })
})
