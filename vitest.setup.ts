import { webcrypto } from 'node:crypto'

// Polyfill crypto for jose library
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}
