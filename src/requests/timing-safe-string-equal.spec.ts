import { describe, it, expect } from 'vitest'

import { timingSafeUtf8StringEqual } from './timing-safe-string-equal'

describe('timingSafeUtf8StringEqual', () => {
  const hex64 = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

  it('returns true for identical strings', () => {
    expect(timingSafeUtf8StringEqual(hex64, hex64)).toBe(true)
  })

  it('returns false for same-length unequal strings', () => {
    const other = '1123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    expect(timingSafeUtf8StringEqual(hex64, other)).toBe(false)
  })

  it('returns false when lengths differ without throwing (timingSafeEqual guard)', () => {
    expect(timingSafeUtf8StringEqual(hex64, hex64.slice(0, 63))).toBe(false)
    expect(timingSafeUtf8StringEqual('', hex64)).toBe(false)
    expect(timingSafeUtf8StringEqual(hex64, `${hex64}a`)).toBe(false)
  })

  it('is case-sensitive like string ===', () => {
    expect(timingSafeUtf8StringEqual(hex64, hex64.toUpperCase())).toBe(false)
  })
})
