import type {
  CommentProps,
  ContentTypeFieldValidation,
  TaskProps,
  Link,
  ScheduledActionProps,
  WorkflowProps,
  EnvironmentTemplateInstallationProps,
  BulkActionProps,
  AppInstallationProps,
  ReleaseActionProps,
  ReleaseProps,
} from 'contentful-management'

export type AppEventPayloadMap = {
  Entry: {
    create: EntryCreateEventPayload
    save: EntrySaveEventPayload
    auto_save: EntryAutosaveEventPayload
    publish: EntryPublishEventPayload
    unpublish: EntryUnpublishEventPayload
    archive: EntryArchiveEventPayload
    unarchive: EntryUnarchiveEventPayload
    delete: EntryDeleteEventPayload
  }
  Asset: {
    create: AssetCreateEventPayload
    save: AssetSaveEventPayload
    auto_save: AssetAutosaveEventPayload
    publish: AssetPublishEventPayload
    unpublish: AssetUnpublishEventPayload
    archive: AssetArchiveEventPayload
    unarchive: AssetUnarchiveEventPayload
    delete: AssetDeleteEventPayload
  }
  ContentType: {
    create: ContentTypeCreateEventPayload
    save: ContentTypeSaveEventPayload
    publish: ContentTypePublishEventPayload
    unpublish: ContentTypeUnpublishEventPayload
    delete: ContentTypeDeleteEventPayload
  }
  Comment: {
    create: CreateCommentEventPayload
    delete: DeleteCommentEventPayload
  }
  Task: {
    create: CreateTaskEventPayload
    save: SaveTaskEventPayload
    delete: DeleteTaskEventPayload
  }
  AppInstallation: {
    create: AppInstallationProps
    save: AppInstallationProps
    delete: AppInstallationProps
  }
  Release: {
    create: ReleaseProps
    save: ReleaseProps
    delete: ReleaseProps
  }
  ReleaseAction: {
    create: ReleaseActionProps
    execute: ReleaseActionProps
  }
  ScheduledAction: {
    create: ScheduledActionProps
    save: ScheduledActionProps
    delete: ScheduledActionProps
    execute: ScheduledActionProps
  }
  BulkAction: {
    create: BulkActionProps
    execute: BulkActionProps
  }
  TemplateInstallation: {
    complete: EnvironmentTemplateInstallationProps
  }
  Workflow: {
    create: WorkflowProps
    save: WorkflowProps
    delete: WorkflowProps
  }
}

/* Common */

interface Metadata {
  tags: Link<'Tag'>[]
  concepts: Link<'TaxonomyConcept'>[]
}

interface BasePublishableEntitySys<T extends 'Entry' | 'Asset' | 'ContentType'> {
  space: Link<'Space'>
  id: string
  type: T
  createdAt: string
  updatedAt: string
  environment: Link<'Environment'>
  createdBy: Link<'User'>
  updatedBy: Link<'User'>
  publishedCounter: number
  version: number
  urn: string
}

interface BasePublishableDeliveryEntitySys<T extends 'Entry' | 'Asset'>
  extends BasePublishableEntitySys<T> {
  fieldStatus: {
    '*': {
      [locale: string]: string
    }
  }
  automationTags: any[]
}

interface PublishedEntityAutosaveEventSysProps {
  publishedVersion: number
  publishedAt: string
  firstPublishedAt: string
  publishedBy: Link<'User'>
}

interface EntityArchiveEventSysProps {
  archivedAt: string
  firstPublishedAt?: string
  archivedBy: Link<'User'>
  archivedVersion: number
}

interface BaseEntityPublishEventSys<T extends 'Entry' | 'Asset' | 'ContentType'> {
  type: T
  id: string
  space: Link<'Space'>
  environment: Link<'Environment'>
  createdBy: Link<'User'>
  updatedBy: Link<'User'>
  revision: number
  createdAt: string
  updatedAt: string
  publishedVersion: number
}

interface BaseEntityDeleteEventSys<T extends 'Entry' | 'Asset' | 'ContentType'> {
  type: T
  id: string
  space: Link<'Space'>
  environment: Link<'Environment'>
  revision: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  deletedBy: Link<'User'>
}

/* Entries */

interface BaseEntryEventPayload {
  metadata: Metadata
  fields: EntryFields
}

interface EntryFields {
  [fieldName: string]: {
    [locale: string]: string
  }
}

interface BasePublishableEntrySys extends BasePublishableDeliveryEntitySys<'Entry'> {
  contentType: Link<'ContentType'>
}

export interface EntryCreateEventPayload extends BaseEntryEventPayload {
  sys: BasePublishableEntrySys
}

export interface EntryAutosaveEventPayload extends BaseEntryEventPayload {
  sys: BasePublishableEntrySys | (BasePublishableEntrySys & PublishedEntityAutosaveEventSysProps)
}

