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
export const createGetManagementToken = (log: Logger, http: HttpClient, cache?: NodeCache) => {
  return async (privateKey: unknown, opts: GetManagementTokenOptions): Promise<string> => {
    if (!(typeof privateKey === 'string')) {
      throw new ReferenceError('Invalid privateKey: expected a string representing a private key')
    }

    if (opts.reuseToken === undefined) {
      opts.reuseToken = true
    }

    const cacheKey = opts.appInstallationId + opts.environmentId + privateKey.slice(32, 132)
    if (cache && opts.reuseToken) {
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

    if (cache && opts.reuseToken) {
      const decoded = decode(ott)
      if (decoded && typeof decoded === 'object') {
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
 *
 * ~~~
 * const {getManagementToken} = require('contentful-node-apps-toolkit')
 *
 * getManagementToken(PRIVATE_KEY, {appId, spaceId, environmentId})
 *    .then( (token) => {
 *      console.log('Here is your token')
 *      console.log(token)
 *    })
 * ~~~
 */
const cache = new NodeCache()
export const getManagementToken = (privateKey: unknown, opts: GetManagementTokenOptions) => {
  return createGetManagementToken(
    createLogger({ filename: __filename }),
    createHttpClient(),
    cache
  )(privateKey, opts)
}
