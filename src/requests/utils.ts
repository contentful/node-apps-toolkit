import * as querystring from 'querystring'
import { NormalizedHeaders } from './typings'

export const getNormalizedEncodedURI = (uri: string) => {
  const [pathname, search] = uri.split('?')
  const escapedSearch = search ? querystring.escape(search) : ''

  return encodeURI(escapedSearch ? `${pathname}?${escapedSearch}` : pathname)
}

export const normalizeHeaderKey = (key: string) => key.toLowerCase().trim()
const normalizeHeaderValue = (value: string) => encodeURI(value.trim())

export const getNormalizedHeaders = (rawHeaders: Record<string, string>): NormalizedHeaders => {
  // @ts-expect-error .sort messes up with the typings
  return Object.entries(rawHeaders)
    .map(([key, value]) => [normalizeHeaderKey(key), normalizeHeaderValue(value)])
    .sort(([keyA], [keyB]) => (keyA > keyB ? 1 : -1))
}

export const pickHeaders = (object?: Record<string, string>, keys?: string[]) => {
  if (!object) {
    return {}
  }

  if (!keys) {
    return object
  }

  const normalizedKeys = keys.map(normalizeHeaderKey)

  return Object.fromEntries(
    Object.entries(object).filter(([key]) => normalizedKeys.includes(normalizeHeaderKey(key)))
  )
}
