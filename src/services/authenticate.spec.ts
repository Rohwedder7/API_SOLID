import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { AuthenticationService } from './authenticate'
import { InvalidCredentialsError } from './errors/invalid-credentials-errors'

let userRepository: InMemoryUsersRepository
let authenticateService: AuthenticationService

describe('Authenticate Service', () => {
  beforeEach(() => {
    // Clear the in-memory users repository before each test
    userRepository = new InMemoryUsersRepository()
    authenticateService = new AuthenticationService(userRepository)
  })
  it('should be able to authenticate a user', async () => {
    await userRepository.create({
      name: 'John Doe',
      email: 'johns@email.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await authenticateService.execute({
      email: 'johns@email.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should not be able to authenticate with wrong e-mail', async () => {
    await expect(
      authenticateService.execute({
        email: 'jo@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    await userRepository.create({
      name: 'John Doe',
      email: 'johns@email.com',
      password_hash: await hash('123456', 6),
    })

    await expect(
      authenticateService.execute({
        email: 'johns@email.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
