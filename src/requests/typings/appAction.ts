import { PlainClientAPI } from 'contentful-management'

export type AppActionCallContext = {
  cma: PlainClientAPI
  appActionCallContext: {
    spaceId: string
    environmentId: string
    appInstallationId: string
    userId: string
    cmaHost: string
    uploadHost: string
  }
}

export type AppActionCustomSchemaBody = Record<string, unknown>
export type AppActionEntriesV1SchemaBody = { entryIds: string }
export type AppActionNotificationsV1SchemaBody = { message: string; recipient: string }

export type AppActionSchema = 'Custom' | 'Entries.v1.0' | 'Notifications.v1.0'

export type AppActionSchemaBodyMap = {
  Custom: AppActionCustomSchemaBody
  'Entries.v1.0': AppActionEntriesV1SchemaBody
  'Notifications.v1.0': AppActionNotificationsV1SchemaBody
}
