import debug from 'debug'

const APP_NAME = '@contentful-node-apps-toolkit'

/**
 * @internal
 */
export const createLogger = (opts: { namespace: string }) => {
  return debug(APP_NAME).extend(opts.namespace)
}

export type Logger = debug.Debugger
