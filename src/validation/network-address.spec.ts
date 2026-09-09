import { describe, it, expect } from 'vitest'
import { isValidNetworkAddress } from './network-address'

describe('isValidNetworkAddress', () => {
  it('accepts an IPv4 address', () => {
    expect(isValidNetworkAddress('192.168.0.1')).toBe(true)
  })

  it('accepts an IPv4 address with a port', () => {
    expect(isValidNetworkAddress('192.168.0.1:2000')).toBe(true)
  })

  it('rejects an IPv4 address with an octet above 255', () => {
    expect(isValidNetworkAddress('427.0.0.1')).toBe(false)
  })

  it('accepts an IPv6 address', () => {
    expect(isValidNetworkAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
  })

  it('accepts a bracketed IPv6 address with a port', () => {
    expect(isValidNetworkAddress('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:443')).toBe(true)
  })

  it('accepts a domain', () => {
    expect(isValidNetworkAddress('google.com')).toBe(true)
  })

  it('accepts a domain with a port', () => {
    expect(isValidNetworkAddress('google.com:4000')).toBe(true)
  })

  it('rejects a string that is not an address at all', () => {
    expect(isValidNetworkAddress('not an ip address')).toBe(false)
  })

  it('accepts a wildcard domain', () => {
    expect(isValidNetworkAddress('*.cloudflare.com')).toBe(true)
  })

  it('accepts a wildcard domain with multiple subdomain labels', () => {
    // Regression: the wildcard branch matched only a single subdomain label,
    // rejecting real customer domains even though the non-wildcard branch
    // already allowed any number of subdomains.
    expect(isValidNetworkAddress('*.too.example.com')).toBe(true)
    expect(isValidNetworkAddress('*.one.two.three.example.com')).toBe(true)
  })

  it('rejects a bare wildcard', () => {
    expect(isValidNetworkAddress('*')).toBe(false)
  })

  it('rejects a wildcard with no domain label before the TLD', () => {
    expect(isValidNetworkAddress('*.com')).toBe(false)
  })

  it('rejects a wildcard applied to an IP address', () => {
    expect(isValidNetworkAddress('*.128.0.1')).toBe(false)
  })

  it('accepts a TLD longer than six characters', () => {
    // ICANN has delegated long gTLDs since 2012; a shorter bound rejected
    // valid customer addresses.
    expect(isValidNetworkAddress('qa-gql-gateway.akzonobel.hosting')).toBe(true)
    expect(isValidNetworkAddress('*.akzonobel.hosting')).toBe(true)
  })

  it('accepts a TLD at the maximum DNS label length of 63 characters', () => {
    expect(isValidNetworkAddress(`example.${'a'.repeat(63)}`)).toBe(true)
  })

  it('rejects a TLD exceeding the maximum DNS label length of 63 characters', () => {
    expect(isValidNetworkAddress(`example.${'a'.repeat(64)}`)).toBe(false)
  })
})
