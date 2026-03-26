import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
    },
  },
  build: {
    sourcemap: false,
  },
  esbuild: {
    sourcemap: false,
  },
  test: {
    dir: 'src',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          dir: 'src/services',
          environment: 'node',
          include: ['**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          dir: 'src/http/controllers',
          include: ['**/*.spec.ts'],
          environment:
            './prisma/vitest-enviroment-prisma/prisma-test-enviroment.ts',
        },
      },
    ],
  },
})
