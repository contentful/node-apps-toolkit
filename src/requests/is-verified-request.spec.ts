import * as assert from 'assert'

import { isVerifiedRequest } from './is-verified-request'
import { CanonicalRequest, Secret } from './typings'
import { createSignature } from './create-signature'
import { ContentfulSigningHeader } from './constants'

const makeRequest = ({
  path = '/api/v1/resources/1',
  method = 'GET',
  headers,
  signedHeaders,
  body,
}: {
  path?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  signedHeaders?: string[]
  body?: string
}): CanonicalRequest => {
  return {
    method,
    path,
    headers,
    signedHeaders,
    body,
  }
}

const makeIncomingRequest = (request: CanonicalRequest) => {
  const now = Date.now()
  const signature = createSignature(VALID_SECRET, request, now)

  const headers = {
    ...request.headers,
    [ContentfulSigningHeader.Signature]: signature,
    [ContentfulSigningHeader.Timestamp]: now.toString(),
  }

  if (request.signedHeaders) {
    headers[ContentfulSigningHeader.SignedHeaders] = request.signedHeaders.join(',')
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
      signedHeaders: ['Authorization'],
    })
    const incomingRequest = makeIncomingRequest(validRequest)

    assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
  })

  describe('with contentful headers', () => {
    it('verifies correctly with keys with different casing', () => {
      const request = makeRequest({})
      const incomingRequest = makeIncomingRequest(request)

      // mess with casing
      incomingRequest.headers = {
        [ContentfulSigningHeader.Signature.toUpperCase()]: incomingRequest.headers[
          ContentfulSigningHeader.Signature
        ],
        [ContentfulSigningHeader.Timestamp.toUpperCase()]: incomingRequest.headers[
          ContentfulSigningHeader.Timestamp
        ],
      }

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('verifies correctly with keys with whitespace', () => {
      const request = makeRequest({})
      const incomingRequest = makeIncomingRequest(request)

      // mess with spacing
      incomingRequest.headers = {
        [`${ContentfulSigningHeader.Signature}      `]: incomingRequest.headers[
          ContentfulSigningHeader.Signature
        ],
        [`      ${ContentfulSigningHeader.Timestamp}`]: incomingRequest.headers[
          ContentfulSigningHeader.Timestamp
        ],
      }

      assert(isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing signature', () => {
      const request = makeRequest({})
      const incomingRequest = makeIncomingRequest(request)

      delete incomingRequest.headers[ContentfulSigningHeader.Signature]

      assert.throws(() => isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing timestamp', () => {
      const request = makeRequest({})
      const incomingRequest = makeIncomingRequest(request)

      delete incomingRequest.headers[ContentfulSigningHeader.Timestamp]

      assert.throws(() => isVerifiedRequest(VALID_SECRET, incomingRequest))
    })
    it('does not throw if missing signed headers', () => {
      const request = makeRequest({
        headers: { Authorization: 'Bearer TOKEN' },
        signedHeaders: ['Authorization'],
      })
      const incomingRequest = makeIncomingRequest(request)

      delete incomingRequest.headers[ContentfulSigningHeader.SignedHeaders]

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
        signedHeaders: ['Authorization', 'Cache-Control'],
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
        signedHeaders: ['Authorization', 'Cache-Control'],
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
        signedHeaders: ['Authorization', 'Cache-Control'],
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
        signedHeaders: ['Authorization', 'Cache-Control'],
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
})
