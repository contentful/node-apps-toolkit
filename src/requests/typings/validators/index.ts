import * as runtypes from 'runtypes'
import { proxyValidationError } from './proxy-validation-error'

const MethodValidator = proxyValidationError(
  runtypes.Union(
    runtypes.Literal('GET'),
    runtypes.Literal('PATCH'),
    runtypes.Literal('HEAD'),
    runtypes.Literal('POST'),
    runtypes.Literal('DELETE'),
    runtypes.Literal('OPTIONS'),
    runtypes.Literal('PUT'),
  ),
)

const PathValidator = proxyValidationError(
  runtypes.String.withConstraint((s) => s.startsWith('/'), {
    name: 'CanonicalURI',
  }),
)

const SignatureValidator = proxyValidationError(
  runtypes.String.withConstraint((s) => s.length === 64, {
    name: 'SignatureLength',
  }),
)

export const CanonicalRequestValidator = proxyValidationError(
  runtypes
    .Record({
      method: MethodValidator,
      path: PathValidator,
    })
    .And(
      runtypes.Partial({
        headers: runtypes.Dictionary(runtypes.String, 'string'),
        body: runtypes.String,
      }),
    ),
)
export type CanonicalRequest = runtypes.Static<typeof CanonicalRequestValidator>

export const SecretValidator = proxyValidationError(
  runtypes.String.withConstraint((s) => s.length === 64, {
    name: 'SecretLength',
  }),
)
export type Secret = runtypes.Static<typeof SecretValidator>

// Only dates after 01-01-2020
export const TimestampValidator = proxyValidationError(
  runtypes.Number.withConstraint((n) => n > 1577836800000, {
    name: 'TimestampAge',
  }),
)
export type Timestamp = runtypes.Static<typeof TimestampValidator>

const SignedHeadersValidator = proxyValidationError(
  runtypes
    .Array(runtypes.String)
    .withConstraint((l) => l.length >= 2, { name: 'MissingTimestampOrSignedHeaders' }),
)

export const RequestMetadataValidator = proxyValidationError(
  runtypes.Record({
    signature: SignatureValidator,
    timestamp: TimestampValidator,
    signedHeaders: SignedHeadersValidator,
  }),
)
export type RequestMetadata = runtypes.Static<typeof RequestMetadataValidator>

export const TimeToLiveValidator = proxyValidationError(
  runtypes.Number.withConstraint((n) => n >= 0, {
    name: 'PositiveNumber',
  }),
)
export type TimeToLive = runtypes.Static<typeof TimeToLiveValidator>
