import * as crypto from 'crypto'

import base64url from 'base64url'

import { createValidateStatusCode } from '../src/utils'
import { config, makeRequest, withHook } from '../src/utils/http'

export const cleanOldKeys = async () => {
  const organizationId = process.env.ORGANIZATION_ID
  const appDefinitionId = process.env.APP_ID

  const requestor = makeRequest(
    `/organizations/${organizationId}/app_definitions/${appDefinitionId}/keys`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PERSONAL_ACCESS_TOKEN}`,
      },
    },
    config,
  )
  console.log('config', config)
  const response = await requestor()
  const { items } = (await response.json()) as { items: { jwk: { x5t: string } }[] }
  const fingerprints = items.map((i: any) => i.jwk.x5t)

  const deleteKeysRequests = fingerprints.map((fingerprint: string) => {
    const requestor = makeRequest(
      `/organizations/${organizationId}/app_definitions/${appDefinitionId}/keys/${fingerprint}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.PERSONAL_ACCESS_TOKEN}`,
        },
      },
      config,
    )
    return requestor()
  })

  return Promise.all(deleteKeysRequests)
}

export const setPublicKey = async (publicKey: Buffer) => {
  const organizationId = process.env.ORGANIZATION_ID
  const appDefinitionId = process.env.APP_ID
  const keyId = base64url(crypto.createHash('sha256').update(publicKey).digest())

  const requestor = makeRequest(
    `/organizations/${organizationId}/app_definitions/${appDefinitionId}/keys`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERSONAL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        jwk: {
          kty: 'RSA',
          use: 'sig',
          alg: 'RS256',
          x5c: [publicKey.toString('base64')],
          kid: keyId,
          x5t: keyId,
        },
      }),
    },
    config,
  )
  const hookRequestor = withHook(requestor, createValidateStatusCode([201, 200]))
  return hookRequestor()
}
