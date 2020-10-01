import * as path from 'path'
import debug from 'debug'

const SRC_PATH = path.join(__dirname, '..')
const { name: APP_NAME } = require('../../package.json')

const getNamespaceFromFilename = (filename: string) => {
  return filename.split(SRC_PATH)[1].slice(0, -3)
}

/**
 * @internal
 */
export const createLogger = (opts: { namespace: string } | { filename: string }) => {
  const ns = 'namespace' in opts ? opts.namespace : getNamespaceFromFilename(opts.filename)

  return debug(APP_NAME).extend(ns)
}

export type Logger = debug.Debugger
