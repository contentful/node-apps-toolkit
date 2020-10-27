export const ContentfulSigningHeader = {
  Timestamp: 'x-contentful-timestamp',
  SignedHeaders: 'x-contentful-signed-headers',
  Signature: 'x-contentful-signature',
}

export const CONTENTFUL_SIGNING_HEADERS = Object.values(ContentfulSigningHeader)
