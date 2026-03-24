import * as crypto from 'crypto'

const textEncoder = new TextEncoder()

/** Constant-time compare of UTF-8 bytes; preserves string `===` semantics (e.g. hex case). */
export const timingSafeUtf8StringEqual = (a: string, b: string): boolean => {
  const aBuf = textEncoder.encode(a)
  const bBuf = textEncoder.encode(b)
  if (aBuf.length !== bBuf.length) {
    return false
  }
  return crypto.timingSafeEqual(aBuf, bBuf)
}
