import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { GetUserMetricsService } from './get-user-metrics'
import { randomUUID } from 'node:crypto'

let checkInsRepository: InMemoryCheckInsRepository
let getUserMetricsService: GetUserMetricsService

describe('Get User Metrics Service', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    getUserMetricsService = new GetUserMetricsService(checkInsRepository)
  })

  it('should be able to get user check-ins count', async () => {
    const userId = randomUUID()
    const gymId = randomUUID()

    await checkInsRepository.create({
      user_id: userId,
      gym_id: gymId,
    })

    await checkInsRepository.create({
      user_id: userId,
      gym_id: gymId,
    })

    const { checkInsCount } = await getUserMetricsService.execute({
      userId,
    })

    expect(checkInsCount).toBe(2)
  })

  it('should return zero when user has no check-ins', async () => {
    const userId = randomUUID()

    const { checkInsCount } = await getUserMetricsService.execute({
      userId,
    })

    expect(checkInsCount).toBe(0)
  })

  it('should count only check-ins from the specified user', async () => {
    const userId1 = randomUUID()
    const userId2 = randomUUID()
    const gymId = randomUUID()

    await checkInsRepository.create({
      user_id: userId1,
      gym_id: gymId,
    })

    await checkInsRepository.create({
      user_id: userId2,
      gym_id: gymId,
    })

    await checkInsRepository.create({
      user_id: userId1,
      gym_id: gymId,
    })

    await checkInsRepository.create({
      user_id: userId2,
      gym_id: gymId,
    })

    const { checkInsCount } = await getUserMetricsService.execute({
      userId: userId1,
    })

    expect(checkInsCount).toBe(2)
  })

  it('should be able to count a large number of check-ins', async () => {
    const userId = randomUUID()

    for (let i = 0; i < 25; i++) {
      await checkInsRepository.create({
        user_id: userId,
        gym_id: `gym-${i}`,
      })
    }

    const { checkInsCount } = await getUserMetricsService.execute({
      userId,
    })

    expect(checkInsCount).toBe(25)
  })
})
