import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { CheckinService } from './check-in'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from 'generated/prisma/runtime/client'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-checkins-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let checkinService: CheckinService

describe('Check-in Service', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    checkinService = new CheckinService(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: 'gym-1',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: new Decimal(0).toNumber(),
      longitude: new Decimal(0).toNumber(),
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0)) // 20 de janeiro de 2022 às 8:00:00
    const { checkin } = await checkinService.execute({
      userId: 'user-1',
      gymId: 'gym-1',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkin.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice on the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0)) // 20 de janeiro de 2022 às 8:00:00
    await checkinService.execute({
      userId: 'user-1',
      gymId: 'gym-1',
      userLatitude: 0,
      userLongitude: 0,
    })

    await expect(
      checkinService.execute({
        userId: 'user-1',
        gymId: 'gym-1',
        userLatitude: 0,
        userLongitude: 0,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice but on different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0)) // 20 de janeiro de 2022 às 8:00:00
    await checkinService.execute({
      userId: 'user-1',
      gymId: 'gym-1',
      userLatitude: 0,
      userLongitude: 0,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0)) // 21 de janeiro de 2022 às 8:00:00
    const { checkin } = await checkinService.execute({
      userId: 'user-1',
      gymId: 'gym-1',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkin.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on a distant gym', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0)) // 20 de janeiro de 2022 às 8:00:00

    await gymsRepository.create({
      id: 'gym-2',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-27.0747279).toNumber(),
      longitude: new Decimal(-49.4889672).toNumber(),
    })
    await expect(
      checkinService.execute({
        userId: 'user-1',
        gymId: 'gym-2',
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
