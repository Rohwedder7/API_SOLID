import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { CheckinService } from './validate-check-in'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { LateCheckInValidateError } from './errors/late-check-in-validate-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let validateCheckInService: CheckinService

describe('Validate Check-in Service', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    validateCheckInService = new CheckinService(
      checkInsRepository,
      gymsRepository,
    )

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2023, 0, 1, 10, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to validate a check-in', async () => {
    const checkinCreated = await checkInsRepository.create({
      user_id: 'user-1',
      gym_id: 'gym-1',
    })

    const { checkin } = await validateCheckInService.execute({
      checkInId: checkinCreated.id,
    })

    expect(checkin.validated_at).toEqual(expect.any(Date))
    expect(checkin.id).toEqual(checkinCreated.id)
  })

  it('should not be able to validate a non-existent check-in', async () => {
    await expect(
      validateCheckInService.execute({
        checkInId: 'non-existent-check-in',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw ResourceNotFoundError (not LateCheckInValidateError) for unknown check-in id', async () => {
    vi.setSystemTime(new Date(2023, 0, 1, 23, 59, 59))

    await expect(
      validateCheckInService.execute({
        checkInId: 'missing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should update the validated_at field correctly', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    const checkinCreated = await checkInsRepository.create({
      user_id: 'user-1',
      gym_id: 'gym-1',
    })

    vi.setSystemTime(new Date(2022, 0, 20, 8, 10, 0))

    const { checkin } = await validateCheckInService.execute({
      checkInId: checkinCreated.id,
    })

    expect(checkin.validated_at).toEqual(new Date(2022, 0, 20, 8, 10, 0))
  })

  it('should persist validated_at after saving', async () => {
    const created = await checkInsRepository.create({
      user_id: 'user-1',
      gym_id: 'gym-1',
    })

    await validateCheckInService.execute({ checkInId: created.id })

    const saved = await checkInsRepository.findById(created.id)
    expect(saved?.validated_at).toEqual(expect.any(Date))
  })

  it('should allow validation exactly at 20 minutes', async () => {
    vi.setSystemTime(new Date(2023, 0, 1, 13, 40, 0))

    const checkinCreated = await checkInsRepository.create({
      user_id: 'user-1',
      gym_id: 'gym-1',
    })

    vi.advanceTimersByTime(1000 * 60 * 20)

    await expect(
      validateCheckInService.execute({
        checkInId: checkinCreated.id,
      }),
    ).resolves.toHaveProperty('checkin.id', checkinCreated.id)
  })

  it('should not be able to validate a check-in after 20 minutes', async () => {
    vi.setSystemTime(new Date(2023, 0, 1, 13, 40, 0))

    const checkinCreated = await checkInsRepository.create({
      user_id: 'user-1',
      gym_id: 'gym-1',
    })

    vi.advanceTimersByTime(1000 * 60 * 21)

    await expect(
      validateCheckInService.execute({
        checkInId: checkinCreated.id,
      }),
    ).rejects.toBeInstanceOf(LateCheckInValidateError)
  })
})
