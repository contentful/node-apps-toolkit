import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'

//TODO use built version
import { getManagementToken } from '../../src/keys'
import { cleanOldKeys, setPublicKey } from '../utils'
import { config, makeRequest } from '../../src/utils/http'

describe('Keys Utilities', () => {
  before(async () => {
    await cleanOldKeys()

    const pubKey = fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'key.der.pub'))
    await setPublicKey(pubKey)
  })

  it('fetches a valid CMA token for a valid key pair', async () => {
    const appInstallationId = process.env.APP_ID
    const spaceId = process.env.SPACE_ID
    const environmentId = process.env.ENVIRONMENT_ID

    if (!appInstallationId || !spaceId || !environmentId) {
      throw new Error('Missing Environment setup')
    }

    const privateKey = fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'key.pem'), 'utf-8')

    const token = await getManagementToken(privateKey, {
      appInstallationId,
      spaceId,
      environmentId,
    })

    await assert.doesNotReject(() => {
      const requestor = makeRequest(
        `/spaces/${spaceId}/entries`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        config,
      )

      return requestor()
    })
  })
})
