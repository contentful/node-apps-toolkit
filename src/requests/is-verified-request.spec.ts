import * as assert from 'assert'

import { isVerifiedRequest } from './is-verified-request'
import { CanonicalRequest, Secret } from './typings'
import { createSignature } from './create-signature'
import { ContentfulHeader } from './constants'
import { ExpiredRequestException } from './exceptions'

const makeRequest = ({
  path = '/api/v1/resources/1',
  method = 'GET',
  headers,
  body,
}: {
  path?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
}): CanonicalRequest => {
  return {
    method,
    path,
    headers,
    body,
  }
}

const makeIncomingRequest = (request: CanonicalRequest, now = Date.now()) => {
  const signature = createSignature(VALID_SECRET, request, now)

  const headers = {
    ...request.headers,
    [ContentfulHeader.Signature]: signature,
    [ContentfulHeader.Timestamp]: now.toString(),
  }

  if (request.headers) {
    headers[ContentfulHeader.SignedHeaders] = Object.keys(request.headers).join(',')
  }

  return { ...request, headers }
}

const VALID_SECRET: Secret = new Array(64).fill('a').join('')

describe('isVerifiedRequest', () => {
  it('verifies a verified request', () => {
    const validRequest = makeRequest({
      headers: {
        Authorization: 'Bearer TOKEN',
      },
    })
    const incomingRequest = makeIncomingRequest(validRequest)

    assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
  })

  describe('with time to live', () => {
    it('throws if request is too old', () => {
      const validRequest = makeRequest({
        headers: {
          Authorization: 'Bearer TOKEN',
        },
      })
      const oneMinuteAgo = Date.now() - 1000 * 60
      const incomingRequest = makeIncomingRequest(validRequest, oneMinuteAgo)

      assert.throws(
        () => isVerifiedRequest(VALID_SECRET, incomingRequest, 1),
        ExpiredRequestException
      )
    })

    it('does not check if ttl is 0', () => {
      const validRequest = makeRequest({
        headers: {
          Authorization: 'Bearer TOKEN',
        },
      })
      const oneMinuteAgo = Date.now() - 1000 * 60
      const incomingRequest = makeIncomingRequest(validRequest, oneMinuteAgo)

      assert.doesNotThrow(
        () => isVerifiedRequest(VALID_SECRET, incomingRequest, 0),
        ExpiredRequestException
      )
    })
  })

  describe('with contentful headers', () => {
    it('verifies correctly with keys with different casing', () => {
      const request = makeRequest({})
      const incomingRequest = makeIncomingRequest(request)

      // mess with casing
      incomingRequest.headers = {
        [ContentfulHeader.Signature.toUpperCase()]: incomingRequest.headers[
          ContentfulHeader.Signature
        ],
        [ContentfulHeader.Timestamp.toUpperCase()]: incomingRequest.headers[
          ContentfulHeader.Timestamp
        ],
      }

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('verifies correctly with keys with whitespace', () => {
      const request = makeRequest({})
      const incomingRequest = makeIncomingRequest(request)

      // mess with spacing
      incomingRequest.headers = {
        [`${ContentfulHeader.Signature}      `]: incomingRequest.headers[
          ContentfulHeader.Signature
        ],
        [`      ${ContentfulHeader.Timestamp}`]: incomingRequest.headers[
          ContentfulHeader.Timestamp
        ],
      }

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing signature', () => {
      const request = makeRequest({})
      const incomingRequest = makeIncomingRequest(request)

      delete incomingRequest.headers[ContentfulHeader.Signature]

      assert.throws(() => isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing timestamp', () => {
      const request = makeRequest({})
      const incomingRequest = makeIncomingRequest(request)

      delete incomingRequest.headers[ContentfulHeader.Timestamp]

      assert.throws(() => isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('does not throw if missing signed headers', () => {
      const request = makeRequest({
        headers: { Authorization: 'Bearer TOKEN' },
      })
      const incomingRequest = makeIncomingRequest(request)

      delete incomingRequest.headers[ContentfulHeader.SignedHeaders]

      assert.doesNotThrow(() => isVerifiedRequest(VALID_SECRET, incomingRequest))
      assert(!isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with other headers', () => {
    it('verifies with keys with different casing', () => {
      const authorization = 'Bearer TOKEN'
      const cacheControl = 'no-cache'

      const request = makeRequest({
        headers: {
          Authorization: authorization,
          'Cache-Control': cacheControl,
        },
      })
      // This request holds the signature generated with the headers above
      const incomingRequest = makeIncomingRequest(request)

      // But now we mess with casing
      delete incomingRequest.headers['Authorization']
      delete incomingRequest.headers['Cache-Control']

      incomingRequest.headers = {
        authORizAtioN: authorization,
        'CACHE-control': cacheControl,
        ...incomingRequest.headers,
      }

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('verifies with keys with whitespace', () => {
      const authorization = 'Bearer TOKEN'
      const cacheControl = 'no-cache'

      const request = makeRequest({
        headers: {
          Authorization: authorization,
          'Cache-Control': cacheControl,
        },
      })
      // This request holds the signature generated with the headers above
      const incomingRequest = makeIncomingRequest(request)

      // But now we mess with spacing
      delete incomingRequest.headers['Authorization']
      delete incomingRequest.headers['Cache-Control']

      incomingRequest.headers = {
        'Authorization      ': authorization,
        '   Cache-Control  ': cacheControl,
        ...incomingRequest.headers,
      }

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('verifies with different headers, if they are not signed', () => {
      const authorization = 'Bearer TOKEN'
      const cacheControl = 'no-cache'

      const request = makeRequest({
        headers: {
          Authorization: authorization,
          'Cache-Control': cacheControl,
        },
      })
      const incomingRequest = makeIncomingRequest(request)

      incomingRequest.headers['Content-Type'] = 'application/json'

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('does not verify with different signed headers', () => {
      const authorization = 'Bearer TOKEN'
      const cacheControl = 'no-cache'

      const request = makeRequest({
        headers: {
          Authorization: authorization,
          'Cache-Control': cacheControl,
        },
      })
      const incomingRequest = makeIncomingRequest(request)

      incomingRequest.headers['Authorization'] = 'something else'

      assert(!isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with paths', () => {
    it('does not verify with different query params', () => {
      const path = '/api/v1'
      const pathWithQueryOne = `${path}?a=1&b=2`
      const pathWithQueryTwo = `${path}?b=2&a=1`

      const request = makeRequest({ path: pathWithQueryOne })
      const incomingRequest = makeIncomingRequest(request)

      incomingRequest.path = pathWithQueryTwo

      assert(!isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with method', () => {
    it('does not verify with different methods', () => {
      const request = makeRequest({ method: 'GET' })
      const incomingRequest = makeIncomingRequest(request)

      incomingRequest.method = 'POST'

      assert(!isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with secrets', () => {
    it('does not verify with different secrets', () => {
      const validRequest = makeRequest({
        headers: {
          Authorization: 'Bearer TOKEN',
        },
      })
      const incomingRequest = makeIncomingRequest(validRequest)
      const differentSecret = `q${VALID_SECRET.slice(1, VALID_SECRET.length)}`

      assert(!isVerifiedRequest(differentSecret, incomingRequest))
    })
  })
})