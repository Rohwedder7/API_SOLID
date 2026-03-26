import { CheckIn, Prisma } from 'generated/prisma'
import { CheckInsRepository } from '../check-ins-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = []

  async save(checkIn: CheckIn): Promise<CheckIn> {
    const checkInIndex = this.items.findIndex((item) => item.id === checkIn.id)

    if (checkInIndex >= 0) {
      this.items[checkInIndex] = checkIn
    }

    return checkIn
  }

  async findById(id: string): Promise<CheckIn | null> {
    const checkIn = this.items.find((checkIn) => checkIn.id === id)

    return checkIn || null
  }

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn = {
      id: randomUUID(),
      gym_id: data.gym_id,
      user_id: data.user_id,
      created_at: new Date(),
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
    }

    this.items.push(checkIn)

    return checkIn
  }

  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const checkInOnSameDate = this.items.find((checkIn) => {
      const isSameUser = checkIn.user_id === userId
      const isSameDate =
        checkIn.created_at.toDateString() === date.toDateString()

      return isSameUser && isSameDate
    })

    return checkInOnSameDate || null
  }

  async findManyByUserId(userId: string, page?: number): Promise<CheckIn[]> {
    const userCheckIns = this.items.filter(
      (checkIn) => checkIn.user_id === userId,
    )

    if (page) {
      const pageSize = 20
      const skip = (page - 1) * pageSize
      return userCheckIns.slice(skip, skip + pageSize)
    }

    return userCheckIns
  }

  async countByUserId(userId: string): Promise<number> {
    const userCheckInsCount = this.items.filter(
      (checkIn) => checkIn.user_id === userId,
    ).length

    return userCheckInsCount
  }
}