export type EntrySaveEventPayload = EntryAutosaveEventPayload

interface EntryPublishedEventSys extends BaseEntityPublishEventSys<'Entry'> {
  contentType: Link<'ContentType'>
}

export interface EntryPublishEventPayload extends BaseEntryEventPayload {
  sys: EntryPublishedEventSys
}

interface EntryDeleteEventSys extends BaseEntityDeleteEventSys<'Entry'> {
  contentType: Link<'ContentType'>
}

export interface EntryDeleteEventPayload {
  sys: EntryDeleteEventSys
}

export type EntryUnpublishEventPayload = EntryDeleteEventPayload

export interface EntryArchiveEventPayload extends BaseEntryEventPayload {
  sys: BasePublishableEntrySys & EntityArchiveEventSysProps
}

export interface EntryUnarchiveEventPayload extends BaseEntryEventPayload {
  sys: BasePublishableEntrySys & { fistPublishedAt?: string }
}

/* Assets */

interface AssetFields {
  title: {
    [locale: string]: string
  }
  description: {
    [locale: string]: string
  }
  file: {
    [locale: string]: {
      fileName: string
      uploadFrom: Link<'Upload'>
      contentType: string
    }
  }
}

export interface AssetCreateEventPayload {
  metadata: Metadata
  sys: BasePublishableDeliveryEntitySys<'Asset'>
  fields: AssetFields
}

export interface AssetAutosaveEventPayload {
  metadata: Metadata
  sys:
    | BasePublishableDeliveryEntitySys<'Asset'>
    | (BasePublishableDeliveryEntitySys<'Asset'> & PublishedEntityAutosaveEventSysProps)
  fields: AssetFields
}

export type AssetSaveEventPayload = AssetAutosaveEventPayload

export interface AssetPublishEventPayload {
  metadata: Metadata
  sys: BaseEntityPublishEventSys<'Asset'>
  fields: AssetFields
}

export interface AssetDeleteEventPayload {
  sys: BaseEntityDeleteEventSys<'Asset'>
}

export type AssetUnpublishEventPayload = AssetDeleteEventPayload

export interface AssetArchiveEventPayload {
  metadata: Metadata
  sys: BasePublishableDeliveryEntitySys<'Asset'> & EntityArchiveEventSysProps
  fields: AssetFields
}

export interface AssetUnarchiveEventPayload {
  metadata: Metadata
  sys: BasePublishableDeliveryEntitySys<'Asset'> & { fistPublishedAt?: string }
  fields: AssetFields
}

/* Content Types */

type ContentTypeFields = {
  id: string
  name: string
  type: string
  localized: boolean
  required: boolean
  validations: ContentTypeFieldValidation[]
  disabled: boolean
  omitted: boolean
}[]

interface BaseContentTypePayload {
  displayField: string
  name: string
  description: string
  fields: ContentTypeFields
}

export interface ContentTypeCreateEventPayload extends BaseContentTypePayload {
  sys: BasePublishableEntitySys<'ContentType'>
}

export interface ContentTypeSaveEventPayload extends BaseContentTypePayload {
  sys:
    | BasePublishableEntitySys<'ContentType'>
    | (BasePublishableEntitySys<'ContentType'> & PublishedEntityAutosaveEventSysProps)
}

export interface ContentTypePublishEventPayload extends BaseContentTypePayload {
  sys: BaseEntityPublishEventSys<'ContentType'>
}

export interface ContentTypeDeleteEventPayload {
  sys: BaseEntityDeleteEventSys<'ContentType'>
}

export type ContentTypeUnpublishEventPayload = ContentTypeDeleteEventPayload

/* Comments */

interface BaseCommentTaskEventSys {
  idempotencyId: string
  user: Link<'User'>
  environment: Link<'Environment'>
  organization: Link<'Organization'>
  space: Link<'Space'>
}

export interface CreateCommentEventPayload {
  sys: BaseCommentTaskEventSys & {
    newComment: CommentProps
  }
  userAgent: string
}

export interface DeleteCommentEventPayload {
  sys: BaseCommentTaskEventSys & {
    oldComment: CommentProps
  }
  userAgent: string
}

/* Tasks */

export interface CreateTaskEventPayload {
  sys: BaseCommentTaskEventSys & {
    newTask: TaskProps
  }
  userAgent: string
}

export interface SaveTaskEventPayload {
  sys: BaseCommentTaskEventSys & {
    oldTask: TaskProps
    newTask: TaskProps
  }
  userAgent: string
}

export interface DeleteTaskEventPayload {
  sys: BaseCommentTaskEventSys & {
    oldTask: TaskProps
  }
  userAgent: string
}
