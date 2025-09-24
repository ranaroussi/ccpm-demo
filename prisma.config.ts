import { defineConfig } from 'prisma'

export default defineConfig({
  seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts'
})