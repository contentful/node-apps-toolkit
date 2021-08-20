import * as crypto from 'crypto'
import {
  CanonicalRequest,
  NormalizedCanonicalRequest,
  Secret,
  Timestamp,
  ContentfulHeader,
  ContextHeaders,
  SignedRequestWithoutContextHeaders,
  SubjectHeadersApp,
  SubjectHeadersUser,
  SignedRequestWithContextHeadersWithApp,
  SignedRequestWithContextHeadersWithUser,
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

/**
 * Given a secret, a canonical request, a timestamp and context headers, generates a signature.
 * ~~~
 * @category Requests
 */
// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars, no-redeclare*/
export function signRequest(
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimestamp?: Timestamp
): SignedRequestWithoutContextHeaders
export function signRequest(
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimestamp?: Timestamp,
  rawContext?: ContextHeaders<SubjectHeadersApp>
): SignedRequestWithContextHeadersWithApp
export function signRequest(
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimestamp?: Timestamp,
  rawContext?: ContextHeaders<SubjectHeadersUser>
): SignedRequestWithContextHeadersWithUser
export function signRequest(
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimestamp?: Timestamp,
  rawContext?: any
) {
  const maybeDefaultTimestamp = rawTimestamp ?? Date.now()
  const canonicalRequest: CanonicalRequest = CanonicalRequestValidator.check(rawCanonicalRequest)
  const timestamp: Timestamp = TimestampValidator.check(maybeDefaultTimestamp)
  const secret: Secret = SecretValidator.check(rawSecret)

  const path = getNormalizedEncodedURI(canonicalRequest.path)
  const method = canonicalRequest.method
  const headers = canonicalRequest.headers ? normalizeHeaders(canonicalRequest.headers) : {}
  const body = canonicalRequest.body ?? ''

  const contextHeaders = rawContext ? normalizeContextHeaders(rawContext) : undefined

  const { sortedHeaders, signedHeaders } = contextHeaders
    ? getSortedAndSignedHeaders({ ...headers, ...contextHeaders }, timestamp)
    : getSortedAndSignedHeaders(headers, timestamp)

  return {
    [ContentfulHeader.Signature]: hash({ method, headers: sortedHeaders, path, body }, secret),
    [ContentfulHeader.SignedHeaders]: signedHeaders,
    [ContentfulHeader.Timestamp]: timestamp.toString(),
    ...(contextHeaders ?? {}),
  }
}
/*eslint-enable no-unused-vars,no-redeclare */
