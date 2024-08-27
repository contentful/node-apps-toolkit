import * as runtypes from 'runtypes'
import { ValidationException } from '../../exceptions'

const NAMED_CONSTRAINT_FAILURE_MSG = /^Failed (.+?) check/

// eslint-disable-next-line no-unused-vars
export function proxyValidationError<T extends object>(constraint: T): T {
  // eslint-disable-next-line no-undef
  return new Proxy(constraint, {
    get(target, property) {
      const value = target[property as keyof T]
      if (typeof value !== 'function') {
        return value
      }

      return (...args: unknown[]) => {
        try {
          return value(...args)
        } catch (error) {
          if (error instanceof runtypes.ValidationError) {
            let constraintName = undefined
            if ('name' in constraint && typeof constraint.name === 'string') {
              constraintName = constraint.name
            } else {
              const result = NAMED_CONSTRAINT_FAILURE_MSG.exec(error.message)
              constraintName = result ? result[1] : undefined
            }

            throw new ValidationException(error.message, constraintName, error.key)
          }

          throw error
        }
      }
    },
  })
}
