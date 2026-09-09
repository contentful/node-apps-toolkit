/**
 * Pattern for a network address accepted in a Contentful Function or App
 * Action's `allowNetworks` field: a domain, a wildcard domain, an IPv4
 * address, or an IPv6 address, each with an optional port.
 *
 * Exported as a pattern string rather than a `RegExp` so it can be embedded
 * directly in a JSON Schema `pattern` keyword by consumers that validate with
 * a schema engine instead of a predicate.
 *
 * @category Validation
 */
export const NETWORK_ADDRESS_PATTERN =
  '^(?:' + // Start of the non-capturing group for the entire address
  '(?:' + // Start of the non-capturing group for domain names
  '(?:\\*\\.)' + // Matches wildcard domains like *.example.com
  '(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+' + // Matches one or more subdomains after the wildcard
  '[a-zA-Z]{2,63}' + // Matches the top-level domain (TLD)
  '|' + // OR
  '(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+' + // Matches standard domains with one or more subdomains
  '[a-zA-Z]{2,63}' + // Matches the top-level domain (TLD)
  ')|' + // End of the non-capturing group for domain names, OR
  '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}' + // Matches the first three octets of an IPv4 address
  '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|' + // Matches the last octet of an IPv4 address
  '(\\[(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\\]' + // Matches IPv6 addresses in square brackets
  '|(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4})' + // Matches IPv6 addresses without square brackets
  ')(?::\\d{1,5})?$' // Matches an optional port number (1 to 5 digits)

/**
 * Returns whether a string is a valid entry for a Contentful Function or App
 * Action's `allowNetworks` field.
 *
 * The TLD is bounded at 63 characters per RFC 1035 §2.3.4, the maximum length
 * of a single DNS label. ICANN has delegated long gTLDs (`.hosting`,
 * `.international`) since 2012, so a shorter bound rejects valid addresses.
 *
 * @category Validation
 */
export const isValidNetworkAddress = (address: string): boolean =>
  typeof address === 'string' && new RegExp(NETWORK_ADDRESS_PATTERN).test(address)
