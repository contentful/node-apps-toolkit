import {
  CanonicalRequest,
  CanonicalRequestValidator,
  RequestMetadata,
  RequestMetadataValidator,
  Secret,
  SecretValidator,
  Timestamp,
  TimeToLive,
} from './typings'
import { ContentfulHeader, CONTENTFUL_HEADERS } from './constants'
import { getNormalizedHeaders, pickHeaders } from './utils'
import { createSignature } from './create-signature'
import { ExpiredRequestException } from './exceptions'

const getRequestMetadata = (canonicalRequest: CanonicalRequest): RequestMetadata => {
  const normalizedHeaders = getNormalizedHeaders(canonicalRequest.headers ?? {})

  const signingHeaders = normalizedHeaders.filter(([key]) => CONTENTFUL_HEADERS.includes(key))

  // In order to not rely in order we perform a find. Array is short, not a big deal
  const [, signature] = signingHeaders.find(([key]) => key === ContentfulHeader.Signature) ?? []
  const [, rawSignedHeaders] =
    signingHeaders.find(([key]) => key === ContentfulHeader.SignedHeaders) ?? []
  const [, rawTimestamp] = signingHeaders.find(([key]) => key === ContentfulHeader.Timestamp) ?? []

  const signedHeaders = rawSignedHeaders ? rawSignedHeaders.split(',') : []
  const timestamp = Number.parseInt(rawTimestamp ?? '', 10)

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
 * const {isVerifiedRequest} = require('contentful-node-apps-toolkit')
 * const {server} = require('./imaginary-server')
 * const {makeCanonicalRequestFromImaginaryServerRequest} = require('./imaginary-utils')
 *
 * const SECRET = process.env.SECRET
 * const REQUEST_TTL = Number.parseInt(process.env.REQUEST_TTL, 10)
 *
 * server.post('/api/my-resources', (req, res) => {
 *   const canonicalRequest = makeCanonicalRequestFromImaginaryServerRequest(req)
 *
 *   if (!isVerifiedRequest(SECRET, canonicalRequest, REQUEST_TTL)) {
 *     res.send(403, 'Invalid signature')
 *   }
 *
 *   // Rest of the code
 * })
 *
 * ~~~
 * @category Requests
 */
export const isVerifiedRequest = (
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimeToLive: TimeToLive = 30
): boolean => {
  const canonicalRequest = CanonicalRequestValidator.check(rawCanonicalRequest)
  const secret = SecretValidator.check(rawSecret)

  const { signature, signedHeaders, timestamp } = getRequestMetadata(canonicalRequest)

  if (rawTimeToLive !== 0 && isRequestTimestampTooOld(rawTimeToLive, timestamp)) {
    throw new ExpiredRequestException(rawTimeToLive)
  }

  const requestToValidate = {
    ...canonicalRequest,
    headers: pickHeaders(canonicalRequest.headers, signedHeaders),
  }

  const { signature: computedSignature } = createSignature(secret, requestToValidate, timestamp)

  return signature === computedSignature
}
