import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { FetchNearbyGymsService } from './fetch-nearby-gyms'

let gymsRepository: InMemoryGymsRepository
let fetchNearbyGymsService: FetchNearbyGymsService

describe('Fetch Nearby Gyms Service', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    fetchNearbyGymsService = new FetchNearbyGymsService(gymsRepository)
  })

  it('should be able to fetch nearby gyms', async () => {
    await gymsRepository.create({
      title: 'Near Gym',
      description: 'A gym nearby',
      phone: '11999999999',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    await gymsRepository.create({
      title: 'Far Gym',
      description: 'A gym far away',
      phone: '11888888888',
      latitude: -23.6505,
      longitude: -46.7333,
    })

    const { gyms } = await fetchNearbyGymsService.execute({
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms[0]?.title).toBe('Near Gym')
  })

  it('should return an empty list when no gyms are nearby', async () => {
    await gymsRepository.create({
      title: 'Far Gym',
      description: 'A gym far away',
      phone: '11999999999',
      latitude: -23.6505,
      longitude: -46.7333,
    })

    const { gyms } = await fetchNearbyGymsService.execute({
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(gyms).toHaveLength(0)
  })

  it('should not return gyms that are more than 10km away', async () => {
    await gymsRepository.create({
      title: 'Close Gym',
      description: 'A gym close by',
      phone: '11999999999',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    await gymsRepository.create({
      title: 'Distant Gym',
      description: 'A gym more than 10km away',
      phone: '11888888888',
      latitude: -23.4505, // ~11km away
      longitude: -46.6333,
    })

    const { gyms } = await fetchNearbyGymsService.execute({
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms[0]?.title).toBe('Close Gym')
  })

  it('should return multiple nearby gyms', async () => {
    await gymsRepository.create({
      title: 'Gym 1',
      description: 'First nearby gym',
      phone: '11999999999',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    await gymsRepository.create({
      title: 'Gym 2',
      description: 'Second nearby gym',
      phone: '11888888888',
      latitude: -23.5515,
      longitude: -46.6343,
    })

    await gymsRepository.create({
      title: 'Gym 3',
      description: 'Third nearby gym',
      phone: '11777777777',
      latitude: -23.5525,
      longitude: -46.6353,
    })

    const { gyms } = await fetchNearbyGymsService.execute({
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(gyms).toHaveLength(3)
  })
})
