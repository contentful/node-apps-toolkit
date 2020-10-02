import * as crypto from 'crypto'

import base64url from 'base64url'

import { createHttpClient, createValidateStatusCode } from '../src/utils'

const http = createHttpClient({
  headers: {
    Authorization: `Bearer ${process.env.PERSONAL_ACCESS_TOKEN}`,
  },
})

export const cleanOldKeys = async () => {
  const organizationId = process.env.ORGANIZATION_ID
  const appDefinitionId = process.env.APP_ID

  const { body } = await http.get(
    `organizations/${organizationId}/app_definitions/${appDefinitionId}/keys`
  )
  const fingerprints = JSON.parse(body).items.map((i: any) => i.jwk.x5t)

  const deleteKeysRequests = fingerprints.map((fingerprint: string) => {
    return http.delete(
      `organizations/${organizationId}/app_definitions/${appDefinitionId}/keys/${fingerprint}`
    )
  })

  return Promise.all(deleteKeysRequests)
}

export const setPublicKey = async (publicKey: Buffer) => {
  const organizationId = process.env.ORGANIZATION_ID
  const appDefinitionId = process.env.APP_ID
  const keyId = base64url(crypto.createHash('sha256').update(publicKey).digest())

  return http.post(`organizations/${organizationId}/app_definitions/${appDefinitionId}/keys`, {
    json: {
      jwk: {
        kty: 'RSA',
        use: 'sig',
        alg: 'RS256',
        x5c: [publicKey.toString('base64')],
        kid: keyId,
        x5t: keyId,
      },
    },
    hooks: {
      afterResponse: [createValidateStatusCode([201, 200])],
    },
  })
}
