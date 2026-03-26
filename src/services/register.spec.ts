import { beforeEach, describe, expect, it } from 'vitest'
import { RegisterService } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository
let registerService: RegisterService

describe('Register Service', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    registerService = new RegisterService(usersRepository)
  })

  it('should be able to register a user', async () => {
    const { user } = await registerService.execute({
      name: 'John Doe',
      email: 'johns@email.com',
      password: '123456',
    })

    const isPasswordHashCorrectly = await compare('123456', user.password_hash)

    expect(isPasswordHashCorrectly).toBe(true)
  })

  it('should not be able to register a user with an existing email', async () => {
    await registerService.execute({
      name: 'John Doe',
      email: 'john@email.com',
      password: '123456',
    })

    await expect(() =>
      registerService.execute({
        name: 'John Doe',
        email: 'john@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
