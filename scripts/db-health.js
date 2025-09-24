const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking database health...')

  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start

    console.log('✅ Database connection: OK')
    console.log(`⏱️  Latency: ${latency}ms`)

    // Get some basic counts
    const userCount = await prisma.user.count()
    const postCount = await prisma.post.count()
    const tagCount = await prisma.tag.count()

    console.log(`👥 Users: ${userCount}`)
    console.log(`📝 Posts: ${postCount}`)
    console.log(`🏷️  Tags: ${tagCount}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)