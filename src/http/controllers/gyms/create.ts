import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateGymService } from '@/services/factories/make-create-gym-services'

export async function createGym(request: FastifyRequest, reply: FastifyReply) {
  const createGymBodySchema = z.object({
    title: z.string(),
    description: z.string().nullable(),
    phone: z.string().nullable(),
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

  const { title, description, phone, latitude, longitude } =
    createGymBodySchema.parse(request.body)

  const createGymService = makeCreateGymService()
  await createGymService.execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  })

  return reply.status(201).send()
}
