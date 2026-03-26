import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { CreateGymService } from './create-gym'

let gymsRepository: InMemoryGymsRepository
let createGymService: CreateGymService

describe('Create Gym Service', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    createGymService = new CreateGymService(gymsRepository)
  })

  it('should be able to register a Gym', async () => {
    const { gym } = await createGymService.execute({
      title: 'JavaScript Gym',
      description: 'A gym for JavaScript developers',
      phone: '11999999999',
      latitude: -23.5505199,
      longitude: -46.6333094,
    })

    expect(gym.id).toEqual(expect.any(String))
    expect(gym.title).toBe('JavaScript Gym')
  })

  it('should be able to register a Gym without description', async () => {
    const { gym } = await createGymService.execute({
      title: 'TypeScript Gym',
      description: null,
      phone: '11999999999',
      latitude: -23.5505199,
      longitude: -46.6333094,
    })

    expect(gym.id).toEqual(expect.any(String))
    expect(gym.description).toBe('')
  })

  it('should be able to register a Gym without phone', async () => {
    const { gym } = await createGymService.execute({
      title: 'React Gym',
      description: 'A gym for React developers',
      phone: null,
      latitude: -23.5505199,
      longitude: -46.6333094,
    })

    expect(gym.id).toEqual(expect.any(String))
    expect(gym.phone).toBe('')
  })

  it('should be able to register a Gym with coordinates', async () => {
    const { gym } = await createGymService.execute({
      title: 'Node.js Gym',
      description: 'A gym for Node.js developers',
      phone: '11999999999',
      latitude: -23.5505199,
      longitude: -46.6333094,
    })

    expect(gym.latitude.toNumber()).toEqual(-23.5505199)
    expect(gym.longitude.toNumber()).toEqual(-46.6333094)
  })
})
