import * as querystring from 'querystring'

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

export const pickHeaders = (headers: Record<string, string>, keys: string[]) => {
  return filter(headers, ([key]) => keys.includes(key))
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
