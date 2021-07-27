import * as crypto from 'crypto'
import {
  CanonicalRequest,
  NormalizedCanonicalRequest,
  Secret,
  SignedRequestHeaders,
  Timestamp,
  ContentfulHeader,
  ContentfulAppIdHeader,
  ContentfulUserIdHeader,
  ContextHeaders,
  SubjectHeader,
} from './typings'
import { CanonicalRequestValidator, SecretValidator, TimestampValidator } from './typings'
import {
  getNormalizedEncodedURI,
  normalizeHeaders,
  sortHeaderKeys,
  normalizeContextHeaders,
} from './utils'

const hash = (normalizedCanonicalRequest: NormalizedCanonicalRequest, secret: string) => {
  const stringifiedHeaders = normalizedCanonicalRequest
    .headers!.map(([key, value]) => `${key}:${value}`)
    .join(';')

  const stringifiedRequest = [
    normalizedCanonicalRequest.method,
    normalizedCanonicalRequest.path,
    stringifiedHeaders,
    normalizedCanonicalRequest.body,
  ].join('\n')

  const hmac = crypto.createHmac('sha256', secret)

  hmac.update(stringifiedRequest)

  return hmac.digest('hex')
}

const getSortedAndSignedHeaders = (headers: Record<string, string>, timestamp: number) => {
  const rawSignedHeaders = Object.keys(headers)

  if (!(ContentfulHeader.SignedHeaders in headers)) {
    rawSignedHeaders.push(ContentfulHeader.SignedHeaders)
  }

  if (!(ContentfulHeader.Timestamp in headers)) {
    rawSignedHeaders.push(ContentfulHeader.Timestamp)
  }

  const signedHeaders = rawSignedHeaders.sort(sortHeaderKeys).join(',')

  headers[ContentfulHeader.Timestamp] = timestamp.toString()
  headers[ContentfulHeader.SignedHeaders] = signedHeaders

  const sortedHeaders = Object.entries(headers).sort(([keyA], [keyB]) => sortHeaderKeys(keyA, keyB))

  return { sortedHeaders, signedHeaders }
}

const getSubjectHeaders = (contextHeaders: any): SubjectHeader => {
  let headers: SubjectHeader = {}

  if (contextHeaders[ContentfulUserIdHeader]) {
    headers[ContentfulUserIdHeader] = contextHeaders[ContentfulUserIdHeader]
  } else if (contextHeaders[ContentfulAppIdHeader]) {
    headers[ContentfulAppIdHeader] = contextHeaders[ContentfulAppIdHeader]
  }

  return headers
}

/**
 * Given a secret, a canonical request, a timestamp and context headers, generates a signature.
 * ~~~
 * @category Requests
 */
export const signRequest = (
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimestamp: Timestamp = Date.now(),
  rawContextHeaders: ContextHeaders = {} as ContextHeaders
): SignedRequestHeaders => {
  const canonicalRequest: CanonicalRequest = CanonicalRequestValidator.check(rawCanonicalRequest)
  const timestamp: Timestamp = TimestampValidator.check(rawTimestamp)
  const secret: Secret = SecretValidator.check(rawSecret)

  const path = getNormalizedEncodedURI(canonicalRequest.path)
  const method = canonicalRequest.method
  const headers = canonicalRequest.headers ? normalizeHeaders(canonicalRequest.headers) : {}
  const body = canonicalRequest.body ?? ''
  const contextHeaders = normalizeContextHeaders(rawContextHeaders)
  const subject = getSubjectHeaders(contextHeaders)

  const { sortedHeaders, signedHeaders } = getSortedAndSignedHeaders(
    { ...headers, ...(contextHeaders as Record<string, string>) },
    timestamp
  )

  return {
    [ContentfulHeader.Signature]: hash({ method, headers: sortedHeaders, path, body }, secret),
    [ContentfulHeader.SignedHeaders]: signedHeaders,
    [ContentfulHeader.Timestamp]: timestamp.toString(),
    [ContentfulHeader.SpaceId]: rawContextHeaders.spaceId,
    [ContentfulHeader.EnvironmentId]: rawContextHeaders.envId,
    ...subject,
  }
}
