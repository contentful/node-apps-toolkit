export const RESOURCES_SEARCH_EVENT = 'resources.search'
export const RESOURCES_LOOKUP_EVENT = 'resources.lookup'

export type ResourcesSearchRequest = {
  type: 'resources.search'
  resourceType: string
  query?: string
  limit: number
  locale?: string
  pages?: {
    nextCursor: string
  }
}

export type ResourcesSearchResponse<S extends Record<string, unknown> = Record<string, unknown>> = {
  items: S[]
  pages: {
    nextCursor?: string
  }
}

type Scalar = string | number | boolean

export type ResourcesLookupRequest<L extends Record<string, Scalar[]> = Record<string, Scalar[]>> =
  {
    type: 'resources.lookup'
    lookupBy: L
    resourceType: string
    limit: number
    pages?: {
      nextCursor: string
    }
  }

export type ResourcesLookupResponse<L extends Record<string, unknown> = Record<string, unknown>> = {
  items: L[]
  pages: {
    nextCursor?: string
  }
}
