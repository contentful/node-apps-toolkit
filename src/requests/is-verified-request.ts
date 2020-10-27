import {
  CanonicalRequest,
  CanonicalRequestValidator,
  RequestMetadata,
  RequestMetadataValidator,
  Secret,
  SecretValidator,
} from './typings'
import { ContentfulSigningHeader, CONTENTFUL_SIGNING_HEADERS } from './constants'
import { getNormalizedHeaders } from './utils'
import { createSignature } from './create-signature'

const getRequestMetadata = (canonicalRequest: CanonicalRequest): RequestMetadata => {
  const normalizedSigningHeaders = getNormalizedHeaders(
    canonicalRequest.headers ?? {},
    CONTENTFUL_SIGNING_HEADERS
  )

  const signature = normalizedSigningHeaders[ContentfulSigningHeader.Signature]
  const signedHeaders = normalizedSigningHeaders[ContentfulSigningHeader.SignedHeaders]
    ? normalizedSigningHeaders[ContentfulSigningHeader.SignedHeaders].split(',')
    : []
  const timestamp = Number.parseInt(normalizedSigningHeaders[ContentfulSigningHeader.Timestamp], 10)

  return RequestMetadataValidator.check({ signature, signedHeaders, timestamp })
}

export const isVerifiedRequest = (
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest
): boolean => {
  const canonicalRequest = CanonicalRequestValidator.check(rawCanonicalRequest)
  const secret = SecretValidator.check(rawSecret)

  const { signature, signedHeaders, timestamp } = getRequestMetadata(canonicalRequest)

  const requestToValidate = { ...canonicalRequest, signedHeaders }

  const computedSignature = createSignature(secret, requestToValidate, timestamp)

  return signature === computedSignature
}
