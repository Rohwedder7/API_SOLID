export class LateCheckInValidateError extends Error {
  constructor() {
    super('Late check-in validation.')
    this.name = 'LateCheckInValidateError'
    Object.setPrototypeOf(this, LateCheckInValidateError.prototype)
  }
}
