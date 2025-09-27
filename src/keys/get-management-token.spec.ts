import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

import * as sinon from 'sinon'

import {
  createGetManagementToken,
  getManagementToken,
  GetManagementTokenOptions,
} from './get-management-token'
import { HttpError } from '../utils'
import { Logger } from '../utils'
import { SignJWT } from 'jose'
import { LRUCache } from 'lru-cache'

console.log('keys', path.join(__dirname, '..', '..', 'keys', 'key.pem'))
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

const defaultCache: LRUCache<string, string> = new LRUCache({ max: 10 })
let fetchStub: sinon.SinonStub

beforeEach(() => {
  fetchStub = sinon.stub(global, 'fetch')
})

afterEach(() => {
  fetchStub.restore()
})

describe('getManagementToken', () => {
  it('fetches a token', async () => {
    const mockToken = 'token'
    const logger = noop as unknown as Logger
    fetchStub.resolves({ ok: true, status: 201, json: () => Promise.resolve({ token: mockToken }) })
    const getManagementToken = createGetManagementToken(
      logger,
      { prefixUrl: '', retry: { limit: 0 } },
      defaultCache,
    )

    const result = await getManagementToken(PRIVATE_KEY, DEFAULT_OPTIONS)

    expect(result).toEqual(mockToken)
    expect(fetchStub.calledOnce).toBe(true)
    console.log(fetchStub.args)
    expect(
      fetchStub.calledWith(
        `/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/app_installations/${APP_ID}/access_tokens`,
        sinon.match({ method: 'POST', headers: { Authorization: sinon.match.string } }),
      ),
    ).toBe(true)
  })

  it('caches token while valid', async () => {
    const logger = noop as unknown as Logger
    const mockToken = await new SignJWT({ a: 'b' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('10 minutes')
      .sign(new TextEncoder().encode('a-secret-key'))

    fetchStub.resolves({ ok: true, status: 201, json: () => Promise.resolve({ token: mockToken }) })
    const getManagementToken = createGetManagementToken(
      logger,
      { prefixUrl: '', retry: { limit: 0 } },
      defaultCache,
    )

    const optionsWithCaching = { ...DEFAULT_OPTIONS, reuseToken: true }
    const result = await getManagementToken(PRIVATE_KEY, optionsWithCaching)
    expect(result).toEqual(mockToken)
    const secondResult = await getManagementToken(PRIVATE_KEY, optionsWithCaching)
    expect(secondResult).toEqual(mockToken)

    expect(fetchStub.calledOnce).toBe(true)
  })

  it('does not cache expired token', async () => {
    const logger = noop as unknown as Logger
    const mockToken = await new SignJWT({ a: 'b' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('5 minutes')
      .sign(new TextEncoder().encode('a-secret-key'))

    fetchStub.resolves({ ok: true, status: 201, json: () => Promise.resolve({ token: mockToken }) })
    const cache: LRUCache<string, string> = new LRUCache({ max: 10 })
    const getManagementToken = createGetManagementToken(
      logger,
      { prefixUrl: '', retry: { limit: 0 } },
      cache,
    )

    const optionsWithCaching = { ...DEFAULT_OPTIONS, reuseToken: true }
    const result = await getManagementToken(PRIVATE_KEY, optionsWithCaching)
    expect(result).toEqual(mockToken)

    // Overwrite TTL expiry to 5ms
    const cacheKey = APP_ID + SPACE_ID + ENVIRONMENT_ID + PRIVATE_KEY.slice(32, 132)
    cache.set(cacheKey, result, { ttl: 0.005 })

    // Sleep 10ms
    await new Promise((resolve) => {
      setTimeout(resolve, 10)
    })

    const secondResult = await getManagementToken(PRIVATE_KEY, optionsWithCaching)
    expect(secondResult).toEqual(mockToken)
    expect(fetchStub.calledTwice).toBe(true)
  })

  describe('when using a keyId', () => {
    it('fetches a token', async () => {
      const mockToken = 'token'
      const logger = noop as unknown as Logger
      fetchStub.resolves({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ token: mockToken }),
      })
      const getManagementToken = createGetManagementToken(
        logger,
        { prefixUrl: '', retry: { limit: 0 } },
        defaultCache,
      )

      const result = await getManagementToken(PRIVATE_KEY, { ...DEFAULT_OPTIONS, keyId: 'keyId' })

      expect(result).toEqual(mockToken)
      expect(
        fetchStub.calledWith(
          `/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/app_installations/${APP_ID}/access_tokens`,
          sinon.match({ method: 'POST', headers: { Authorization: sinon.match.string } }),
        ),
      ).toBe(true)
    })
  })

  describe('when private key is incorrect', () => {
    it('throws if missing', async () => {
      await expect(async () => {
        // @ts-ignore Testing javascript code
        await getManagementToken(undefined, DEFAULT_OPTIONS)
      }).rejects.toThrow()
    })
    it('throws if generated with wrong algorithm', async () => {
      await expect(async () => {
        await getManagementToken('not_a_private_key', DEFAULT_OPTIONS)
      }).rejects.toThrow()
    })
  })

  describe('when having API problems', () => {
    it(`throws when API returns an error`, async () => {
      const logger = noop as unknown as Logger
      fetchStub.rejects(new HttpError({ statusCode: 500 } as unknown as Response))
      const getManagementToken = createGetManagementToken(
        logger,
        { prefixUrl: '', retry: { limit: 0 } },
        defaultCache,
      )

      await expect(async () => {
        await getManagementToken(PRIVATE_KEY, DEFAULT_OPTIONS)
      }).rejects.toThrow(HttpError)
    })
  })
})
