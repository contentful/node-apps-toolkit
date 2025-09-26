export class HttpError extends Error {
  constructor(public response: Response) {
    super(`HTTP error: ${response.status} ${response.statusText}`)
  }
}
export type FetchOptions = {
  prefixUrl: string
  retry: { limit: number }
}
export const config: FetchOptions = {
  prefixUrl: process.env.BASE_URL || 'https://api.contentful.com',
  retry: { limit: 3 },
}
export const withDefaultOptions = (fetchOptions: Partial<FetchOptions>) => {
  return { ...config, ...fetchOptions }
}
type Requestor = () => Promise<Response>
export const makeRequest = (
  url: string,
  options: RequestInit,
  fetchOptions: FetchOptions,
): Requestor => {
  return async (): Promise<Response> => {
    const response = await fetch(`${fetchOptions.prefixUrl}${url}`, options)
    if (!response.ok) {
      throw new HttpError(response)
    }
    return response
  }
}

// eslint-disable-next-line no-unused-vars
type Hook = (response: Response) => Response
export const withHook = (requestor: Requestor, hook: Hook): Requestor => {
  return async (): Promise<Response> => {
    const response = await requestor()
    return hook(response)
  }
}

export const withRetry = (requestor: Requestor, fetchOptions: FetchOptions): Requestor => {
  return async (): Promise<Response> => {
    let lastError: Error | null = null
    let retries = 0
    do {
      try {
        return await requestor()
      } catch (error) {
        lastError = error as Error
        retries++
      }
    } while (retries <= fetchOptions.retry.limit)
    throw lastError
  }
}

export const createValidateStatusCode = (allowedStatusCodes: number[]) => (response: Response) => {
  if (!allowedStatusCodes.includes(response.status)) {
    console.log(response.body)
    throw new HttpError(response)
  }
  return response
}
