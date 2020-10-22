import * as assert from 'assert'

describe('create-signature', () => {
  describe('when canonical request does not respect constraints', () => {
    it('throws with unsupported methods', () => {
      assert.fail()
    })
    it('throws with non-object headers', () => {
      assert.fail()
    })
    it('throws non canonical URL paths', () => {
      assert.fail()
    })
    it('throws with non string bodies', () => {
      assert.fail()
    })
    it('does not throw with empty bodies', () => {
      assert.fail()
    })
    it('does not throw with non-empty headers', () => {
      assert.fail()
    })
  })

  describe('when invalid secret', () => {
    it('throws if undefined', () => {
      assert.fail()
    })
    it('throws not a string', () => {
      assert.fail()
    })
    it('throws if invalid shape', () => {
      assert.fail()
    })
  })

  describe('when invalid timestamp', () => {
    it('throws if undefined', () => {
      assert.fail()
    })
    it('throws if not unix timestamp', () => {
      assert.fail()
    })
  })

  describe('with headers', () => {
    it('generates different signatures with differently ordered headers', () => {
      assert.fail()
    })
    it('generates same signature if headers key are provided with different casing', () => {
      assert.fail()
    })
    it('generates same signature if headers values are provided with different ending/starting spacing (trimming)', () => {
      assert.fail()
    })
  })

  describe('with secrets', () => {
    it('generates different signatures with different secrets', () => {
      assert.fail()
    })
  })
})
