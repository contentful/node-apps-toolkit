// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/

import { AssetProps, EntryProps } from 'contentful-management'

const GRAPHQL_FIELD_MAPPING_EVENT = 'graphql.field.mapping'
const GRAPHQL_QUERY_EVENT = 'graphql.query'
const APP_EVENT_FILTER = 'appevent.filter'

type GraphQLFieldTypeMappingRequest = {
  type: typeof GRAPHQL_FIELD_MAPPING_EVENT
  fields: { contentTypeId: string; field: Field }[]
}

type Field = {
  id: string
  type: string
}

export type GraphQLFieldTypeMappingResponse = {
  namespace: string
  fields: GraphQLFieldTypeMapping[]
}

export type GraphQLFieldTypeMapping = {
  contentTypeId: string
  fieldId: string
  graphQLOutputType?: string
  graphQLQueryField: string
  graphQLQueryArguments: Record<string, string>
}

type GraphQLQueryRequest = {
  type: typeof GRAPHQL_QUERY_EVENT
  query: string
  isIntrospectionQuery: boolean
  variables: Record<string, unknown>
  operationName?: string
}

/**
 * @see https://spec.graphql.org/October2021/#sec-Response
 */
export type GraphQLQueryResponse = {
  data?: Record<string, any> | null
  errors?: readonly Record<string, any>[]
  extensions?: Record<string, unknown>
}

type AppEventFilter<T> = {
  type: typeof APP_EVENT_FILTER
  entityProps: T
  entityAction: string // 'create' | 'publish' etc etc.
}
// TODO: add all of the other app event subscription entities and topics/actions
export type AppEventEntryFilter = {
  entityType: 'Entry'
} & AppEventFilter<EntryProps>
export type AppEventAssetFilter = {
  entityType: 'Asset'
} & AppEventFilter<AssetProps>
export type AppEventFilterRequest = AppEventEntryFilter | AppEventAssetFilter

export type AppEventFilterResponse = {
  result: boolean
  errors?: readonly Record<string, any>[]
}

/**
 * P: Possibility to type app installation parameters
 */
export type FunctionEventContext<P extends Record<string, any> = Record<string, any>> = {
  spaceId: string
  environmentId: string
  appInstallationParameters: P
}

type FunctionEventHandlers = {
  [GRAPHQL_FIELD_MAPPING_EVENT]: {
    event: GraphQLFieldTypeMappingRequest
    response: GraphQLFieldTypeMappingResponse
  }
  [GRAPHQL_QUERY_EVENT]: {
    event: GraphQLQueryRequest
    response: GraphQLQueryResponse
  }
  [APP_EVENT_FILTER]: {
    event: AppEventFilterRequest
    response: AppEventFilterResponse
  }
}

export type FunctionEvent =
  | GraphQLFieldTypeMappingRequest
  | GraphQLQueryRequest
  | AppEventFilterRequest
export type FunctionEventType = keyof FunctionEventHandlers

/**
 * Event handler type that needs to be exported as `handler` from your function.
 * e.g. `const handler: FunctionEventHandler = (event, context) => { ... }`
 *
 * This type can also be used to construct helper functions for specific events
 * e.g. `const queryHandler: FunctionEventHandler<'graphql.query'> = (event, context) => { ... }
 */
export type FunctionEventHandler<
  K extends FunctionEventType = FunctionEventType,
  P extends Record<string, any> = Record<string, any>,
> = (
  event: FunctionEventHandlers[K]['event'],
  context: FunctionEventContext<P>,
) => Promise<FunctionEventHandlers[K]['response']> | FunctionEventHandlers[K]['response']
