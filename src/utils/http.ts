import {
  Options,
  KyInstance,
  HTTPError,
  KyResponse,
  AfterResponseHook,
  KyRequest,
  NormalizedOptions,
} from 'ky'

const config = {
  prefixUrl: process.env.BASE_URL || 'https://api.contentful.com',
  retry: { limit: 3 },
}

export const createHttpClient = async (configOverride: Options = {}) => {
  const { default: ky } = await import('ky')
  return ky.extend({ ...config, ...configOverride })
}

export const createValidateStatusCode =
  (allowedStatusCodes: number[]): AfterResponseHook =>
  (request: KyRequest, options: NormalizedOptions, response: KyResponse) => {
    if (!allowedStatusCodes.includes(response.status)) {
      console.log(response.body)
      throw new HTTPError(response, request, options)
    }
    return response
  }

export { HTTPError as HttpError }

export type HttpClient = KyInstance
export type Request = KyRequest
export type Response = KyResponse
export type ErrorOptions = NormalizedOptions
