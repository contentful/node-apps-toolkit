import * as assert from 'assert'
import { CanonicalRequest, Secret } from './typings'
import { createSignature } from './create-signature'

const VALID_SECRET: Secret = new Array(64).fill('a').join('')
const VALID_TIMESTAMP = 1603379941037
const VALID_REQUEST: CanonicalRequest = {
  method: 'GET',
  path: '/api/resources/1',
}

const assertThrowsForFieldInValues = (field: keyof CanonicalRequest, values: any[]) => {
  for (const value of values) {
    assert.throws(() => {
      createSignature(
        VALID_SECRET,
        {
          ...VALID_REQUEST,
          // @ts-ignore
          [field]: value,
        },
        VALID_TIMESTAMP
      )
    }, `Did not throw for ${field.toString()}:${value}`)
  }
}

describe('create-signature', () => {
  describe('when validating canonical request', () => {
    it('throws with unsupported methods', () => {
      assertThrowsForFieldInValues('method', [null, undefined, false, 42, 'METHOD'])
    })
    it('throws with non-object headers', () => {
      assertThrowsForFieldInValues('headers', [null, false, 42, 'METHOD', []])
    })
    it('throws for invalid URI', () => {
      assertThrowsForFieldInValues('path', ['not/canonical', null, true, 10, [], {}])
    })
    it('throws with non string bodies', () => {
      assertThrowsForFieldInValues('body', [{ foo: 'bar' }, null, true, 10])
    })
    it('does not throw with empty bodies', () => {
      const { body, ...requestWithoutBody } = VALID_REQUEST
      assert.doesNotThrow(() => {
        createSignature(VALID_SECRET, requestWithoutBody, VALID_TIMESTAMP)
      })
    })
    it('does not throw with empty headers', () => {
      const { headers, ...requestWithoutBody } = VALID_REQUEST
      assert.doesNotThrow(() => {
        createSignature(VALID_SECRET, requestWithoutBody, VALID_TIMESTAMP)
      })
    })
  })

  describe('when validating secret', () => {
    it('throws if not a string of correct length', () => {
      const invalidSecrets = [undefined, false, 'too-short', 1103379941037 /* too old */]

      for (const secret of invalidSecrets) {
        assert.throws(() => {
          // @ts-ignore
          createSignature(secret, VALID_REQUEST, VALID_TIMESTAMP)
        }, `Did not throw for ${secret}`)
      }
    })
    it('does not throw if valid', () => {
      assert.doesNotThrow(() => {
        createSignature(VALID_SECRET, VALID_REQUEST, VALID_TIMESTAMP)
      })
    })
  })

  describe('when validating timestamp', () => {
    it('throws if not a valid unix timestamp', () => {
      const invalidTimestamps = [undefined, 1, false, 'string']

      for (const timestamp of invalidTimestamps) {
        assert.throws(() => {
          // @ts-ignore
          createSignature(VALID_SECRET, VALID_REQUEST, timestamp)
        }, `Did not throw for ${timestamp}`)
      }
    })
    it('does not throw if valid', () => {
      assert.doesNotThrow(() => {
        createSignature(VALID_SECRET, VALID_REQUEST, VALID_TIMESTAMP)
      })
    })
  })

  describe('when input is valid', () => {
    it('generates different signatures with different url search order', () => {
      const headerOne = 'one'

      const headers = { headerOne }

      assert.notStrictEqual(
        createSignature(
          VALID_SECRET,
          { ...VALID_REQUEST, path: '/api/resources?q=1&w=2', headers },
          VALID_TIMESTAMP
        ),
        createSignature(
          VALID_SECRET,
          { ...VALID_REQUEST, path: '/api/resources?w=2&q=1', headers },
          VALID_TIMESTAMP
        )
      )
    })

    it('generates different signatures with different url search', () => {
      const headerOne = 'one'

      const headers = { headerOne }

      assert.notStrictEqual(
        createSignature(
          VALID_SECRET,
          { ...VALID_REQUEST, path: '/api/resources?q=1&w=2', headers },
          VALID_TIMESTAMP
        ),
        createSignature(
          VALID_SECRET,
          { ...VALID_REQUEST, path: '/api/resources?q=12', headers },
          VALID_TIMESTAMP
        )
      )
    })

    it('does not break with headers with linebreaks', () => {
      const headerTwo = 'two\nthree'

      const headers = { headerTwo }

      assert.doesNotThrow(() =>
        createSignature(
          VALID_SECRET,
          {
            ...VALID_REQUEST,
            headers,
          },
          VALID_TIMESTAMP
        )
      )
    })

    it('generates same signature if headers key are provided with different casing', () => {
      const headerOne = 'one'
      const headerTwo = 'two'

      const headers = { headerOne, headerTwo }
      const headersCased = { headerone: headerOne, headerTWO: headerTwo }

      assert.deepStrictEqual(
        createSignature(VALID_SECRET, { ...VALID_REQUEST, headers }, VALID_TIMESTAMP),
        createSignature(VALID_SECRET, { ...VALID_REQUEST, headers: headersCased }, VALID_TIMESTAMP)
      )
    })
    it('generates same signature if headers values are provided with different ending/starting spacing (trimming)', () => {
      const headerOne = 'one'
      const headerTwo = 'two'

      const headers = { headerOne, headerTwo }
      const headersSpaced = { '      headerOne': headerOne, 'headerTwo        ': headerTwo }

      assert.deepStrictEqual(
        createSignature(VALID_SECRET, { ...VALID_REQUEST, headers }, VALID_TIMESTAMP),
        createSignature(VALID_SECRET, { ...VALID_REQUEST, headers: headersSpaced }, VALID_TIMESTAMP)
      )
    })
    it('generates different signatures with different secrets', () => {
      const newSecret = `q${VALID_SECRET.slice(1, VALID_SECRET.length)}`
      assert.notStrictEqual(
        createSignature(newSecret, VALID_REQUEST, VALID_TIMESTAMP),
        createSignature(VALID_SECRET, VALID_REQUEST, VALID_TIMESTAMP)
      )
    })
  })
})
