import * as runtypes from 'runtypes'

const MethodValidator = runtypes.Union(
  runtypes.Literal('GET'),
  runtypes.Literal('PATCH'),
  runtypes.Literal('HEAD'),
  runtypes.Literal('POST'),
  runtypes.Literal('DELETE'),
  runtypes.Literal('OPTIONS'),
  runtypes.Literal('PUT')
)

const PathValidator = runtypes.String.withConstraint((s) => s.startsWith('/'), {
  name: 'CanonicalURI',
})

const SignatureValidator = runtypes.String.withConstraint((s) => s.length === 64, {
  name: 'SignatureLength',
})

const SignedHeadersValidator = runtypes.Array(runtypes.String)

export const CanonicalRequestValidator = runtypes
  .Record({
    method: MethodValidator,
    path: PathValidator,
  })
  .And(
    runtypes.Partial({
      signedHeaders: SignedHeadersValidator,
      headers: runtypes.Dictionary(runtypes.String, 'string'),
      body: runtypes.String,
    })
  )

export type CanonicalRequest = runtypes.Static<typeof CanonicalRequestValidator>

export const SecretValidator = runtypes.String.withConstraint((s) => s.length === 64, {
  name: 'SecretLength',
})
export type Secret = runtypes.Static<typeof SecretValidator>

// Only dates after 01-01-2020
export const TimestampValidator = runtypes.Number.withConstraint((n) => n > 1577836800000, {
  name: 'TimestampAge',
})
export type Timestamp = runtypes.Static<typeof TimestampValidator>

export const RequestMetadataValidator = runtypes
  .Record({
    signature: SignatureValidator,
    timestamp: TimestampValidator,
  })
  .And(
    runtypes.Partial({
      signedHeaders: SignedHeadersValidator,
    })
  )
export type RequestMetadata = runtypes.Static<typeof RequestMetadataValidator>
