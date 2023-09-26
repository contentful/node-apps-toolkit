import * as assert from 'assert'

import { verifyRequest } from './verify-request'
import {
  ContentfulHeader,
  Secret,
  CanonicalRequest,
  ContentfulContextHeader,
  Context,
} from './typings'
import { signRequest } from './sign-request'
import { ExpiredRequestException } from './exceptions'

const makeContextHeaders = (subject?: { appId: string } | { userId: string }) => {
  return subject
    ? {
        spaceId: 'my-space',
        envId: 'my-environment',
        ...subject,
      }
    : undefined
}

const makeIncomingRequest = (
  { path = '/api/v1/resources/1', method = 'GET', headers, body }: Partial<CanonicalRequest>,
  contextHeaders: undefined | Context<any>,
  now = Date.now(),
): CanonicalRequest & { headers: Record<string, string> } => {
  const request = {
    path,
    method,
    headers,
    body,
  }

  const signedHeaders = signRequest(VALID_SECRET, request, now, contextHeaders)

  return {
    ...request,
    headers: {
      ...(request.headers ?? {}),
      ...(signedHeaders ?? {}),
    },
  }
}

const VALID_SECRET: Secret = new Array(64).fill('a').join('')
const TestCase = {
  NoContext: 'no context',
  AppContext: 'app context',
  UserContext: 'user context',
}

