import { describe, it, expect } from 'vitest'
import {
  ActionParameterDefinition,
  MAX_PARAMETER_DEFAULT_STRING_LENGTH,
  MAX_PARAMETER_DESCRIPTION_LENGTH,
  MAX_PARAMETER_ID_LENGTH,
  MAX_PARAMETER_NAME_LENGTH,
  MAX_PARAMETER_OPTIONS,
  MAX_PARAMETER_OPTION_LABEL_LENGTH,
  validateActionParameter,
} from './action-parameters'

const validParameter: ActionParameterDefinition = {
  id: 'param1',
  name: 'Parameter 1',
  type: 'Symbol',
}

describe('validateActionParameter', () => {
  it('returns no errors for a minimal valid parameter', () => {
    expect(validateActionParameter(validParameter)).toEqual([])
  })

  it('returns no errors when every optional field is present and valid', () => {
    expect(
      validateActionParameter({
        ...validParameter,
        description: 'What this parameter does',
        required: true,
        default: 'a default',
      }),
    ).toEqual([])
  })

  it('accepts a parameter with no "required" field', () => {
    // contentful-management treats "required" as optional; requiring it here
    // would reject manifests the API itself accepts.
    expect(validateActionParameter(validParameter)).toEqual([])
  })

  describe('id', () => {
    it('rejects an id that starts with a number', () => {
      expect(validateActionParameter({ ...validParameter, id: '1param' })).toHaveLength(1)
    })

    it('rejects an id with an unsupported delimiter', () => {
      expect(validateActionParameter({ ...validParameter, id: 'my-param' })).toHaveLength(1)
    })

    it('accepts an id using "_" as a delimiter', () => {
      expect(validateActionParameter({ ...validParameter, id: 'my_param' })).toEqual([])
    })

    it('rejects an empty id', () => {
      expect(validateActionParameter({ ...validParameter, id: '' })).toHaveLength(1)
    })

    it('accepts an id at the maximum length', () => {
      const id = `a${'b'.repeat(MAX_PARAMETER_ID_LENGTH - 1)}`
      expect(validateActionParameter({ ...validParameter, id })).toEqual([])
    })

    it('rejects an id exceeding the maximum length', () => {
      const id = `a${'b'.repeat(MAX_PARAMETER_ID_LENGTH)}`
      expect(validateActionParameter({ ...validParameter, id })).toHaveLength(1)
    })
  })

  describe('name', () => {
    it('rejects an empty name', () => {
      expect(validateActionParameter({ ...validParameter, name: '' })).toHaveLength(1)
    })

    it('accepts a name at the maximum length', () => {
      const name = 'a'.repeat(MAX_PARAMETER_NAME_LENGTH)
      expect(validateActionParameter({ ...validParameter, name })).toEqual([])
    })

    it('rejects a name exceeding the maximum length', () => {
      const name = 'a'.repeat(MAX_PARAMETER_NAME_LENGTH + 1)
      expect(validateActionParameter({ ...validParameter, name })).toHaveLength(1)
    })
  })

  describe('description', () => {
    it('accepts a description at the maximum length', () => {
      const description = 'a'.repeat(MAX_PARAMETER_DESCRIPTION_LENGTH)
      expect(validateActionParameter({ ...validParameter, description })).toEqual([])
    })

    it('rejects a description exceeding the maximum length', () => {
      const description = 'a'.repeat(MAX_PARAMETER_DESCRIPTION_LENGTH + 1)
      expect(validateActionParameter({ ...validParameter, description })).toHaveLength(1)
    })
  })

  describe('type', () => {
    it('accepts every supported type', () => {
      for (const type of ['Boolean', 'Symbol', 'Number', 'Enum'] as const) {
        expect(validateActionParameter({ ...validParameter, type })).toEqual([])
      }
    })

    it('rejects an unsupported type', () => {
      const parameter = { ...validParameter, type: 'Text' } as unknown as ActionParameterDefinition
      expect(validateActionParameter(parameter)).toHaveLength(1)
    })
  })

  describe('default', () => {
    it('accepts a boolean, string or number default', () => {
      expect(validateActionParameter({ ...validParameter, default: true })).toEqual([])
      expect(validateActionParameter({ ...validParameter, default: 'text' })).toEqual([])
      expect(validateActionParameter({ ...validParameter, default: 42 })).toEqual([])
    })

    it('rejects a default that is not a primitive', () => {
      const parameter = {
        ...validParameter,
        default: { nested: true },
      } as unknown as ActionParameterDefinition
      expect(validateActionParameter(parameter)).toHaveLength(1)
    })

    it('rejects a string default exceeding the maximum length', () => {
      const parameter = {
        ...validParameter,
        default: 'a'.repeat(MAX_PARAMETER_DEFAULT_STRING_LENGTH + 1),
      }
      expect(validateActionParameter(parameter)).toHaveLength(1)
    })
  })

  describe('options', () => {
    it('accepts string options', () => {
      expect(validateActionParameter({ ...validParameter, options: ['one', 'two'] })).toEqual([])
    })

    it('accepts single-property object options', () => {
      expect(validateActionParameter({ ...validParameter, options: [{ one: 'One' }] })).toEqual([])
    })

    it('rejects an empty options array', () => {
      expect(validateActionParameter({ ...validParameter, options: [] })).toHaveLength(1)
    })

    it('rejects more options than the maximum', () => {
      const options = Array.from({ length: MAX_PARAMETER_OPTIONS + 1 }, (_, i) => `option${i}`)
      expect(validateActionParameter({ ...validParameter, options })).toHaveLength(1)
    })

    it('rejects an empty string option', () => {
      expect(validateActionParameter({ ...validParameter, options: [''] })).toHaveLength(1)
    })

    it('rejects a string option exceeding the maximum label length', () => {
      const options = ['a'.repeat(MAX_PARAMETER_OPTION_LABEL_LENGTH + 1)]
      expect(validateActionParameter({ ...validParameter, options })).toHaveLength(1)
    })

    it('rejects an object option with more than one property', () => {
      const options = [{ one: 'One', two: 'Two' }]
      expect(validateActionParameter({ ...validParameter, options })).toHaveLength(1)
    })
  })

  it('reports every problem at once rather than stopping at the first', () => {
    const parameter = {
      id: '1-bad',
      name: '',
      type: 'Text',
    } as unknown as ActionParameterDefinition
    expect(validateActionParameter(parameter).length).toBeGreaterThan(2)
  })
})
