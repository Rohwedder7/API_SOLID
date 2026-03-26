import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCheckInService } from '@/services/factories/make-check-in-service'

export async function createCheckIn(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const checkGymsParamsSchema = z.object({
    gymId: z.string().uuid(),
  })
  const createCheckInBodySchema = z.object({
    latitude: z.number().refine(
      (value) => {
        return value >= -90 && value <= 90
      },
      {
        message: 'Latitude must be between -90 and 90',
      },
    ),
    longitude: z.number().refine(
      (value) => {
        return value >= -180 && value <= 180
      },
      {
        message: 'Longitude must be between -180 and 180',
      },
    ),
  })

  const { gymId } = checkGymsParamsSchema.parse(request.params)
  const { latitude, longitude } = createCheckInBodySchema.parse(request.body)

  const createCheckInService = makeCheckInService()
  await createCheckInService.execute({
    gymId,
    userId: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(201).send()
}
