import * as querystring from 'querystring'

export const getNormalizedEncodedURI = (uri: string) => {
  const [pathname, search] = uri.split('?')
  const escapedSearch = search ? querystring.escape(search) : ''

  return encodeURI(escapedSearch ? `${pathname}?${escapedSearch}` : pathname)
}

const normalizeHeaderKey = (key: string) => key.toLowerCase().trim()

export const getNormalizedHeaders = (
  rawHeaders: Record<string, string | unknown>,
  headersToNormalize: Array<string>
) => {
  //in case the list of the headers to normalize is not normalized itself
  const normalizedHeadersToNormalize: string[] = headersToNormalize.map(normalizeHeaderKey)

  const normalizedHeaders: Record<string, string> = {}

  for (const [key, value] of Object.entries(rawHeaders)) {
    const normalizedKey = normalizeHeaderKey(key)

    if (normalizedHeadersToNormalize.includes(normalizedKey) && typeof value === 'string') {
      normalizedHeaders[normalizedKey] = encodeURI(value.trim())
    }
  }

  return normalizedHeaders
}
