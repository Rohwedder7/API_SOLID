import fastify from 'fastify'
import { usersRoutes } from './http/controllers/users/routes'
import { fastifyCookie } from '@fastify/cookie'
import { ZodError } from 'zod'
import { env } from './env'
import fastifyJwt from '@fastify/jwt'
import { gymsRoutes } from './http/controllers/gyms/routes'
import { checkInsRoutes } from './http/controllers/check-ins/routes'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '10m',
  },
})

app.register(fastifyCookie)
app.register(usersRoutes)
app.register(gymsRoutes)
app.register(checkInsRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.issues,
    })
  }

  if (env.NODE_ENV !== 'dev') {
    console.error(error)
  } else {
    // TODO: Log error with a proper logger in dev environment
  }

  return reply.status(500).send({
    message: 'Internal server error.',
  })
})
