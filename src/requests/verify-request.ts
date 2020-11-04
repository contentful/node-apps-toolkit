import {
  CanonicalRequest,
  CanonicalRequestValidator,
  RequestMetadata,
  RequestMetadataValidator,
  Secret,
  SecretValidator,
  Timestamp,
  TimeToLive,
  ContentfulHeader,
} from './typings'
import { normalizeHeaders, pickHeaders } from './utils'
import { signRequest } from './sign-request'
import { ExpiredRequestException } from './exceptions'

const getRequestMetadata = (normalizedHeaders: Record<string, string>): RequestMetadata => {
  const signature = normalizedHeaders[ContentfulHeader.Signature]
  const signedHeaders = (normalizedHeaders[ContentfulHeader.SignedHeaders] ?? '').split(',')
  const timestamp = Number.parseInt(normalizedHeaders[ContentfulHeader.Timestamp] ?? '', 10)

  return RequestMetadataValidator.check({ signature, signedHeaders, timestamp })
}

const isRequestTimestampTooOld = (ttl: number, timestamp: Timestamp) => {
  return Date.now() - timestamp >= ttl * 1000
}

/**
 * Given a secret verifies a CanonicalRequest. Throws when signature is older than `rawTimeToLive` seconds.
 * Pass `rawTimeToLive = 0` to disable TTL checks.
 *
 * ~~~
 * const { verifyRequest } = require('@contentful/node-apps-toolkit')
 * const { server } = require('./imaginary-server')
 * const { makeCanonicalRequestFromImaginaryServerRequest } = require('./imaginary-utils')
 *
 * const SECRET = process.env.SECRET
 * const REQUEST_TTL = Number.parseInt(process.env.REQUEST_TTL, 10)
 *
 * server.post('/api/my-resources', (req, res) => {
 *   const canonicalRequest = makeCanonicalRequestFromImaginaryServerRequest(req)
 *
 *   try {
 *     const isVerifiedRequest = verifyRequest(SECRET, canonicalRequest, REQUEST_TTL)
 *
 *     if (!isVerifiedRequest) {
 *       res.send(403, 'Invalid signature')
 *     }
 *   } catch (_error) {
 *     res.send(422, 'Unable to verify request')
 *   }
 *
 *   // Rest of the code
 * })
 *
 * ~~~
 * @category Requests
 */
export const verifyRequest = (
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimeToLive: TimeToLive = 30
): boolean => {
  const canonicalRequest = CanonicalRequestValidator.check(rawCanonicalRequest)
  const secret = SecretValidator.check(rawSecret)

  const normalizedHeaders = normalizeHeaders(canonicalRequest.headers ?? {})

  const { signature, signedHeaders, timestamp } = getRequestMetadata(normalizedHeaders)

  if (rawTimeToLive !== 0 && isRequestTimestampTooOld(rawTimeToLive, timestamp)) {
    throw new ExpiredRequestException(rawTimeToLive)
  }

  const requestToValidate = {
    ...canonicalRequest,
    headers: pickHeaders(normalizedHeaders, signedHeaders),
  }

  const { [ContentfulHeader.Signature]: computedSignature } = signRequest(
    secret,
    requestToValidate,
    timestamp
  )

  return signature === computedSignature
}
