import { PlainClientAPI } from 'contentful-management'

export type AppActionCallContext = {
  cma: PlainClientAPI
  appActionCallContext: {
    spaceId: string
    environmentId: string
    appInstallationId: string
    userId: string
    cmaHost: string
  }
}
