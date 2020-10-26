import * as querystring from 'querystring'
import * as url from 'url'
import type { Timestamp } from './typings'

export const getNormalizedEncodedURI = (uri: string) => {
  const parsedUri = url.parse(uri)

  parsedUri.query = parsedUri.query ? querystring.escape(parsedUri.query) : ''

  return encodeURI(url.format(parsedUri))
}

export const getNormalizedHeaders = (headers: Record<string, string>, timestamp: Timestamp) => {
  const sortedHeaders = Object.entries(headers).sort(([keyOne], [keyTwo]) =>
    keyOne > keyTwo ? 1 : 0
  )

  const normalizedHeaders: Record<string, string> = {}

  for (const [key, header] of sortedHeaders) {
    const normalizedKey = key.toLowerCase().trim()

    normalizedHeaders[normalizedKey] = header.trim()
  }

  normalizedHeaders['x-contentful-timestamp'] = timestamp.toString()

  return normalizedHeaders
}
