import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { Environment } from 'vitest/environments'

function gerenateTestDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in the environment variables')
  }

  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <Environment>{
  name: 'prisma-test-environment',
  viteEnvironment: 'ssr',
  async setup() {
    // Criar o banco de testes
    const schema = randomUUID()
    const testDatabaseUrl = gerenateTestDatabaseUrl(schema)

    process.env.DATABASE_URL = testDatabaseUrl
    const { prisma } = await import('@/lib/prisma')

    execSync(`npx prisma migrate deploy`)
    return {
      async teardown() {
        // Deletar o banco de testes
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )

        await prisma.$disconnect()
      },
    }
  },
}
