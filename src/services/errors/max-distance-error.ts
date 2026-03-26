export class MaxDistanceError extends Error {
  constructor() {
    super('Max distance exceeded.')
    this.name = 'MaxDistanceError'
    Object.setPrototypeOf(this, MaxDistanceError.prototype)
  }
}
