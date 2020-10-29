import * as crypto from 'crypto'
import type {
  CanonicalRequest,
  NormalizedCanonicalRequest,
  NormalizedHeaders,
  Secret,
  Timestamp,
} from './typings'
import { CanonicalRequestValidator, SecretValidator, TimestampValidator } from './typings'
import { getNormalizedEncodedURI, getNormalizedHeaders } from './utils'
import { ContentfulHeader } from './constants'

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

const enrichNormalizedHeadersWithMetadata = (headers: NormalizedHeaders, timestamp: number) => {
  const result = [...headers]
  const headerKeys = headers.map(([key]) => key)
  const joinedSignedHeaders = headerKeys
    // We always sign timestamp
    .concat(ContentfulHeader.Timestamp, ContentfulHeader.SignedHeaders)
    .join(',')

  result.push([ContentfulHeader.Timestamp, timestamp.toString()])
  result.push([ContentfulHeader.SignedHeaders, joinedSignedHeaders])

  return result
}

/**
 * Given a secret, a canonical request and a timestamp, generates a signature.
 * It can be used to verify canonical requests to assess authenticity of the
 * sender and integrity of the payload.
 *
 * ~~~
 * const {createSignature} = require('contentful-node-apps-toolkit')
 * const {pick} = require('lodash')
 * const {server} = require('./imaginary-server')
 *
 * const SECRET = process.env.SECRET
 *
 * server.post('/api/my-resources', (req, res) => {
 *   const incomingSignature = req.headers['x-contentful-signature']
 *   const incomingTimestamp = req.headers['x-contentful-timestamp']
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
 *   const computedSignature = createSignature(
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
export const createSignature = (
  rawSecret: Secret,
  rawCanonicalRequest: CanonicalRequest,
  rawTimestamp: Timestamp
) => {
  const canonicalRequest: CanonicalRequest = CanonicalRequestValidator.check(rawCanonicalRequest)
  const timestamp: Timestamp = TimestampValidator.check(rawTimestamp)
  const secret: Secret = SecretValidator.check(rawSecret)

  const path = getNormalizedEncodedURI(canonicalRequest.path)
  const method = canonicalRequest.method
  const headers = canonicalRequest.headers ? getNormalizedHeaders(canonicalRequest.headers) : []
  const body = canonicalRequest.body ?? ''

  const normalizedHeadersWithMetadata = enrichNormalizedHeadersWithMetadata(headers, timestamp)

  return hash({ method, headers: normalizedHeadersWithMetadata, path, body }, secret)
}
