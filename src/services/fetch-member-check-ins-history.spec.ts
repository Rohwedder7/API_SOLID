import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { FetchUserCheckInService } from './fetch-member-check-ins-history'
import { randomUUID } from 'node:crypto'

let checkInsRepository: InMemoryCheckInsRepository
let fetchUserCheckInService: FetchUserCheckInService

describe('Fetch User Check-in History Service', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    fetchUserCheckInService = new FetchUserCheckInService(checkInsRepository)
  })

  it('should be able to fetch user check-in history', async () => {
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

    const { checkins } = await fetchUserCheckInService.execute({
      userId,
    })

    expect(checkins).toHaveLength(2)
    expect(checkins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: userId,
          gym_id: gymId,
        }),
        expect.objectContaining({
          user_id: userId,
          gym_id: gymId,
        }),
      ]),
    )
  })

  it('should be able to fetch an empty list when user has no check-ins', async () => {
    const userId = randomUUID()

    const { checkins } = await fetchUserCheckInService.execute({
      userId,
    })

    expect(checkins).toHaveLength(0)
  })

  it('should fetch only check-ins from the specified user', async () => {
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

    const { checkins } = await fetchUserCheckInService.execute({
      userId: userId1,
    })

    expect(checkins).toHaveLength(2)
    expect(checkins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ user_id: userId1 }),
        expect.objectContaining({ user_id: userId1 }),
      ]),
    )
  })

  it('should return check-ins with correct metadata', async () => {
    const userId = randomUUID()
    const gymId = randomUUID()

    await checkInsRepository.create({
      user_id: userId,
      gym_id: gymId,
    })

    const { checkins } = await fetchUserCheckInService.execute({
      userId,
    })

    expect(checkins[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        user_id: userId,
        gym_id: gymId,
        created_at: expect.any(Date),
        validated_at: null,
      }),
    )
  })

  it('should be able to fetch paginated check-ins history', async () => {
    for (let i = 0; i < 22; i++) {
      await checkInsRepository.create({
        user_id: 'user-1',
        gym_id: `gym-${i}`,
      })
    }

    const { checkins } = await fetchUserCheckInService.execute({
      userId: 'user-1',
      page: 2,
    })

    expect(checkins).toHaveLength(2)
    expect(checkins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ gym_id: 'gym-20' }),
        expect.objectContaining({ gym_id: 'gym-21' }),
      ]),
    )
  })
})
