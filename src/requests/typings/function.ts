// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/

import {
  AppInstallationProps,
  AssetProps,
  BulkActionProps,
  CommentProps,
  ContentTypeProps,
  EntryProps,
  EnvironmentTemplateInstallationProps,
  PlainClientAPI,
  ReleaseActionProps,
  ReleaseProps,
  ScheduledActionProps,
  TaskProps,
} from 'contentful-management'
import {
  RESOURCES_SEARCH_EVENT,
  RESOURCES_LOOKUP_EVENT,
  type ResourcesLookupRequest,
  type ResourcesLookupResponse,
  type ResourcesSearchRequest,
  type ResourcesSearchResponse,
} from './resources'

const GRAPHQL_FIELD_MAPPING_EVENT = 'graphql.field.mapping'
const GRAPHQL_QUERY_EVENT = 'graphql.query'
const APP_EVENT_FILTER = 'appevent.filter'
const APP_EVENT_HANDLER = 'appevent.handler'
const APP_EVENT_TRANSFORMATION = 'appevent.transformation'
const APP_ACTION_CALL = 'appaction.call'

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

type ContentTypeActions = 'create' | 'save' | 'publish' | 'unpublish' | 'delete'
type EntryActions =
  | 'create'
  | 'save'
  | 'auto_save'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'unarchive'
  | 'delete'
type AssetActions =
  | 'create'
  | 'save'
  | 'auto_save'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'unarchive'
  | 'delete'
type AppInstallationActions = 'create' | 'save' | 'delete'
type TaskActions = 'create' | 'save' | 'delete'
type CommentActions = 'create' | 'delete'
type ReleaseActions = 'create' | 'save' | 'delete'
type ReleaseActionActions = 'create' | 'execute'
type ScheduledActionActions = 'create' | 'save' | 'delete' | 'execute'
type BulkActionActions = 'create' | 'execute'
type TemplateInstallationActions = 'complete'

type AppEventBase<EntityName extends string, EntityActions extends string, EntityProps> = {
  headers: Record<string, string | number> & {
    'X-Contentful-Topic': `ContentManagement.${EntityName}.${EntityActions}`
  }
  body: EntityProps
  type: typeof APP_EVENT_HANDLER | typeof APP_EVENT_TRANSFORMATION | typeof APP_EVENT_FILTER
}
export type AppEventContentType = AppEventBase<'ContentType', ContentTypeActions, ContentTypeProps>
export type AppEventEntry = AppEventBase<'Entry', EntryActions, EntryProps>
export type AppEventAsset = AppEventBase<'Asset', AssetActions, AssetProps>
export type AppEventAppInstallation = AppEventBase<
  'AppInstallation',
  AppInstallationActions,
  AppInstallationProps
>
export type AppEventTask = AppEventBase<'Task', TaskActions, TaskProps>
export type AppEventComment = AppEventBase<'Comment', CommentActions, CommentProps>
export type AppEventRelease = AppEventBase<'Release', ReleaseActions, ReleaseProps>
export type AppEventReleaseAction = AppEventBase<
  'ReleaseAction',
  ReleaseActionActions,
  ReleaseActionProps
>
export type AppEventScheduledAction = AppEventBase<
  'ScheduledAction',
  ScheduledActionActions,
  ScheduledActionProps
>
export type AppEventBulkAction = AppEventBase<'BulkAction', BulkActionActions, BulkActionProps>
export type AppEventTemplateInstallation = AppEventBase<
  'TemplateInstallation',
  TemplateInstallationActions,
  EnvironmentTemplateInstallationProps
>
export type AppEventRequest =
  | AppEventEntry
  | AppEventAsset
  | AppEventContentType
  | AppEventAppInstallation
  | AppEventTask
  | AppEventComment
  | AppEventRelease
  | AppEventReleaseAction
  | AppEventScheduledAction
  | AppEventBulkAction
  | AppEventTemplateInstallation

export type AppEventFilterResponse = {
  result: boolean
}

export type AppEventTransformationResponse = {
  headers: Record<string, string | number>
  body: Record<string, unknown>
}

export type AppEventHandlerResponse = void

export type AppActionRequest = {
  headers: Record<string, string | number>
  body: Record<string, unknown>
  type: typeof APP_ACTION_CALL
}

export type AppActionResponse = void | Record<string, unknown>

/**
 * P: Possibility to type app installation parameters
 */
export type FunctionEventContext<P extends Record<string, any> = Record<string, any>> = {
  spaceId: string
  environmentId: string
  appInstallationParameters: P
  cma?: PlainClientAPI
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
  [APP_ACTION_CALL]: {
    event: AppActionRequest
    response: AppActionResponse
  }
  [APP_EVENT_FILTER]: {
    event: AppEventRequest
    response: AppEventFilterResponse
  }
  [APP_EVENT_HANDLER]: {
    event: AppEventRequest
    response: AppEventHandlerResponse
  }
  [APP_EVENT_TRANSFORMATION]: {
    event: AppEventRequest
    response: AppEventTransformationResponse
  }
  [RESOURCES_SEARCH_EVENT]: {
    event: ResourcesSearchRequest
    response: ResourcesSearchResponse
  }
  [RESOURCES_LOOKUP_EVENT]: {
    event: ResourcesLookupRequest
    response: ResourcesLookupResponse
  }
}

export type FunctionEvent =
  | GraphQLFieldTypeMappingRequest
  | GraphQLQueryRequest
  | AppEventRequest
  | ResourcesSearchRequest
  | ResourcesLookupRequest
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
