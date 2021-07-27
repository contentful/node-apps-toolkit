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
  Subject,
} from './typings'
import { CanonicalRequestValidator, SecretValidator, TimestampValidator } from './typings'
import { getNormalizedEncodedURI, normalizeHeaders, sortHeaderKeys } from './utils'

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

const getSubjectHeaders = (contextHeaders: ContextHeaders): Subject => {
  let headers: Subject = {}

  if (contextHeaders[ContentfulUserIdHeader]) {
    headers[ContentfulUserIdHeader] = contextHeaders[ContentfulUserIdHeader]
  } else if (contextHeaders[ContentfulAppIdHeader]) {
    headers[ContentfulAppIdHeader] = contextHeaders[ContentfulAppIdHeader]
  }

  return headers
}

/**
 * Given a secret, a canonical request and a timestamp, generates a signature.
 * It can be used to verify canonical requests to assess authenticity of the
 * sender and integrity of the payload.
 *
 * ~~~
 * const {signRequest, ContentfulHeader} = require('@contentful/node-apps-toolkit')
 * const {pick} = require('lodash')
 * const {server} = require('./imaginary-server')
 *
 * const SECRET = process.env.SECRET
 *
 * server.post('/api/my-resources', (req, res) => {
 *   const incomingSignature = req.headers['x-contentful-signature']
 *   const incomingTimestamp = Number.parseInt(req.headers['x-contentful-timestamp'])
 *   const incomingSignedHeaders = req.headers['x-contentful-signed-headers']
 *   const now = Date.now()
 *
 *   if (!incomingSignature) {
 *     res.send(400, 'Missing signature')
 *   }
 *
 *   if (now - incomingTimestamp > 1000) {
 *     res.send(408, 'Request too old')
 *   }
 *
 *   const signedHeaders = incomingSignedHeaders.split(',')
 *
 *   const {[ContentfulHeader.Signature]: computedSignature} = signRequest(
 *     SECRET,
 *     {
 *       method: req.method,
 *       path: req.url,
 *       headers: pick(req.headers, signedHeaders),
 *       body: JSON.stringify(req.body)
 *     },
 *     incomingTimestamp
 *   )
 *
 *   if (computedSignature !== incomingSignature) {
 *      res.send(403, 'Invalid signature')
 *   }
 *
 *   // rest of the code
 * })
 *
 * ~~~
 * @category Requests
 */
export const signRequest = (
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimestamp: Timestamp = Date.now(),
  contextHeaders: ContextHeaders = {} as ContextHeaders
): SignedRequestHeaders => {
  const canonicalRequest: CanonicalRequest = CanonicalRequestValidator.check(rawCanonicalRequest)
  const timestamp: Timestamp = TimestampValidator.check(rawTimestamp)
  const secret: Secret = SecretValidator.check(rawSecret)

  const path = getNormalizedEncodedURI(canonicalRequest.path)
  const method = canonicalRequest.method
  const headers = canonicalRequest.headers ? normalizeHeaders(canonicalRequest.headers) : {}
  const body = canonicalRequest.body ?? ''

  const { sortedHeaders, signedHeaders } = getSortedAndSignedHeaders(
    { ...headers, ...((contextHeaders as unknown) as Record<string, string>) },
    timestamp
  )
  const subject = getSubjectHeaders(contextHeaders)

  return {
    [ContentfulHeader.Signature]: hash({ method, headers: sortedHeaders, path, body }, secret),
    [ContentfulHeader.SignedHeaders]: signedHeaders,
    [ContentfulHeader.Timestamp]: timestamp.toString(),
    [ContentfulHeader.SpaceId]: contextHeaders[ContentfulHeader.SpaceId],
    [ContentfulHeader.EnvironmentId]: contextHeaders[ContentfulHeader.EnvironmentId],
    ...subject,
  }
}
