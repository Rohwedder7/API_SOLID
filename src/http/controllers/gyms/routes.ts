import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { searchGyms } from './search'
import { fetchNearbyGyms } from './nearby'
import { createGym } from './create'
import { verifyUserRole } from '@/http/middlewares/verify-user-roler'

export async function gymsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/gyms/search', searchGyms)
  app.get('/gyms/nearby', fetchNearbyGyms)

  app.post('/gyms', { onRequest: [verifyUserRole('ADMIN')] }, createGym)
}
