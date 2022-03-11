import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'

import * as sinon from 'sinon'

import {
  createGetManagementToken,
  getManagementToken,
  GetManagementTokenOptions,
} from './get-management-token'
import { HttpClient, HttpError, Response } from '../utils'
import { Logger } from '../utils'
import { sign } from 'jsonwebtoken'
import NodeCache = require('node-cache')

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'key.pem'), 'utf-8')
const APP_ID = 'app_id'
const SPACE_ID = 'space_id'
const ENVIRONMENT_ID = 'env_id'
const DEFAULT_OPTIONS: GetManagementTokenOptions = {
  appInstallationId: APP_ID,
  spaceId: SPACE_ID,
  environmentId: ENVIRONMENT_ID,
  reuseToken: false,
}
const noop = () => {}

const defaultCache = new NodeCache()

describe('getManagementToken', () => {
  it('fetches a token', async () => {
    const mockToken = 'token'
    const logger = noop as unknown as Logger
    const post = sinon.stub()
    post.resolves({ statusCode: 201, body: JSON.stringify({ token: mockToken }) })
    const httpClient = { post } as unknown as HttpClient
    const getManagementToken = createGetManagementToken(logger, httpClient, defaultCache)

    const result = await getManagementToken(PRIVATE_KEY, DEFAULT_OPTIONS)

    assert.deepStrictEqual(result, mockToken)
    assert(
      post.calledWith(
        `spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/app_installations/${APP_ID}/access_tokens`,
        sinon.match({ headers: { Authorization: sinon.match.string } })
      )
    )
  })

  it('caches token while valid', async () => {
    const logger = noop as unknown as Logger
    const post = sinon.stub()
    const mockToken = sign({ a: 'b' }, 'a-secret-key', {
      expiresIn: '10 minutes',
    })

    post.resolves({ statusCode: 201, body: JSON.stringify({ token: mockToken }) })
    const httpClient = { post } as unknown as HttpClient
    const getManagementToken = createGetManagementToken(logger, httpClient, defaultCache)

    const optionsWithCaching = { ...DEFAULT_OPTIONS, reuseToken: true }
    const result = await getManagementToken(PRIVATE_KEY, optionsWithCaching)
    assert.strictEqual(result, mockToken)
    const secondResult = await getManagementToken(PRIVATE_KEY, optionsWithCaching)
    assert.strictEqual(secondResult, mockToken)

    assert(post.calledOnce)
  })

  it('does not cache expired token', async () => {
    const logger = noop as unknown as Logger
    const post = sinon.stub()
    const mockToken = sign({ a: 'b' }, 'a-secret-key', {
      expiresIn: '5 minutes',
    })

    post.resolves({ statusCode: 201, body: JSON.stringify({ token: mockToken }) })
    const httpClient = { post } as unknown as HttpClient
    const cache = new NodeCache()
    const getManagementToken = createGetManagementToken(logger, httpClient, cache)

    const optionsWithCaching = { ...DEFAULT_OPTIONS, reuseToken: true }
    const result = await getManagementToken(PRIVATE_KEY, optionsWithCaching)
    assert.strictEqual(result, mockToken)

    // Overwrite TTL expiry to 5ms
    const cacheKey = APP_ID + ENVIRONMENT_ID + PRIVATE_KEY.slice(32, 132)
    cache.set(cacheKey, result, 0.005)

    // Sleep 10ms
    await new Promise((resolve) => {
      setTimeout(resolve, 10)
    })

    const secondResult = await getManagementToken(PRIVATE_KEY, optionsWithCaching)
    assert.strictEqual(secondResult, mockToken)
    assert(post.calledTwice)
  })

  describe('when using a keyId', () => {
    it('fetches a token', async () => {
      const mockToken = 'token'
      const logger = noop as unknown as Logger
      const post = sinon.stub()
      post.resolves({ statusCode: 201, body: JSON.stringify({ token: mockToken }) })
      const httpClient = { post } as unknown as HttpClient
      const getManagementToken = createGetManagementToken(logger, httpClient, defaultCache)

      const result = await getManagementToken(PRIVATE_KEY, { ...DEFAULT_OPTIONS, keyId: 'keyId' })

      assert.deepStrictEqual(result, mockToken)
      assert(
        post.calledWith(
          `spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/app_installations/${APP_ID}/access_tokens`,
          sinon.match({ headers: { Authorization: sinon.match.string } })
        )
      )
    })
  })

  describe('when private key is incorrect', () => {
    it('throws if missing', async () => {
      await assert.rejects(async () => {
        // @ts-ignore Testing javascript code
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
      const logger = noop as unknown as Logger
      const post = sinon.stub().rejects(new HttpError({ statusCode: 500 } as unknown as Response))
      const httpClient = { post } as unknown as HttpClient
      const getManagementToken = createGetManagementToken(logger, httpClient, defaultCache)

      await assert.rejects(async () => {
        await getManagementToken(PRIVATE_KEY, DEFAULT_OPTIONS)
      }, HttpError)
    })
  })
})
