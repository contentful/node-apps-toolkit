import got, { ExtendOptions, Got, HTTPError, Response as GotResponse } from 'got'
import { createLogger } from './logger'

const log = createLogger({ namespace: 'utils/http' })

const config = {
  prefixUrl: process.env.BASE_URL || 'https://api.contentful.com',
  retry: { limit: 3 },
}

export const createHttpClient = (configOverride: ExtendOptions = {}) => {
  return got.extend({ ...config, ...configOverride })
}

export const createValidateStatusCode = (allowedStatusCodes: number[]) => (response: Response) => {
  if (!allowedStatusCodes.includes(response.statusCode)) {
    log(`unexpected status code %d: %s`, response.statusCode, response.body)
    throw new HTTPError(response)
  }
  return response
}

export { HTTPError as HttpError }

export type HttpClient = Got
export type Response = GotResponse
