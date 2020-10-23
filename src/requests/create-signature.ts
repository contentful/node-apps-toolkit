import * as crypto from "crypto";
import type {CanonicalRequest, Secret, Timestamp} from "./typings";
import {CanonicalRequestValidator, SecretValidator, TimestampValidator} from "./typings";
import {getNormalizedEncodedURI, getNormalizedHeaders} from "./utils";

const hash = (normalizedCanonicalRequest: CanonicalRequest, secret: string) => {
  const stringifiedHeaders = Object.entries(normalizedCanonicalRequest.headers!).map(([key, value]) => `${key}:${value}`).join(';')

  const stringifiedRequest = [
    normalizedCanonicalRequest.method,
    normalizedCanonicalRequest.path,
    stringifiedHeaders,
    normalizedCanonicalRequest.body
  ].join('\n');

  const hmac = crypto.createHmac('sha256', secret)

  hmac.update(stringifiedRequest)

  return hmac.digest('base64')
}

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
  const headers = canonicalRequest.headers ? getNormalizedHeaders(canonicalRequest.headers, timestamp) : {}
  const body = canonicalRequest.body ?? ''

  return hash({method, headers, path, body}, secret)
}
