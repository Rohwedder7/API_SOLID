export class MaxNumberOfCheckInsError extends Error {
  constructor() {
    super('Max number of check-ins exceeded.')
    this.name = 'MaxNumberOfCheckInsError'
    Object.setPrototypeOf(this, MaxNumberOfCheckInsError.prototype)
  }
}
