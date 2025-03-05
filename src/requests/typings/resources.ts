export type ResourcesSearchRequest = {
  type: 'resources.search'
  resourceType: string
  query?: string
  locale?: string
  limit: number
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
    locale?: string
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
