import { FunctionTypeEnum } from './function'

export const RESOURCES_SEARCH_EVENT = FunctionTypeEnum.ResourcesSearch
export const RESOURCES_LOOKUP_EVENT = FunctionTypeEnum.ResourcesLookup

export type ResourcesSearchRequest = {
  type: FunctionTypeEnum.ResourcesSearch
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
    type: FunctionTypeEnum.ResourcesLookup
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
