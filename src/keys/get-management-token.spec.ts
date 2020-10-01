import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'

import * as sinon from 'sinon'

import { createGetManagementToken, getManagementToken } from './get-management-token'
import { HttpClient, HttpError, Response } from '../utils'
import { Logger } from '../utils'

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'key.pem'), 'utf-8')
const APP_ID = 'app_id'
const SPACE_ID = 'space_id'
const ENVIRONMENT_ID = 'env_id'
const DEFAULT_OPTIONS = { appId: APP_ID, spaceId: SPACE_ID, environmentId: ENVIRONMENT_ID }
const noop = () => {}

describe('getManagementToken', () => {
  it('fetches a token', async () => {
    const mockToken = 'token'
    const logger = (noop as unknown) as Logger
    const post = sinon.stub()
    post.resolves({ statusCode: 201, body: JSON.stringify({ token: mockToken }) })
    const httpClient = ({ post } as unknown) as HttpClient
    const getManagementToken = createGetManagementToken(logger, httpClient)

    const result = await getManagementToken(PRIVATE_KEY, DEFAULT_OPTIONS)

    assert.deepStrictEqual(result, mockToken)
    assert(
      post.calledWith(
        `spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/app_installations/${APP_ID}/access_tokens`,
        sinon.match({ headers: { Authorization: sinon.match.string } })
      )
    )
  })

  describe('when private key is incorrect', () => {
    it('throws if missing', async () => {
      await assert.rejects(async () => {
        await getManagementToken(undefined, DEFAULT_OPTIONS)
      })
    })
    it('throws if generated with wrong algorithm', async () => {
      await assert.rejects(async () => {
        await getManagementToken('not_a_private_key', DEFAULT_OPTIONS)
      })
    })
  })

  describe('when having API problems', () => {
    it(`throws when API returns an error`, async () => {
      const logger = (noop as unknown) as Logger
      const post = sinon.stub().rejects(new HttpError(({ statusCode: 500 } as unknown) as Response))
      const httpClient = ({ post } as unknown) as HttpClient
      const getManagementToken = createGetManagementToken(logger, httpClient)

      await assert.rejects(async () => {
        await getManagementToken(PRIVATE_KEY, DEFAULT_OPTIONS)
      }, HttpError)
    })
  })
})
