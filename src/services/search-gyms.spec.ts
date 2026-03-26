import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { SearchGymsService } from './search-gyms'

let gymsRepository: InMemoryGymsRepository
let searchGymsService: SearchGymsService

describe('Search Gyms Service', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    searchGymsService = new SearchGymsService(gymsRepository)
  })

  it('should be able to search gyms by title', async () => {
    await gymsRepository.create({
      title: 'JavaScript Gym',
      description: 'A gym for JavaScript developers',
      phone: '11999999999',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    await gymsRepository.create({
      title: 'TypeScript Academy',
      description: 'A gym for TypeScript developers',
      phone: '11888888888',
      latitude: -23.55,
      longitude: -46.633,
    })

    const { gyms } = await searchGymsService.execute({
      query: 'JavaScript',
      page: 1,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms[0]?.title).toBe('JavaScript Gym')
  })

  it('should be able to fetch paginated gym search results', async () => {
    for (let i = 1; i <= 25; i++) {
      await gymsRepository.create({
        title: `Gym ${i}`,
        description: `Gym Description ${i}`,
        phone: `1199999999${i}`,
        latitude: -23.5505 + i * 0.0001,
        longitude: -46.6333 + i * 0.0001,
      })
    }

    const { gyms: page1 } = await searchGymsService.execute({
      query: 'Gym',
      page: 1,
    })

    const { gyms: page2 } = await searchGymsService.execute({
      query: 'Gym',
      page: 2,
    })

    expect(page1).toHaveLength(20)
    expect(page2).toHaveLength(5)
  })

  it('should return an empty list when no gyms match the search', async () => {
    await gymsRepository.create({
      title: 'JavaScript Gym',
      description: 'A gym for JavaScript developers',
      phone: '11999999999',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    const { gyms } = await searchGymsService.execute({
      query: 'NonExistentGym',
      page: 1,
    })

    expect(gyms).toHaveLength(0)
  })

  it('should be able to search gyms case-insensitively', async () => {
    await gymsRepository.create({
      title: 'JavaScript Gym',
      description: 'A gym for JavaScript developers',
      phone: '11999999999',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    const { gyms: gymsLowerCase } = await searchGymsService.execute({
      query: 'javascript',
      page: 1,
    })

    const { gyms: gymsUpperCase } = await searchGymsService.execute({
      query: 'JAVASCRIPT',
      page: 1,
    })

    expect(gymsLowerCase).toHaveLength(1)
    expect(gymsUpperCase).toHaveLength(1)
  })
})
