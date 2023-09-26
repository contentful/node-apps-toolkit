// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/

const GRAPHQL_FIELD_MAPPING_EVENT = 'graphql.field.mapping'
const GRAPHQL_QUERY_EVENT = 'graphql.query'

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
  graphQLOutputType: string
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

/**
 * P: Possibility to type app installation parameters
 */
export type DeliveryFunctionEventContext<P extends Record<string, any> = Record<string, any>> = {
  spaceId: string
  environmentId: string
  appInstallationParameters: P
}

type DeliveryFunctionEventHandlers = {
  [GRAPHQL_FIELD_MAPPING_EVENT]: {
    event: GraphQLFieldTypeMappingRequest
    response: GraphQLFieldTypeMappingResponse
  }
  [GRAPHQL_QUERY_EVENT]: {
    event: GraphQLQueryRequest
    response: GraphQLQueryResponse
  }
}

export type DeliveryFunctionEvent = GraphQLFieldTypeMappingRequest | GraphQLQueryRequest
export type DeliveryFunctionEventType = keyof DeliveryFunctionEventHandlers

/**
 * Event handler type that needs to be exported as `handler` from your delivery function.
 * e.g. `const handler: DeliveryFunctionEventHandler = (event, context) => { ... }`
 *
 * This type can also be used to construct helper functions for specific events
 * e.g. `const queryHandler: DeliveryFunctionEventHandler<'graphql.query'> = (event, context) => { ... }
 */
export type DeliveryFunctionEventHandler<
  K extends DeliveryFunctionEventType = DeliveryFunctionEventType,
  P extends Record<string, any> = Record<string, any>
> = (
  event: DeliveryFunctionEventHandlers[K]['event'],
  context: DeliveryFunctionEventContext<P>
) =>
  | Promise<DeliveryFunctionEventHandlers[K]['response']>
  | DeliveryFunctionEventHandlers[K]['response']
