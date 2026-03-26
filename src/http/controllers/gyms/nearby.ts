import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchNearbyGymsService } from '@/services/factories/make-fetch-nearby-gyms-services'

export async function fetchNearbyGyms(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const nearbyGymsQuerySchema = z.object({
    latitude: z.coerce.number().refine(
      (value) => {
        return value >= -90 && value <= 90
      },
      {
        message: 'Latitude must be between -90 and 90',
      },
    ),
    longitude: z.coerce.number().refine(
      (value) => {
        return value >= -180 && value <= 180
      },
      {
        message: 'Longitude must be between -180 and 180',
      },
    ),
  })

  const { latitude, longitude } = nearbyGymsQuerySchema.parse(request.query)

  const nearbyGymsService = makeFetchNearbyGymsService()
  const { gyms } = await nearbyGymsService.execute({
    latitude,
    longitude,
  })

  return reply.status(200).send({
    gyms,
  })
}
