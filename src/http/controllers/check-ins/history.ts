import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchUserCheckInsHistoryService } from '@/services/factories/make-fetch-user-check-ins-history-services'

export async function historyCheckIns(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const historyCheckInsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
  })

  const { page } = historyCheckInsQuerySchema.parse(request.query)

  const fetchUserCheckInsHistoryService = makeFetchUserCheckInsHistoryService()
  const { checkins } = await fetchUserCheckInsHistoryService.execute({
    userId: request.user.sub,
    page,
  })

  return reply.status(200).send({ checkins })
}
