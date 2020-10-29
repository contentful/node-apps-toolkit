import * as assert from 'assert'

import { isVerifiedRequest } from './is-verified-request'
import { Secret } from './typings'
import { createSignature } from './create-signature'
import { CONTENTFUL_HEADERS, ContentfulHeader } from './constants'
import { ExpiredRequestException } from './exceptions'
import { normalizeHeaderKey } from './utils'

const makeIncomingRequest = (
  {
    path = '/api/v1/resources/1',
    method = 'GET',
    headers,
    body,
  }: {
    path?: string
    method?: 'GET' | 'POST'
    headers?: Record<string, string>
    body?: string
  },
  now = Date.now()
) => {
  const request = {
    path,
    method,
    headers,
    body,
  }

  const signature = createSignature(VALID_SECRET, request, now)

  const newHeaders = {
    ...request.headers,
    [ContentfulHeader.Timestamp]: now.toString(),
    [ContentfulHeader.SignedHeaders]: Object.keys(headers ?? {})
      .map(normalizeHeaderKey)
      .filter((i) => !CONTENTFUL_HEADERS.includes(i))
      .concat(ContentfulHeader.SignedHeaders, ContentfulHeader.Timestamp)
      .join(','),
    [ContentfulHeader.Signature]: signature,
  }

  return { ...request, headers: newHeaders }
}

const VALID_SECRET: Secret = new Array(64).fill('a').join('')

