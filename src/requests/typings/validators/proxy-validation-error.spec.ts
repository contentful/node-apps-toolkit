import * as assert from 'assert'
import * as runtypes from 'runtypes'
import { ValidationException } from '../../exceptions'
import { proxyValidationError } from './proxy-validation-error'

describe('proxyValidationError', () => {
  describe('scalar without named constraint', () => {
    it('converts to ValidationException', () => {
      assert.throws(() => {
        try {
          proxyValidationError(
            runtypes.Union(runtypes.Literal('val1'), runtypes.Literal('val2')),
          ).check('invalid')
        } catch (error) {
          if (error instanceof ValidationException) {
            assert.strictEqual(error.constraintName, undefined)
            assert.strictEqual(error.key, undefined)
          }

          throw error
        }
      }, ValidationException)
    })
  })

  describe('scalar with named constraint', () => {
    it('converts to ValidationException without constraint name', () => {
      assert.throws(() => {
        try {
          proxyValidationError(
            runtypes.String.withConstraint((s) => s === 'value', { name: 'constraint-name' }),
          ).check('invalid')
        } catch (error) {
          if (error instanceof ValidationException) {
            assert.strictEqual(error.constraintName, 'constraint-name')
            assert.strictEqual(error.key, undefined)
          }

          throw error
        }
      }, ValidationException)
    })
  })

  describe('object without named constraint', () => {
    it('converts to ValidationException with key', () => {
      assert.throws(() => {
        try {
          proxyValidationError(
            runtypes.Record({
              field: runtypes.Union(runtypes.Literal('val1'), runtypes.Literal('val2')),
            }),
          ).check({ field: 'invalid' })
        } catch (error) {
          if (error instanceof ValidationException) {
            assert.strictEqual(error.constraintName, undefined)
            assert.strictEqual(error.key, 'field')
          }

          throw error
        }
      }, ValidationException)
    })
  })

  describe('object with named constraint', () => {
    it('converts to ValidationException with key and constraint name', () => {
      assert.throws(() => {
        try {
          proxyValidationError(
            runtypes.Record({
              field: runtypes.String.withConstraint((s) => s === 'value', {
                name: 'constraint-name',
              }),
            }),
          ).check({ field: 'invalid' })
        } catch (error) {
          if (error instanceof ValidationException) {
            assert.strictEqual(error.constraintName, 'constraint-name')
            assert.strictEqual(error.key, 'field')
          }

          throw error
        }
      }, ValidationException)
    })
  })
})
