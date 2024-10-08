import type { AppActionCategoryType, PlainClientAPI } from 'contentful-management'

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

export type AppActionCustomCategoryBody = Record<string, unknown>
export type AppActionEntriesV1CategoryBody = { entryIds: string }
export type AppActionNotificationsV1CategoryBody = { message: string; recipient: string }

export type AppActionCategoryBodyMap = {
  Custom: AppActionCustomCategoryBody
  'Entries.v1.0': AppActionEntriesV1CategoryBody
  'Notifications.v1.0': AppActionNotificationsV1CategoryBody
}

export type AppActionRequestBody<CategoryType extends AppActionCategoryType> =
  CategoryType extends keyof AppActionCategoryBodyMap
    ? AppActionCategoryBodyMap[CategoryType]
    : never
