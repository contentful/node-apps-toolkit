import { FunctionTypeEnum } from './function'

export const RESOURCES_SEARCH_EVENT = FunctionTypeEnum.RESOURCES_SEARCH
export const RESOURCES_LOOKUP_EVENT = FunctionTypeEnum.RESOURCES_LOOKUP

export type ResourcesSearchRequest = {
  type: FunctionTypeEnum.RESOURCES_SEARCH
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
    type: FunctionTypeEnum.RESOURCES_LOOKUP
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
