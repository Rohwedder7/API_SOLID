import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { historyCheckIns } from './history'
import { metricsCheckIns } from './metrics'
import { createCheckIn } from './create'
import { validateCheckIn } from './validate'
import { verifyUserRole } from '@/http/middlewares/verify-user-roler'

export async function checkInsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/check-ins/history', historyCheckIns)
  app.get('/check-ins/metrics', metricsCheckIns)

  app.post('/gyms/:gymId/check-ins', createCheckIn)
  app.patch(
    '/check-ins/:checkInId/validate',
    { onRequest: [verifyUserRole('ADMIN')] },
    validateCheckIn,
  )
}
