import {
  CanonicalRequest,
  CanonicalRequestValidator,
  RequestMetadata,
  RequestMetadataValidator,
  Secret,
  SecretValidator,
} from './typings'
import { ContentfulSigningHeader, CONTENTFUL_SIGNING_HEADERS } from './constants'
import { getNormalizedHeaders, pickHeaders } from './utils'
import { createSignature } from './create-signature'

const getRequestMetadata = (canonicalRequest: CanonicalRequest): RequestMetadata => {
  const normalizedHeaders = getNormalizedHeaders(canonicalRequest.headers ?? {})

  const signingHeaders = normalizedHeaders.filter(([key]) =>
    CONTENTFUL_SIGNING_HEADERS.includes(key)
  )

  // In order to not rely in order we perform a find. Array is short, not a big deal
  const [, signature] =
    signingHeaders.find(([key]) => key === ContentfulSigningHeader.Signature) ?? []
  const [, rawSignedHeaders] =
    signingHeaders.find(([key]) => key === ContentfulSigningHeader.SignedHeaders) ?? []
  const [, rawTimestamp] =
    signingHeaders.find(([key]) => key === ContentfulSigningHeader.Timestamp) ?? []

  const signedHeaders = rawSignedHeaders ? rawSignedHeaders.split(',') : []
  const timestamp = Number.parseInt(rawTimestamp ?? '', 10)

  return RequestMetadataValidator.check({ signature, signedHeaders, timestamp })
}

/**
 * Given a secret verifies a CanonicalRequest
 *
 * ~~~
 * const {isVerifiedRequest} = require('contentful-node-apps-toolkit')
 * const {server} = require('./imaginary-server')
 * const {makeCanonicalRequestFromImaginaryServerRequest} = require('./imaginary-utils')
 *
 * const SECRET = process.env.SECRET
 *
 * server.post('/api/my-resources', (req, res) => {
 *   const canonicalRequest = makeCanonicalRequestFromImaginaryServerRequest(req)
 *
 *   if (!isVerifiedRequest(SECRET, canonicalRequest)) {
 *     res.send(403, 'Invalid signature')
 *   }
 *
 *   // Rest of the code
 * })
 *
 * ~~~
 */
export const isVerifiedRequest = (
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest
): boolean => {
  const canonicalRequest = CanonicalRequestValidator.check(rawCanonicalRequest)
  const secret = SecretValidator.check(rawSecret)

  const { signature, signedHeaders, timestamp } = getRequestMetadata(canonicalRequest)

  const requestToValidate = {
    ...canonicalRequest,
    headers: pickHeaders(canonicalRequest.headers, signedHeaders),
  }

  const computedSignature = createSignature(secret, requestToValidate, timestamp)

  return signature === computedSignature
}
