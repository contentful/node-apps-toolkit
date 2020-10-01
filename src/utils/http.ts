import got, { Got, HTTPError, Response as GotResponse } from 'got'

const config = {
  prefixUrl: process.env.BASE_URL || 'https://api.contentful.com',
  retry: { limit: 3 }
}

export const createHttpClient = () => {
  return got.extend(config)
}

export const createValidateStatusCode = (allowedStatusCodes: number[]) => (response: Response) => {
  if (!allowedStatusCodes.includes(response.statusCode)) {
    throw new HTTPError(response)
  }
  return response
}

export { HTTPError as HttpError }

export type HttpClient = Got
export type Response = GotResponse
