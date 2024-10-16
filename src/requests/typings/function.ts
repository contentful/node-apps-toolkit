// Remove when this eslint rule covers all the cases
// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
/*eslint-disable no-unused-vars*/

import type {
  FunctionEventContext,
  FunctionEventHandlers,
  FunctionEventType,
} from '@contentful/functions-types'

import {
  AppActionCategoryType,
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

import { AppActionCategoryBodyMap, AppActionRequestBody } from './appAction'

const APP_EVENT_FILTER = 'appevent.filter'
const APP_EVENT_HANDLER = 'appevent.handler'
const APP_EVENT_TRANSFORMATION = 'appevent.transformation'
const APP_ACTION_CALL = 'appaction.call'

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
  type: typeof APP_ACTION_CALL
}

export type AppActionResponse = void | Record<string, unknown>

export type {
  FunctionEvent,
  FunctionEventContext,
  FunctionEventType,
  GraphqlQueryResponse,
} from '@contentful/functions-types'

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
