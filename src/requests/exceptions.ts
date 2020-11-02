export class ExpiredRequestException extends Error {
  private readonly ttl: number

  constructor(ttl: number) {
    super()

    this.ttl = ttl
    this.message = `[${this.constructor.name}]: Requests are expected to be verified within ${this.ttl}s from their signature.`
  }
}
