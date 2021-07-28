import * as querystring from 'querystring'
import {
  ContextHeaders,
  ContentfulHeader,
  ContentfulUserIdHeader,
  ContentfulAppIdHeader,
  SignedRequestHeaders,
} from './typings'

export const getNormalizedEncodedURI = (uri: string) => {
  const [pathname, search] = uri.split('?')
  const escapedSearch = search ? querystring.escape(search) : ''

  return encodeURI(escapedSearch ? `${pathname}?${escapedSearch}` : pathname)
}

export const sortHeaderKeys = (keyA: string, keyB: string) => (keyA > keyB ? 1 : -1)

const normalizeHeaderKey = (key: string) => key.toLowerCase().trim()
const normalizeHeaderValue = (value: string) => value.trim()
export const normalizeHeaders = (headers: Record<string, string>) =>
  map(headers, ([key, value]) => [normalizeHeaderKey(key), normalizeHeaderValue(value)])

export const pickHeaders = (headers?: Record<string, string>, keys?: string[]) => {
  if (!headers) {
    return {}
  }

  if (!keys) {
    return headers
  }

  return filter(headers, ([key]) => keys.includes(key))
}

const contextHeadersMap: Record<string, string> = {
  spaceId: ContentfulHeader.SpaceId as const,
  envId: ContentfulHeader.EnvironmentId as const,
  appId: ContentfulAppIdHeader,
  userId: ContentfulUserIdHeader,
}
export const normalizeContextHeaders = (
  rawContextHeaders: ContextHeaders
): Partial<SignedRequestHeaders> => {
  return Object.keys(rawContextHeaders).reduce((acc, curr) => {
    if (contextHeadersMap[curr]) {
      let key = contextHeadersMap[curr]
      acc[key] = acc[key] ?? rawContextHeaders[curr as keyof ContextHeaders]
    }
    return acc
  }, {} as Record<string, string>)
}

// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/
export const filter = <T = string>(
  obj: Record<string, any>,
  callback: (entry: [string, T]) => boolean
) => {
  return Object.fromEntries(Object.entries(obj).filter(callback))
}

export const map = <T = string>(
  obj: Record<string, any>,
  callback: (entry: [string, T]) => [string, T]
) => {
  return Object.fromEntries(Object.entries(obj).map(callback))
}
/*eslint-enable no-unused-vars*/
