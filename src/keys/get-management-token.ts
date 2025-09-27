import { createPrivateKey } from 'node:crypto'
import { LRUCache } from 'lru-cache'
import { createLogger, createValidateStatusCode, Logger } from '../utils'
import { FetchOptions, makeRequest, withDefaultOptions, withHook, withRetry } from '../utils/http'
export interface GetManagementTokenOptions {
  appInstallationId: string
  spaceId: string
  environmentId: string
  keyId?: string
  reuseToken?: boolean
  host?: string
}

let defaultCache: LRUCache<string, string> | undefined

/**
 * Synchronously sign the given privateKey into a JSON Web Token string
 * @internal
 */
const generateOneTimeToken = async (
  privateKeyPem: string,
  { appId, keyId }: { appId: string; keyId?: string },
  { log }: { log: Logger },
): Promise<string> => {
  log('Signing a JWT token with private key')
  try {
    const { SignJWT, importPKCS8 } = await import('jose')
    const privateKey = privateKeyPem.includes('BEGIN PRIVATE KEY')
      ? await importPKCS8(privateKeyPem, 'RS256')
      : await Promise.resolve(createPrivateKey(privateKeyPem)) // "BEGIN RSA PRIVATE KEY" (PKCS#1)
    const secureHeaders = keyId ? { kid: keyId, alg: 'RS256' } : { alg: 'RS256' }
    const signer = new SignJWT({})
      .setProtectedHeader(secureHeaders)
      .setIssuedAt()
      .setIssuer(appId)
      .setExpirationTime('10m')
    const token = await signer.sign(privateKey)
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
  { log, fetchOptions }: { log: Logger; fetchOptions: FetchOptions },
): Promise<string> => {
  const validateStatusCode = createValidateStatusCode([201])

  log(`Requesting CMA Token with given App Token`)

  const requestor = makeRequest(
    `spaces/${spaceId}/environments/${environmentId}/app_installations/${appInstallationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appToken}`,
      },
    },
    fetchOptions,
  )
  const hookRequestor = withHook(requestor, validateStatusCode)
  const retryRequestor = withRetry(hookRequestor, fetchOptions)
  const response = await retryRequestor()

  log(
    `Successfully retrieved CMA Token for app ${appInstallationId} in space ${spaceId} and environment ${environmentId}`,
  )

  return ((await response.json()) as { token: string }).token
}

/**
 * Factory method for GetManagementToken
 * @internal
 */
export const createGetManagementToken = (
  log: Logger,
  fetchOptions: FetchOptions,
  cache: LRUCache<string, string>,
) => {
  return async (privateKey: unknown, opts: GetManagementTokenOptions): Promise<string> => {
    const { decodeJwt } = await import('jose')
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
    console.log('gettingOneTimeToken')
    const appToken = await generateOneTimeToken(
      privateKey,
      { appId: opts.appInstallationId, keyId: opts.keyId },
      { log },
    )
    const ott = await getTokenFromOneTimeToken(appToken, opts, { log, fetchOptions })
    if (opts.reuseToken) {
      const decoded = decodeJwt(ott)
      if (decoded && typeof decoded === 'object' && decoded.exp) {
        // Internally expire cached tokens a bit earlier to make sure token isn't expired on arrival
        const safetyMargin = 10
        const ttlSeconds = decoded.exp - Math.floor(Date.now() / 1000) - safetyMargin
        cache.set(cacheKey, ott, { ttl: ttlSeconds })
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
export const getManagementToken = async (privateKey: string, opts: GetManagementTokenOptions) => {
  if ((opts.reuseToken || opts.reuseToken === undefined) && !defaultCache) {
    defaultCache = new LRUCache({ max: 10 })
  }
  const httpClientOpts = typeof opts.host !== 'undefined' ? { prefixUrl: opts.host } : {}

  console.log('createGetManagementToken')
  return createGetManagementToken(
    createLogger({ namespace: 'get-management-token' }),
    withDefaultOptions(httpClientOpts),
    defaultCache!,
  )(privateKey, opts)
}
