import * as querystring from 'querystring'
import {
  AppContextSignedHeaders,
  ContentfulContextHeader,
  ContextHeaders,
  SignedContextHeaders,
  SubjectHeadersApp,
  SubjectHeadersUser,
  UserContextSignedHeaders,
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

const contextHeadersMap: Record<string, ContentfulContextHeader> = {
  spaceId: ContentfulContextHeader.SpaceId,
  envId: ContentfulContextHeader.EnvironmentId,
  appId: ContentfulContextHeader.AppId,
  userId: ContentfulContextHeader.UserId,
}

// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars, no-redeclare*/
export function normalizeContextHeaders(
  rawContext: ContextHeaders<SubjectHeadersApp>
): SignedContextHeaders<AppContextSignedHeaders>
export function normalizeContextHeaders(
  rawContext: ContextHeaders<SubjectHeadersUser>
): SignedContextHeaders<UserContextSignedHeaders>
export function normalizeContextHeaders(
  rawContext: ContextHeaders<SubjectHeadersApp> | ContextHeaders<SubjectHeadersUser>
) {
  return Object.keys(rawContext).reduce((acc, header) => {
    if (contextHeadersMap[header]) {
      const key = normalizeHeaderKey(contextHeadersMap[header]) as ContentfulContextHeader
      acc[key] = normalizeHeaderValue(
        acc[key] ??
          rawContext[
            header as keyof (ContextHeaders<SubjectHeadersUser> | ContextHeaders<SubjectHeadersApp>)
          ]
      )
    }
    return acc
  }, {} as Record<ContentfulContextHeader, string>)
}
/*eslint-enable no-unused-vars, no-redeclare*/

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