describe('isVerifiedRequest', () => {
  it('verifies a verified request', () => {
    const now = Date.now()
    const incomingRequest = makeIncomingRequest(
      {
        headers: {
          Authorization: 'Bearer TOKEN',
        },
      },
      now
    )

    assert(isVerifiedRequest(VALID_SECRET, incomingRequest, 0))
  })

  describe('with time to live', () => {
    it('throws if request is too old', () => {
      const oneMinuteAgo = Date.now() - 1000 * 60
      const incomingRequest = makeIncomingRequest(
        {
          headers: {
            Authorization: 'Bearer TOKEN',
          },
        },
        oneMinuteAgo
      )

      assert.throws(
        () => isVerifiedRequest(VALID_SECRET, incomingRequest, 1),
        ExpiredRequestException
      )
    })

    it('does not check if ttl is 0', () => {
      const oneMinuteAgo = Date.now() - 1000 * 60
      const incomingRequest = makeIncomingRequest(
        {
          headers: {
            Authorization: 'Bearer TOKEN',
          },
        },
        oneMinuteAgo
      )

      assert.doesNotThrow(
        () => isVerifiedRequest(VALID_SECRET, incomingRequest, 0),
        ExpiredRequestException
      )
    })
  })

  describe('with contentful headers', () => {
    it('verifies correctly with keys with different casing', () => {
      const incomingRequest = makeIncomingRequest({})

      // mess with casing
      incomingRequest.headers[ContentfulHeader.Signature.toUpperCase()] =
        incomingRequest.headers[ContentfulHeader.Signature]
      incomingRequest.headers[ContentfulHeader.SignedHeaders.toUpperCase()] =
        incomingRequest.headers[ContentfulHeader.SignedHeaders]
      incomingRequest.headers[ContentfulHeader.Timestamp.toUpperCase()] =
        incomingRequest.headers[ContentfulHeader.Timestamp]

      // remove correctly cased ones
      delete incomingRequest.headers[ContentfulHeader.Signature]
      delete incomingRequest.headers[ContentfulHeader.SignedHeaders]
      delete incomingRequest.headers[ContentfulHeader.Timestamp]

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('verifies correctly with keys with whitespace', () => {
      const incomingRequest = makeIncomingRequest({})

      // mess with spacing
      incomingRequest.headers[`${ContentfulHeader.Signature}      `] =
        incomingRequest.headers[ContentfulHeader.Signature]
      incomingRequest.headers[`   ${ContentfulHeader.SignedHeaders}   `] =
        incomingRequest.headers[ContentfulHeader.SignedHeaders]
      incomingRequest.headers[`      ${ContentfulHeader.Timestamp}`] =
        incomingRequest.headers[ContentfulHeader.Timestamp]

      // remove correctly spaced ones
      delete incomingRequest.headers[ContentfulHeader.Signature]
      delete incomingRequest.headers[ContentfulHeader.SignedHeaders]
      delete incomingRequest.headers[ContentfulHeader.Timestamp]

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing signature', () => {
      const incomingRequest = makeIncomingRequest({})

      delete incomingRequest.headers[ContentfulHeader.Signature]

      assert.throws(() => isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing timestamp', () => {
      const incomingRequest = makeIncomingRequest({})

      delete incomingRequest.headers[ContentfulHeader.Timestamp]

      assert.throws(() => isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing signed headers', () => {
      const incomingRequest = makeIncomingRequest({
        headers: { Authorization: 'Bearer TOKEN' },
      })

      delete incomingRequest.headers[ContentfulHeader.SignedHeaders]

      assert.throws(() => isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with other headers', () => {
    it('verifies with keys with different casing', () => {
      const authorization = 'Bearer TOKEN'
      const cacheControl = 'no-cache'

      const incomingRequest = makeIncomingRequest({
        headers: {
          Authorization: authorization,
          'Cache-Control': cacheControl,
        },
      })

      // mess with casing
      incomingRequest.headers = {
        authORizAtioN: authorization,
        'CACHE-control': cacheControl,
        ...incomingRequest.headers,
      }

      // remove correctly cased ones
      delete incomingRequest.headers['Authorization']
      delete incomingRequest.headers['Cache-Control']

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('verifies with keys with whitespace', () => {
      const authorization = 'Bearer TOKEN'
      const cacheControl = 'no-cache'

      const incomingRequest = makeIncomingRequest({
        headers: {
          Authorization: authorization,
          'Cache-Control': cacheControl,
        },
      })

      // mess with spacing
      incomingRequest.headers = {
        'Authorization      ': authorization,
        '   Cache-Control  ': cacheControl,
        ...incomingRequest.headers,
      }

      // remove correctly spaced ones
      delete incomingRequest.headers['Authorization']
      delete incomingRequest.headers['Cache-Control']

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('verifies with different headers, if they are not signed', () => {
      const authorization = 'Bearer TOKEN'
      const cacheControl = 'no-cache'

      const incomingRequest = makeIncomingRequest({
        headers: {
          Authorization: authorization,
          'Cache-Control': cacheControl,
        },
      })

      incomingRequest.headers['Content-Type'] = 'application/json'

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('does not verify with different signed headers', () => {
      const authorization = 'Bearer TOKEN'
      const cacheControl = 'no-cache'

      const incomingRequest = makeIncomingRequest({
        headers: {
          Authorization: authorization,
          'Cache-Control': cacheControl,
        },
      })

      incomingRequest.headers['Authorization'] = 'something else'

      assert(!isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with paths', () => {
    it('does not verify with different query params', () => {
      const path = '/api/v1'
      const pathWithQueryOne = `${path}?a=1&b=2`
      const pathWithQueryTwo = `${path}?b=2&a=1`

      const incomingRequest = makeIncomingRequest({ path: pathWithQueryOne })

      incomingRequest.path = pathWithQueryTwo

      assert(!isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with method', () => {
    it('does not verify with different methods', () => {
      const incomingRequest = makeIncomingRequest({ method: 'GET' })

      incomingRequest.method = 'POST'

      assert(!isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with secrets', () => {
    it('does not verify with different secrets', () => {
      const incomingRequest = makeIncomingRequest({
        headers: {
          Authorization: 'Bearer TOKEN',
        },
      })
      const differentSecret = `q${VALID_SECRET.slice(1, VALID_SECRET.length)}`

      assert(!isVerifiedRequest(differentSecret, incomingRequest))
    })
  })
})
