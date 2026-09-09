import { describe, it, expect } from 'vitest'
import { isValidHostedCodePath } from './hosted-code-path'

describe('isValidHostedCodePath', () => {
  it('accepts a .js path', () => {
    expect(isValidHostedCodePath('functions/translate-entries.js')).toBe(true)
  })

  it('accepts a .mjs path', () => {
    expect(isValidHostedCodePath('functions/translate-entries.mjs')).toBe(true)
  })

  it('accepts a path with dashes, underscores and nested folders', () => {
    expect(isValidHostedCodePath('eins/zwei/trans-late_now.js')).toBe(true)
  })

  it('rejects a path where any character stands in for the extension dot', () => {
    // Regression: an unescaped "." before "(m?js)" matched any single
    // character, so a path with no literal dot was incorrectly accepted.
    expect(isValidHostedCodePath('functions/translate-entriesXjs')).toBe(false)
  })

  it('rejects a path that does not end in .js or .mjs', () => {
    expect(isValidHostedCodePath('functions/translate-entries.py')).toBe(false)
  })

  it('rejects a path with no extension', () => {
    expect(isValidHostedCodePath('functions/translate-entries')).toBe(false)
  })

  it('rejects a path that does not start with a letter or number', () => {
    expect(isValidHostedCodePath('_functions/eins.js')).toBe(false)
    expect(isValidHostedCodePath('-functions/eins.js')).toBe(false)
    expect(isValidHostedCodePath('/functions/zwei.js')).toBe(false)
  })

  it('rejects a path with unsupported characters', () => {
    expect(isValidHostedCodePath('functions/no%no.js')).toBe(false)
  })
})
