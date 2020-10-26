import * as crypto from 'crypto'
import type { CanonicalRequest, Secret, Timestamp } from './typings'
import { CanonicalRequestValidator, SecretValidator, TimestampValidator } from './typings'
import { getNormalizedEncodedURI, getNormalizedHeaders } from './utils'

const hash = (normalizedCanonicalRequest: CanonicalRequest, secret: string) => {
  const stringifiedHeaders = Object.entries(normalizedCanonicalRequest.headers!)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')

  const stringifiedRequest = [
    normalizedCanonicalRequest.method,
    normalizedCanonicalRequest.path,
    stringifiedHeaders,
    normalizedCanonicalRequest.body,
  ].join('\n')

  const hmac = crypto.createHmac('sha256', secret)

  hmac.update(stringifiedRequest)

  return hmac.digest('base64')
}

/**
 * Given a secret, a canonical request and a timestamp, generates a signature.
 * It can be used to verify canonical requests to assess authenticity of the
 * sender and integrity of the payload.
 *
 * ~~~
 * const {createSignature} = require('contentful-node-apps-toolkit')
 * const {omit} = require('lodash')
 * const {server} = require('./imaginary-server')
 *
 * const SECRET = process.env.SECRET
 *
 * server.post('/api/my-resources', (req, res) => {
 *   const incomingSignature = req.headers['x-signature']
 *   const incomingTimestamp = req.headers['x-timestamp']
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
 *   const computedSignature = createSignature(
 *     SECRET,
 *     {
 *       method: req.method,
 *       path: req.url
 *       headers: omit(req.headers, 'x-signature'),
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
  const headers = canonicalRequest.headers
    ? getNormalizedHeaders(canonicalRequest.headers, timestamp)
    : {}
  const body = canonicalRequest.body ?? ''

  return hash({ method, headers, path, body }, secret)
}
