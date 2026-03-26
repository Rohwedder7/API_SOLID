import { CheckIn } from 'generated/prisma'
import { CheckInsRepository } from '@/repositories/check-ins-repository'

interface FetchUserCheckInServiceRequest {
  userId: string
  page?: number
}

interface FetchUserCheckInServiceResponse {
  checkins: CheckIn[]
}

export class FetchUserCheckInService {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserCheckInServiceRequest): Promise<FetchUserCheckInServiceResponse> {
    const checkins = await this.checkInsRepository.findManyByUserId(
      userId,
      page,
    )

    return {
      checkins,
    }
  }
}
