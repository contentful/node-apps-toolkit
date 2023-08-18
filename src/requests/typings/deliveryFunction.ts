// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/

export enum DeliveryFunctionRequestEventType {
  GRAPHQL_FIELD_MAPPING = 'graphql.field.mapping',
  GRAPHQL_QUERY = 'graphql.query',
}

export type GraphQLFieldTypeMappingRequest = {
  fields: { contentTypeId: string; field: Field }[]
}

type Field = {
  id: string
  type: string
}

export type GraphQLFieldTypeMappingResponse = GraphQLFieldTypeMapping[]

export type GraphQLFieldTypeMapping = {
  contentTypeId: string
  fieldId: string
  graphQLOutputType: string
  graphQLQueryField: string
  graphQLQueryArgument: string
}

export type GraphQLQueryRequest = {
  query: string
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

export type DeliveryFunctionEventHandlers = {
  [DeliveryFunctionRequestEventType.GRAPHQL_FIELD_MAPPING]: (
    event: GraphQLFieldTypeMappingRequest,
    context: DeliveryFunctionEventContext
  ) => Promise<GraphQLFieldTypeMappingResponse>
  [DeliveryFunctionRequestEventType.GRAPHQL_QUERY]: (
    event: GraphQLQueryRequest,
    context: DeliveryFunctionEventContext
  ) => Promise<GraphQLQueryResponse>
}
