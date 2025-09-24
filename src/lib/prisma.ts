import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle Prisma client disconnection
export const disconnectPrisma = async () => {
  await prisma.$disconnect()
}

// Helper function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true, error: null }
  } catch (error) {
    console.error('Database connection error:', error)
    return { connected: false, error: error as Error }
  }
}

// Database health check function
export const getDatabaseHealth = async () => {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start

    return {
      status: 'healthy',
      latency: `${latency}ms`,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    }
  }
}

// Helper for safe transaction execution
export const executeTransaction = async <T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(fn)
}

export default prisma