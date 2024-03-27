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
  | 'autoSave'
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

type AppEventFilter<EntityProps, EntityActions> = {
  type: typeof APP_EVENT_FILTER
  entityProps: EntityProps
  entityAction: EntityActions // 'create' | 'publish' etc etc.
}
export type AppEventContentTypeFilter = {
  entityType: 'ContentType'
} & AppEventFilter<ContentTypeProps, ContentTypeActions>
export type AppEventEntryFilter = {
  entityType: 'Entry'
} & AppEventFilter<EntryProps, EntryActions>
export type AppEventAssetFilter = {
  entityType: 'Asset'
} & AppEventFilter<AssetProps, AssetActions>
export type AppEventAppInstallationFilter = {
  entityType: 'AppInstallation' // is this AppInstallation or App Installation?
} & AppEventFilter<AppInstallationProps, AppInstallationActions>
export type AppEventTaskFilter = {
  entityType: 'Task'
} & AppEventFilter<TaskProps, TaskActions>
export type AppEventCommentFilter = {
  entityType: 'Comment'
} & AppEventFilter<CommentProps, CommentActions>
export type AppEventReleaseFilter = {
  entityType: 'Release'
} & AppEventFilter<ReleaseProps, ReleaseActions>
export type AppEventReleaseActionFilter = {
  entityType: 'ReleaseAction' // is this ReleaseAction or Release action?
} & AppEventFilter<ReleaseActionProps, ReleaseActionActions>
export type AppEventScheduledActionFilter = {
  entityType: 'ScheduledAction' // is this ScheduledAction or Scheduled action?
} & AppEventFilter<ScheduledActionProps, ScheduledActionActions>
export type AppEventBulkActionFilter = {
  entityType: 'BulkAction' // is this ScheduledAction or Scheduled action?
} & AppEventFilter<BulkActionProps, BulkActionActions>
export type AppEventTemplateInstallationFilter = {
  entityType: 'TemplateInstallation' // is this ScheduledAction or Scheduled action?
} & AppEventFilter<EnvironmentTemplateInstallationProps, TemplateInstallationActions>
export type AppEventFilterRequest =
  | AppEventEntryFilter
  | AppEventAssetFilter
  | AppEventContentTypeFilter
  | AppEventAppInstallationFilter
  | AppEventTaskFilter
  | AppEventCommentFilter
  | AppEventReleaseFilter
  | AppEventReleaseActionFilter
  | AppEventScheduledActionFilter
  | AppEventBulkActionFilter
  | AppEventTemplateInstallationFilter

export type AppEventFilterResponse = {
  result: boolean
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
