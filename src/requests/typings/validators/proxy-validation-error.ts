import * as runtypes from 'runtypes'
import { ValidationException } from '../../exceptions'

const NAMED_CONSTRAINT_FAILURE_MSG = /^Failed (.+?) check/

// eslint-disable-next-line no-unused-vars
export function proxyValidationError<T extends { check: (...args: unknown[]) => unknown }>(
  constraint: T,
): T {
  // eslint-disable-next-line no-undef
  return new Proxy(constraint, {
    get(target, property) {
      if (property !== 'check') {
        return target[property as keyof T]
      }

      return (...args: unknown[]) => {
        try {
          return target.check(...args)
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
