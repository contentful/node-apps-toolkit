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
  ReleaseActionProps,
  ReleaseProps,
  ScheduledActionProps,
  TaskProps,
} from 'contentful-management'

const GRAPHQL_FIELD_MAPPING_EVENT = 'graphql.field.mapping'
const GRAPHQL_QUERY_EVENT = 'graphql.query'
const APP_EVENT_FILTER = 'appevent.filter'
const APP_EVENT_HANDLER = 'appevent.handler'
const APP_EVENT_TRANSFORMATION = 'appevent.transformation'

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

type AppEventBase<EntityProps, EntityActions> = {
  entityProps: EntityProps
  entityAction: EntityActions
  type: typeof APP_EVENT_HANDLER | typeof APP_EVENT_TRANSFORMATION | typeof APP_EVENT_FILTER
}
export type AppEventContentType = {
  entityType: 'ContentType'
} & AppEventBase<ContentTypeProps, ContentTypeActions>
export type AppEventEntry = {
  entityType: 'Entry'
} & AppEventBase<EntryProps, EntryActions>
export type AppEventAsset = {
  entityType: 'Asset'
} & AppEventBase<AssetProps, AssetActions>
export type AppEventAppInstallation = {
  entityType: 'AppInstallation'
} & AppEventBase<AppInstallationProps, AppInstallationActions>
export type AppEventTask = {
  entityType: 'Task'
} & AppEventBase<TaskProps, TaskActions>
export type AppEventComment = {
  entityType: 'Comment'
} & AppEventBase<CommentProps, CommentActions>
export type AppEventRelease = {
  entityType: 'Release'
} & AppEventBase<ReleaseProps, ReleaseActions>
export type AppEventReleaseAction = {
  entityType: 'ReleaseAction'
} & AppEventBase<ReleaseActionProps, ReleaseActionActions>
export type AppEventScheduledAction = {
  entityType: 'ScheduledAction'
} & AppEventBase<ScheduledActionProps, ScheduledActionActions>
export type AppEventBulkAction = {
  entityType: 'BulkAction'
} & AppEventBase<BulkActionProps, BulkActionActions>
export type AppEventTemplateInstallation = {
  entityType: 'TemplateInstallation'
} & AppEventBase<EnvironmentTemplateInstallationProps, TemplateInstallationActions>
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

export type AppEventHandlerResponse = void
export type AppEventTransformationResponse = void

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
}

export type FunctionEvent = GraphQLFieldTypeMappingRequest | GraphQLQueryRequest | AppEventRequest
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
