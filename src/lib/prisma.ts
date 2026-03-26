import { createRequire } from 'node:module'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '../env'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('../../generated/prisma')

const prismaAdapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
})

export const prisma = new PrismaClient({
  adapter: prismaAdapter,
  log: env.NODE_ENV === 'dev' ? ['query'] : [],
})
