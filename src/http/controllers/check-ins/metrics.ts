import type { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetUserMetricsService } from '@/services/factories/make-get-user-metrics-services'

export async function metricsCheckIns(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getUserMetricsService = makeGetUserMetricsService()
  const { checkInsCount } = await getUserMetricsService.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ checkInsCount })
}
