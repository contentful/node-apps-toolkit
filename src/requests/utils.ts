import * as querystring from 'querystring'
import { ContentfulSigningHeader } from './constants'
import type { Timestamp } from './typings'

export const getNormalizedEncodedURI = (uri: string) => {
  const [pathname, search] = uri.split('?')
  const escapedSearch = search ? querystring.escape(search) : ''

  return encodeURI(escapedSearch ? `${pathname}?${escapedSearch}` : pathname)
}

export const getNormalizedHeaders = (
  headers: Record<string, string>,
  signedHeaders: Array<string>,
  timestamp: Timestamp
) => {
  const normalizedHeaders: Record<string, string> = {}

  for (const headerKey of signedHeaders) {
    const headerValue = headers[headerKey]
    const normalizedKey = headerKey.toLowerCase().trim()

    normalizedHeaders[normalizedKey] = encodeURI(headerValue.trim())
  }

  normalizedHeaders[ContentfulSigningHeader.Timestamp] = timestamp.toString()
  normalizedHeaders[ContentfulSigningHeader.SignedHeaders] = signedHeaders.join(',')

  return normalizedHeaders
}
