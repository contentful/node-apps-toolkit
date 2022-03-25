import { decode, sign, SignOptions } from 'jsonwebtoken'
import * as NodeCache from 'node-cache'
import {
  createLogger,
  Logger,
  createHttpClient,
  createValidateStatusCode,
  HttpClient,
} from '../utils'

export interface GetManagementTokenOptions {
  appInstallationId: string
  spaceId: string
  environmentId: string
  keyId?: string
  reuseToken?: boolean
}

let defaultCache: NodeCache

/**
 * Synchronously sign the given privateKey into a JSON Web Token string
 * @internal
 */
const generateOneTimeToken = (
  privateKey: string,
  { appId, keyId }: { appId: string; keyId?: string },
  { log }: { log: Logger }
): string => {
  log('Signing a JWT token with private key')
  try {
    const baseSignOptions: SignOptions = { algorithm: 'RS256', issuer: appId, expiresIn: '10m' }
    const signOptions: SignOptions = keyId ? { ...baseSignOptions, keyid: keyId } : baseSignOptions

    const token = sign({}, privateKey, signOptions)
    log('Successfully signed token')
    return token
  } catch (e) {
    log('Unable to sign token')
    throw e
  }
}

const getTokenFromOneTimeToken = async (
  appToken: string,
  {
    appInstallationId,
    spaceId,
    environmentId,
  }: { appInstallationId: string; spaceId: string; environmentId: string },
  { log, http }: { log: Logger; http: HttpClient }
): Promise<string> => {
  const validateStatusCode = createValidateStatusCode([201])

  log(`Requesting CMA Token with given App Token`)

  const response = await http.post(
    `spaces/${spaceId}/environments/${environmentId}/app_installations/${appInstallationId}/access_tokens`,
    {
      headers: {
        Authorization: `Bearer ${appToken}`,
      },
      hooks: {
        afterResponse: [validateStatusCode],
      },
    }
  )

  log(
    `Successfully retrieved CMA Token for app ${appInstallationId} in space ${spaceId} and environment ${environmentId}`
  )

  return JSON.parse(response.body).token
}

/**
 * Factory method for GetManagementToken
 * @internal
 */
export const createGetManagementToken = (log: Logger, http: HttpClient, cache: NodeCache) => {
  return async (privateKey: unknown, opts: GetManagementTokenOptions): Promise<string> => {
    if (!(typeof privateKey === 'string')) {
      throw new ReferenceError('Invalid privateKey: expected a string representing a private key')
    }

    if (opts.reuseToken === undefined) {
      opts.reuseToken = true
    }

    const cacheKey =
      opts.appInstallationId + opts.spaceId + opts.environmentId + privateKey.slice(32, 132)
    if (opts.reuseToken) {
      const existing = cache.get(cacheKey) as string
      if (existing) {
        return existing as string
      }
    }

    const appToken = generateOneTimeToken(
      privateKey,
      { appId: opts.appInstallationId, keyId: opts.keyId },
      { log }
    )
    const ott = await getTokenFromOneTimeToken(appToken, opts, { log, http })
    if (opts.reuseToken) {
      const decoded = decode(ott)
      if (decoded && typeof decoded === 'object' && decoded.exp) {
        // Internally expire cached tokens a bit earlier to make sure token isn't expired on arrival
        const safetyMargin = 10
        const ttlSeconds = decoded.exp - Math.floor(Date.now() / 1000) - safetyMargin
        cache.set(cacheKey, ott, ttlSeconds)
      }
    }

    return ott
  }
}

/**
 * Returns a Contentful Management API token from private key
 * Management tokens are cached internally until until they expire.
 * Pass `reuseToken: false` in the options for `getManagementToken` to disable this feature.
 *
 * NodeJS Contentful Apps need a management token to interact with Contentful's APIs.
 * Creating a management token requires a key pair to be registered for the app, follow
 * [this link](http://contentful./developers/docs/references/content-management-api/#/reference/app-keys/app-keys)
 * for more information on key pairs.
 *
 * Once a key pair is registered the getManagementToken function can be used to generate a valid token.
 *
 * ~~~
 * const {getManagementToken} = require('contentful-node-apps-toolkit')
 *
 * getManagementToken(PRIVATE_KEY, {appInstallationId, spaceId, environmentId})
 *    .then( (token) => {
 *      console.log('Here is your token')
 *      console.log(token)
 *    })
 * ~~~
 * @category Keys
 */
export const getManagementToken = (privateKey: string, opts: GetManagementTokenOptions) => {
  if ((opts.reuseToken || opts.reuseToken === undefined) && !defaultCache) {
    defaultCache = new NodeCache()
  }
  return createGetManagementToken(
    createLogger({ filename: __filename }),
    createHttpClient(),
    defaultCache
  )(privateKey, opts)
}
