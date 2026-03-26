import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    payload: {
      role: 'MEMBER' | 'ADMIN'
    }
    user: {
      sub: string
      role: 'MEMBER' | 'ADMIN'
    }
  }
}
