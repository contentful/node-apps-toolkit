import * as assert from 'assert'

import { verifyRequest } from './verify-request'
import { ContentfulHeader, Secret, CanonicalRequest, ContentfulContextHeader } from './typings'
import { signRequest } from './sign-request'
import { ExpiredRequestException } from './exceptions'

const makeIncomingRequest = (
  { path = '/api/v1/resources/1', method = 'GET', headers, body }: Partial<CanonicalRequest>,
  now = Date.now(),
  subject = {}
): CanonicalRequest & { headers: Record<string, string> } => {
  const request = {
    path,
    method,
    headers,
    body,
  }

  const contextHeaders = {
    spaceId: 'my-space',
    envId: 'my-environment',
    ...subject,
  }

  const signedHeaders = signRequest(VALID_SECRET, request, now, contextHeaders as any)

  return {
    ...request,
    headers: {
      ...(request.headers ?? {}),
      ...(signedHeaders ?? {}),
    },
  }
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

    assert(verifyRequest(VALID_SECRET, incomingRequest, 0))
  })

  it('verifies a verified request with user-id', () => {
    const now = Date.now()
    const incomingRequest = makeIncomingRequest(
      {
        headers: {
          Authorization: 'Bearer TOKEN',
        },
      },
      now,
      { userId: 'my-user' }
    )

    assert(verifyRequest(VALID_SECRET, incomingRequest, 0))
  })

  it('verifies a verified request with app-id', () => {
    const now = Date.now()
    const incomingRequest = makeIncomingRequest(
      {
        headers: {
          Authorization: 'Bearer TOKEN',
        },
      },
      now,
      { appId: 'my-app' }
    )

    assert(verifyRequest(VALID_SECRET, incomingRequest, 0))
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

      assert.throws(() => verifyRequest(VALID_SECRET, incomingRequest, 1), ExpiredRequestException)
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
        () => verifyRequest(VALID_SECRET, incomingRequest, 0),
        ExpiredRequestException
      )
    })
  })

  describe('with contentful headers', () => {
    it('verifies correctly with keys with different casing', () => {
      const incomingRequest = makeIncomingRequest({}, Date.now(), {
        userId: 'my-user',
      })

      // mess with casing
      incomingRequest.headers[ContentfulHeader.Signature.toUpperCase()] =
        incomingRequest.headers[ContentfulHeader.Signature]
      incomingRequest.headers[ContentfulHeader.SignedHeaders.toUpperCase()] =
        incomingRequest.headers[ContentfulHeader.SignedHeaders]
      incomingRequest.headers[ContentfulHeader.Timestamp.toUpperCase()] =
        incomingRequest.headers[ContentfulHeader.Timestamp]
      incomingRequest.headers[ContentfulContextHeader.SpaceId.toUpperCase()] =
        incomingRequest.headers[ContentfulContextHeader.SpaceId]
      incomingRequest.headers[ContentfulContextHeader.UserId.toUpperCase()] =
        incomingRequest.headers[ContentfulContextHeader.UserId]

      // remove correctly cased ones
      delete incomingRequest.headers[ContentfulHeader.Signature]
      delete incomingRequest.headers[ContentfulHeader.SignedHeaders]
      delete incomingRequest.headers[ContentfulHeader.Timestamp]
      delete incomingRequest.headers[ContentfulContextHeader.SpaceId]
      delete incomingRequest.headers[ContentfulContextHeader.UserId]

      assert(verifyRequest(VALID_SECRET, incomingRequest))
    })
    it('verifies correctly with keys with whitespace', () => {
      const incomingRequest = makeIncomingRequest({}, Date.now(), {
        appId: 'my-app',
      })

      // mess with spacing
      incomingRequest.headers[`${ContentfulHeader.Signature}      `] =
        incomingRequest.headers[ContentfulHeader.Signature]
      incomingRequest.headers[`   ${ContentfulHeader.SignedHeaders}   `] =
        incomingRequest.headers[ContentfulHeader.SignedHeaders]
      incomingRequest.headers[`      ${ContentfulHeader.Timestamp}`] =
        incomingRequest.headers[ContentfulHeader.Timestamp]
      incomingRequest.headers[` ${ContentfulContextHeader.SpaceId} `] =
        incomingRequest.headers[ContentfulContextHeader.SpaceId]
      incomingRequest.headers[`  ${ContentfulContextHeader.AppId}  `] =
        incomingRequest.headers[ContentfulContextHeader.AppId]

      // remove correctly spaced ones
      delete incomingRequest.headers[ContentfulHeader.Signature]
      delete incomingRequest.headers[ContentfulHeader.SignedHeaders]
      delete incomingRequest.headers[ContentfulHeader.Timestamp]
      delete incomingRequest.headers[ContentfulContextHeader.AppId]
      delete incomingRequest.headers[ContentfulContextHeader.SpaceId]

      assert(verifyRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing signature', () => {
      const incomingRequest = makeIncomingRequest({})

      delete incomingRequest.headers[ContentfulHeader.Signature]

      assert.throws(() => verifyRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing timestamp', () => {
      const incomingRequest = makeIncomingRequest({})

      delete incomingRequest.headers[ContentfulHeader.Timestamp]

      assert.throws(() => verifyRequest(VALID_SECRET, incomingRequest))
    })
    it('throws when missing signed headers', () => {
      const incomingRequest = makeIncomingRequest({
        headers: { Authorization: 'Bearer TOKEN' },
      })

      delete incomingRequest.headers[ContentfulHeader.SignedHeaders]

      assert.throws(() => verifyRequest(VALID_SECRET, incomingRequest))
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

      assert(verifyRequest(VALID_SECRET, incomingRequest))
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

      assert(verifyRequest(VALID_SECRET, incomingRequest))
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

      assert(verifyRequest(VALID_SECRET, incomingRequest))
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

      assert(!verifyRequest(VALID_SECRET, incomingRequest))
    })

    it("verifies with headers sorted lower than contentful's", () => {
      const incomingRequest = makeIncomingRequest({
        headers: {
          Authorization: 'Bearer Token',
          'z-zzzzz': 'ronf ronf',
        },
      })

      assert(verifyRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with paths', () => {
    it('does not verify with different query params', () => {
      const path = '/api/v1'
      const pathWithQueryOne = `${path}?a=1&b=2`
      const pathWithQueryTwo = `${path}?b=2&a=1`

      const incomingRequest = makeIncomingRequest({ path: pathWithQueryOne })

      incomingRequest.path = pathWithQueryTwo

      assert(!verifyRequest(VALID_SECRET, incomingRequest))
    })
  })

  describe('with method', () => {
    it('does not verify with different methods', () => {
      const incomingRequest = makeIncomingRequest({ method: 'GET' })

      incomingRequest.method = 'POST'

      assert(!verifyRequest(VALID_SECRET, incomingRequest))
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

      assert(!verifyRequest(differentSecret, incomingRequest))
    })
  })
})
