import { GymsRepository } from '@/repositories/gyms-repository'
import { Gym } from 'generated/prisma/client'

interface FetchNearbyGymsServiceRequest {
  latitude: number
  longitude: number
}

interface FetchNearbyGymsServiceResponse {
  gyms: Gym[]
}

export class FetchNearbyGymsService {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    latitude,
    longitude,
  }: FetchNearbyGymsServiceRequest): Promise<FetchNearbyGymsServiceResponse> {
    const gyms = await this.gymsRepository.findManyNearby({
      latitude,
      longitude,
    })

    return {
      gyms,
    }
  }
}
