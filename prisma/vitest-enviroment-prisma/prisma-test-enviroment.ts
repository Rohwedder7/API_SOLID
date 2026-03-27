import 'dotenv/config'
import { execSync } from 'node:child_process'
import { Environment } from 'vitest/environments'

function generateTestDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in the environment variables')
  }

  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', 'public')

  return url.toString()
}

export default <Environment>{
  name: 'prisma-test-environment',
  viteEnvironment: 'ssr',
  async setup() {
    const testDatabaseUrl = generateTestDatabaseUrl()

    process.env.DATABASE_URL = testDatabaseUrl
    const { prisma } = await import('@/lib/prisma')

    execSync('npx prisma migrate deploy', { stdio: 'inherit' })

    return {
      async teardown() {
        await prisma.$disconnect()
      },
    }
  },
}
