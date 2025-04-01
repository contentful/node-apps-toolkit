// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/

import { AppActionCategoryType, ClientOptions, PlainClientAPI } from 'contentful-management'
import { AppActionCategoryBodyMap, AppActionRequestBody } from './appAction'
import { AppEventPayloadMap } from './event-payloads'
import {
  type ResourcesLookupRequest,
  type ResourcesLookupResponse,
  type ResourcesSearchRequest,
  type ResourcesSearchResponse,
} from './resources'

export enum FunctionTypeEnum {
  GraphqlFieldMapping = 'graphql.field.mapping',
  GraphqlResourceTypeMapping = 'graphql.resourcetype.mapping',
  GraphqlQuery = 'graphql.query',
  AppEventFilter = 'appevent.filter',
  AppEventHandler = 'appevent.handler',
  AppEventTransformation = 'appevent.transformation',
  AppActionCall = 'appaction.call',
  ResourcesSearch = 'resources.search',
  ResourcesLookup = 'resources.lookup',
}

type GraphQLFieldTypeMappingRequest = {
  type: FunctionTypeEnum.GraphqlFieldMapping
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

type GraphQLResourceTypeMappingRequest = {
  type: FunctionTypeEnum.GraphqlResourceTypeMapping
  resourceTypes: {
    resourceTypeId: string
  }[]
}

type GraphQLResourceTypeMappingResponse = {
  resourceTypes: GraphQLResourceTypeMapping[]
}

type GraphQLResourceTypeMapping = {
  graphQLQueryField: string
  graphQLQueryArguments: Record<string, string>
  resourceTypeId: string
  graphQLOutputType?: string
}

type GraphQLQueryRequest = {
  type: FunctionTypeEnum.GraphqlQuery
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

type AppEventEntityName = keyof AppEventPayloadMap
type AppEventEntityActions<T extends AppEventEntityName> = keyof AppEventPayloadMap[T] & string
type AppEventEntityPayload<
  T extends AppEventEntityName,
  A extends AppEventEntityActions<T>,
> = AppEventPayloadMap[T][A]

type AppEventBase<
  EntityName extends AppEventEntityName,
  EntityAction extends AppEventEntityActions<EntityName>,
> = {
  headers: Record<string, string | number> & {
    'X-Contentful-Topic': `ContentManagement.${EntityName}.${EntityAction}`
  }
  body: AppEventEntityPayload<EntityName, EntityAction>
  type:
    | FunctionTypeEnum.AppEventHandler
    | FunctionTypeEnum.AppEventTransformation
    | FunctionTypeEnum.AppEventFilter
}

export type AppEventContentType = {
  [A in AppEventEntityActions<'ContentType'>]: AppEventBase<'ContentType', A>
}[AppEventEntityActions<'ContentType'>]

export type AppEventEntry = {
  [A in AppEventEntityActions<'Entry'>]: AppEventBase<'Entry', A>
}[AppEventEntityActions<'Entry'>]

export type AppEventAsset = {
  [A in AppEventEntityActions<'Asset'>]: AppEventBase<'Asset', A>
}[AppEventEntityActions<'Asset'>]

export type AppEventAppInstallation = {
  [A in AppEventEntityActions<'AppInstallation'>]: AppEventBase<'AppInstallation', A>
}[AppEventEntityActions<'AppInstallation'>]

export type AppEventTask = {
  [A in AppEventEntityActions<'Task'>]: AppEventBase<'Task', A>
}[AppEventEntityActions<'Task'>]

export type AppEventComment = {
  [A in AppEventEntityActions<'Comment'>]: AppEventBase<'Comment', A>
}[AppEventEntityActions<'Comment'>]

export type AppEventRelease = {
  [A in AppEventEntityActions<'Release'>]: AppEventBase<'Release', A>
}[AppEventEntityActions<'Release'>]

export type AppEventReleaseAction = {
  [A in AppEventEntityActions<'ReleaseAction'>]: AppEventBase<'ReleaseAction', A>
}[AppEventEntityActions<'ReleaseAction'>]

export type AppEventScheduledAction = {
  [A in AppEventEntityActions<'ScheduledAction'>]: AppEventBase<'ScheduledAction', A>
}[AppEventEntityActions<'ScheduledAction'>]

export type AppEventBulkAction = {
  [A in AppEventEntityActions<'BulkAction'>]: AppEventBase<'BulkAction', A>
}[AppEventEntityActions<'BulkAction'>]

export type AppEventTemplateInstallation = {
  [A in AppEventEntityActions<'TemplateInstallation'>]: AppEventBase<'TemplateInstallation', A>
}[AppEventEntityActions<'TemplateInstallation'>]

export type AppEventWorkflow = {
  [A in AppEventEntityActions<'Workflow'>]: AppEventBase<'Workflow', A>
}[AppEventEntityActions<'Workflow'>]

export type AppEventRequest = {
  [T in AppEventEntityName]: {
    [A in AppEventEntityActions<T>]: AppEventBase<T, A>
  }[AppEventEntityActions<T>]
}[AppEventEntityName]

export type AppEventFilterResponse = {
  result: boolean
}

export type AppEventTransformationResponse = {
  headers: Record<string, string | number>
  body: Record<string, unknown>
}

export type AppEventHandlerResponse = void

/**
 * The app action request body will contain different parameters depending on the category of the app action
 *
 * Specify your app action category as the generic type `Category` to get the correct body type,
 * e.g. `const { body: { message, recipient }} = event as AppActionRequest<'Notification.v1.0'>`
 *
 * If you are using the Custom category, you can specify the parameter shape as the second generic type `CustomCategoryBody`,
 * e.g. `const { body: { myNumber }} = event as AppActionRequest<'Custom', { myNumber: number }>`
 */
export type AppActionRequest<
  CategoryType extends AppActionCategoryType = 'Custom',
  CustomCategoryBody = AppActionCategoryBodyMap['Custom'],
> = {
  headers: Record<string, string | number>
  body: CategoryType extends 'Custom' ? CustomCategoryBody : AppActionRequestBody<CategoryType>
  type: FunctionTypeEnum.AppActionCall
}

export type AppActionResponse = void | Record<string, unknown>

/**
 * P: Possibility to type app installation parameters
 */
export type FunctionEventContext<P extends Record<string, any> = Record<string, any>> = {
  spaceId: string
  environmentId: string
  appInstallationParameters: P
  cmaClientOptions?: ClientOptions
  cma?: PlainClientAPI
}

/**
 * T: Possibility to type app action category
 * U: Possibility to type app action body (only applies to the Custom category)
 */
type FunctionEventHandlers<
  T extends AppActionCategoryType = never,
  U extends AppActionRequestBody<T> = never,
> = {
  [FunctionTypeEnum.GraphqlFieldMapping]: {
    event: GraphQLFieldTypeMappingRequest
    response: GraphQLFieldTypeMappingResponse
  }
  [FunctionTypeEnum.GraphqlResourceTypeMapping]: {
    event: GraphQLResourceTypeMappingRequest
    response: GraphQLResourceTypeMappingResponse
  }
  [FunctionTypeEnum.GraphqlQuery]: {
    event: GraphQLQueryRequest
    response: GraphQLQueryResponse
  }
  [FunctionTypeEnum.AppActionCall]: {
    event: AppActionRequest<T, U>
    response: AppActionResponse
  }
  [FunctionTypeEnum.AppEventFilter]: {
    event: AppEventRequest
    response: AppEventFilterResponse
  }
  [FunctionTypeEnum.AppEventHandler]: {
    event: AppEventRequest
    response: AppEventHandlerResponse
  }
  [FunctionTypeEnum.AppEventTransformation]: {
    event: AppEventRequest
    response: AppEventTransformationResponse
  }
  [FunctionTypeEnum.ResourcesSearch]: {
    event: ResourcesSearchRequest
    response: ResourcesSearchResponse
  }
  [FunctionTypeEnum.ResourcesLookup]: {
    event: ResourcesLookupRequest
    response: ResourcesLookupResponse
  }
}

export type FunctionEvent =
  | GraphQLFieldTypeMappingRequest
  | GraphQLResourceTypeMappingRequest
  | GraphQLQueryRequest
  | AppActionRequest
  | AppEventRequest
  | ResourcesSearchRequest
  | ResourcesLookupRequest
export type FunctionEventType = keyof FunctionEventHandlers

/**
 * Event handler type that needs to be exported as `handler` from your function.
 * e.g. `const handler: FunctionEventHandler = (event, context) => { ... }`
 *
 * This type can also be used to construct helper functions for specific events
 * e.g. `const queryHandler: FunctionEventHandler<'graphql.query'> = (event, context) => { ... }`
 */
export type FunctionEventHandler<
  K extends FunctionEventType = FunctionEventType,
  P extends Record<string, any> = Record<string, any>,
> = (
  event: FunctionEventHandlers[K]['event'],
  context: FunctionEventContext<P>,
) => Promise<FunctionEventHandlers[K]['response']> | FunctionEventHandlers[K]['response']
