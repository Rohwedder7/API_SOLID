import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { GetUserProfileService } from './get-user-profile'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let userRepository: InMemoryUsersRepository
let getUserProfileService: GetUserProfileService

describe('Get User Profile Service', () => {
  beforeEach(() => {
    // Clear the in-memory users repository before each test
    userRepository = new InMemoryUsersRepository()
    getUserProfileService = new GetUserProfileService(userRepository)
  })
  it('should be able to get a user profile', async () => {
    const createUser = await userRepository.create({
      name: 'John Doe',
      email: 'johns@email.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await getUserProfileService.execute({
      userId: createUser.id,
    })
    expect(user.name).toEqual('John Doe')
  })

  it('should not be able to get a user profile with wrong user ID', async () => {
    await expect(
      getUserProfileService.execute({
        userId: 'wrong-user-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