describe('verifyRequest', () => {
  for (const { testCase, contextHeaders } of [
    { testCase: TestCase.NoContext, contextHeaders: undefined },
    { testCase: TestCase.AppContext, contextHeaders: { appId: 'appId' } },
    { testCase: TestCase.UserContext, contextHeaders: { userId: 'userId' } },
  ]) {
    describe(`with ${testCase}`, () => {
      it('verifies a verified request', () => {
        const now = Date.now()
        const incomingRequest = makeIncomingRequest(
          {
            headers: {
              Authorization: 'Bearer TOKEN',
            },
          },
          now,
        )

        assert(verifyRequest(VALID_SECRET, incomingRequest, 0))
      })

      it('verifies a verified request with subject-id', () => {
        const now = Date.now()
        const incomingRequest = makeIncomingRequest(
          {
            headers: {
              Authorization: 'Bearer TOKEN',
            },
          },
          makeContextHeaders(contextHeaders),
          now,
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
            makeContextHeaders(contextHeaders),
            oneMinuteAgo,
          )

          assert.throws(
            () => verifyRequest(VALID_SECRET, incomingRequest, 1),
            ExpiredRequestException,
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
            makeContextHeaders(contextHeaders),
            oneMinuteAgo,
          )

          assert.doesNotThrow(
            () => verifyRequest(VALID_SECRET, incomingRequest, 0),
            ExpiredRequestException,
          )
        })
      })

      describe('with contentful headers', () => {
        it('verifies correctly with keys with different casing', () => {
          const incomingRequest = makeIncomingRequest({}, makeContextHeaders(contextHeaders))

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

          if (testCase === TestCase.UserContext) {
            incomingRequest.headers[ContentfulContextHeader.SpaceId.toUpperCase()] =
              incomingRequest.headers[ContentfulContextHeader.SpaceId]
            incomingRequest.headers[ContentfulContextHeader.UserId.toUpperCase()] =
              incomingRequest.headers[ContentfulContextHeader.UserId]

            delete incomingRequest.headers[ContentfulContextHeader.SpaceId]
            delete incomingRequest.headers[ContentfulContextHeader.UserId]
          } else if (testCase === TestCase.AppContext) {
            incomingRequest.headers[ContentfulContextHeader.SpaceId.toUpperCase()] =
              incomingRequest.headers[ContentfulContextHeader.SpaceId]
            incomingRequest.headers[ContentfulContextHeader.AppId.toUpperCase()] =
              incomingRequest.headers[ContentfulContextHeader.AppId]

            delete incomingRequest.headers[ContentfulContextHeader.SpaceId]
            delete incomingRequest.headers[ContentfulContextHeader.AppId]
          }

          assert(verifyRequest(VALID_SECRET, incomingRequest))
        })
        it('verifies correctly with keys with whitespace', () => {
          const incomingRequest = makeIncomingRequest({}, makeContextHeaders(contextHeaders))

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

          if (testCase === TestCase.UserContext) {
            incomingRequest.headers[` ${ContentfulContextHeader.SpaceId} `] =
              incomingRequest.headers[ContentfulContextHeader.SpaceId]
            incomingRequest.headers[`  ${ContentfulContextHeader.UserId}  `] =
              incomingRequest.headers[ContentfulContextHeader.UserId]

            delete incomingRequest.headers[ContentfulContextHeader.SpaceId]
            delete incomingRequest.headers[ContentfulContextHeader.UserId]
          } else if (testCase === TestCase.AppContext) {
            incomingRequest.headers[` ${ContentfulContextHeader.SpaceId} `] =
              incomingRequest.headers[ContentfulContextHeader.SpaceId]
            incomingRequest.headers[`  ${ContentfulContextHeader.AppId}  `] =
              incomingRequest.headers[ContentfulContextHeader.AppId]

            delete incomingRequest.headers[ContentfulContextHeader.SpaceId]
            delete incomingRequest.headers[ContentfulContextHeader.AppId]
          }

          assert(verifyRequest(VALID_SECRET, incomingRequest))
        })
        it('throws when missing signature', () => {
          const incomingRequest = makeIncomingRequest({}, makeContextHeaders(contextHeaders))

          delete incomingRequest.headers[ContentfulHeader.Signature]

          assert.throws(() => verifyRequest(VALID_SECRET, incomingRequest))
        })
        it('throws when missing timestamp', () => {
          const incomingRequest = makeIncomingRequest({}, makeContextHeaders(contextHeaders))

          delete incomingRequest.headers[ContentfulHeader.Timestamp]

          assert.throws(() => verifyRequest(VALID_SECRET, incomingRequest))
        })
        it('throws when missing signed headers', () => {
          const incomingRequest = makeIncomingRequest(
            {
              headers: { Authorization: 'Bearer TOKEN' },
            },
            makeContextHeaders(contextHeaders),
          )

          delete incomingRequest.headers[ContentfulHeader.SignedHeaders]

          assert.throws(() => verifyRequest(VALID_SECRET, incomingRequest))
        })
      })

      describe('with other headers', () => {
        it('verifies with keys with different casing', () => {
          const authorization = 'Bearer TOKEN'
          const cacheControl = 'no-cache'

          const incomingRequest = makeIncomingRequest(
            {
              headers: {
                Authorization: authorization,
                'Cache-Control': cacheControl,
              },
            },
            makeContextHeaders(contextHeaders),
          )

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

          const incomingRequest = makeIncomingRequest(
            {
              headers: {
                Authorization: authorization,
                'Cache-Control': cacheControl,
              },
            },
            makeContextHeaders(contextHeaders),
          )

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

          const incomingRequest = makeIncomingRequest(
            {
              headers: {
                Authorization: authorization,
                'Cache-Control': cacheControl,
              },
            },
            makeContextHeaders(contextHeaders),
          )

          incomingRequest.headers['Content-Type'] = 'application/json'

          assert(verifyRequest(VALID_SECRET, incomingRequest))
        })
        it('does not verify with different signed headers', () => {
          const authorization = 'Bearer TOKEN'
          const cacheControl = 'no-cache'

          const incomingRequest = makeIncomingRequest(
            {
              headers: {
                Authorization: authorization,
                'Cache-Control': cacheControl,
              },
            },
            makeContextHeaders(contextHeaders),
          )

          incomingRequest.headers['Authorization'] = 'something else'

          assert(!verifyRequest(VALID_SECRET, incomingRequest))
        })

        it("verifies with headers sorted lower than contentful's", () => {
          const incomingRequest = makeIncomingRequest(
            {
              headers: {
                Authorization: 'Bearer Token',
                'z-zzzzz': 'ronf ronf',
              },
            },
            makeContextHeaders(contextHeaders),
          )

          assert(verifyRequest(VALID_SECRET, incomingRequest))
        })
      })

      describe('with paths', () => {
        it('does not verify with different query params', () => {
          const path = '/api/v1'
          const pathWithQueryOne = `${path}?a=1&b=2`
          const pathWithQueryTwo = `${path}?b=2&a=1`

          const incomingRequest = makeIncomingRequest(
            { path: pathWithQueryOne },
            makeContextHeaders(contextHeaders),
          )

          incomingRequest.path = pathWithQueryTwo

          assert(!verifyRequest(VALID_SECRET, incomingRequest))
        })
      })

      describe('with method', () => {
        it('does not verify with different methods', () => {
          const incomingRequest = makeIncomingRequest(
            { method: 'GET' },
            makeContextHeaders(contextHeaders),
          )

          incomingRequest.method = 'POST'

          assert(!verifyRequest(VALID_SECRET, incomingRequest))
        })
      })

      describe('with secrets', () => {
        it('does not verify with different secrets', () => {
          const incomingRequest = makeIncomingRequest(
            {
              headers: {
                Authorization: 'Bearer TOKEN',
              },
            },
            makeContextHeaders(contextHeaders),
          )
          const differentSecret = `q${VALID_SECRET.slice(1, VALID_SECRET.length)}`

          assert(!verifyRequest(differentSecret, incomingRequest))
        })
      })
    })
  }
})
