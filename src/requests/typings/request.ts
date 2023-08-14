// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/
import { CanonicalRequest } from './validators'

export enum ContentfulHeader {
  Timestamp = 'x-contentful-timestamp',
  SignedHeaders = 'x-contentful-signed-headers',
  Signature = 'x-contentful-signature',
}

export enum ContentfulContextHeader {
  SpaceId = 'x-contentful-space-id',
  EnvironmentId = 'x-contentful-environment-id',
  UserId = 'x-contentful-user-id',
  AppId = 'x-contentful-app-id',
}

export type NormalizedCanonicalRequest = {
  method: CanonicalRequest['method']
  path: CanonicalRequest['path']
  headers: [key: string, value: string][]
  body: CanonicalRequest['body']
}

export type SubjectHeadersApp = { appId: string }
export type AppContextSignedHeaders = { [ContentfulContextHeader.AppId]: string }
export type SubjectHeadersUser = { userId: string }
export type UserContextSignedHeaders = { [ContentfulContextHeader.UserId]: string }

export type Context<SubjectContext> = {
  spaceId: string
  envId: string
} & SubjectContext

type SignedHeadersWithoutSubject = {
  [ContentfulContextHeader.SpaceId]: string
  [ContentfulContextHeader.EnvironmentId]: string
}

export type SignedContextHeaders<SubjectSignedHeaders> = SignedHeadersWithoutSubject &
  SubjectSignedHeaders

export type SignedRequestWithoutContextHeaders = {
  [key in ContentfulHeader]: string
}
export type SignedRequestWithContextHeadersWithUser = SignedRequestWithoutContextHeaders &
  SignedContextHeaders<UserContextSignedHeaders>
export type SignedRequestWithContextHeadersWithApp = SignedRequestWithoutContextHeaders &
  SignedContextHeaders<AppContextSignedHeaders>

export type SignedRequestHeaders =
  | SignedRequestWithContextHeadersWithUser
  | SignedRequestWithContextHeadersWithApp
  | SignedRequestWithoutContextHeaders
