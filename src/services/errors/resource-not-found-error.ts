export class ResourceNotFoundError extends Error {
  constructor() {
    super('Resource not found.')
    this.name = 'ResourceNotFoundError'
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype)
  }
}
