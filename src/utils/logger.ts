import debug from 'debug'

const APP_NAME = '@contentful/node-apps-toolkit'

const getNamespaceFromFilename = (filename: string) => {
  return filename.slice(0, -3)
}

/**
 * @internal
 */
export const createLogger = (opts: { namespace: string } | { filename: string }) => {
  const ns = 'namespace' in opts ? opts.namespace : getNamespaceFromFilename(opts.filename)

  return debug(APP_NAME).extend(ns)
}

export type Logger = debug.Debugger
