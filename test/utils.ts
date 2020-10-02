import * as crypto from 'crypto'

import base64url from 'base64url'

import { createHttpClient, createValidateStatusCode } from '../src/utils'

const http = createHttpClient()

export const setPublicKey = (publicKey: Buffer) => {
  const organizationId = process.env.ORGANIZATION_ID
  const appDefinitionId = process.env.APP_DEFINITION_ID
  const keyId = base64url(
    crypto
      .createHash('sha256')
      .update(publicKey)
      .digest()
  )

  return http.post(`organizations/${organizationId}/app_definitions/${appDefinitionId}/keys`, {
    headers: {
      Authorization: `Bearer ${process.env.PERSONAL_ACCESS_TOKEN}`
    },
    json: {
      jwk: {
        kty: 'RSA',
        use: 'sig',
        alg: 'RS256',
        x5c: [publicKey.toString('base64')],
        kid: keyId,
        x5t: keyId
      }
    },
    hooks: {
      afterResponse: [createValidateStatusCode([201, 200])]
    }
  })
}
