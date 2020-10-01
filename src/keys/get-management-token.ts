import { sign } from 'jsonwebtoken'

import {
  createLogger,
  Logger,
  createHttpClient,
  createValidateStatusCode,
  HttpClient
} from '../utils'

interface GetManagementTokenOptions {
  appInstallationId: string
  spaceId: string
  environmentId?: string
}

/**
 * Synchronously sign the given privateKey into a JSON Web Token string
 */
const generateAppToken = (privateKey: string, appId: string, { log }: { log: Logger }): string => {
  log('Signing a JWT token with private key')
  try {
    const token = sign({}, privateKey, { algorithm: 'RS256', issuer: appId, expiresIn: '10m' })
    log('Successfully signed token')
    return token
  } catch (e) {
    log('Unable to sign token')
    throw e
  }
}

const getTokenFromAppToken = async (
  appToken: string,
  {
    appInstallationId,
    spaceId,
    environmentId
  }: { appInstallationId: string; spaceId: string; environmentId?: string },
  { log, http }: { log: Logger; http: HttpClient }
) => {
  const validateStatusCode = createValidateStatusCode([201])

  log(`Requesting CMA Token with given App Token`)

  const response = await http.post(
    `spaces/${spaceId}/environments/${environmentId ??
      'master'}/app_installations/${appInstallationId}/access_tokens`,
    {
      headers: {
        Authorization: `Bearer ${appToken}`
      },
      hooks: {
        afterResponse: [validateStatusCode]
      }
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
export const createGetManagementToken = (log: Logger, http: HttpClient) => {
  return (privateKey: unknown, opts: GetManagementTokenOptions): Promise<string> => {
    if (!(typeof privateKey === 'string')) {
      throw new ReferenceError('Invalid privateKey: expected a string representing a private key')
    }

    const appToken = generateAppToken(privateKey, opts.appInstallationId, { log })
    return getTokenFromAppToken(appToken, opts, { log, http })
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
export const getManagementToken = (privateKey: unknown, opts: GetManagementTokenOptions) => {
  return createGetManagementToken(createLogger({ filename: __filename }), createHttpClient())(
    privateKey,
    opts
  )
}
