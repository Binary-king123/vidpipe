const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.video.count()
    console.log("DB Connection Success! Video Count:", count)
  } catch (err) {
    console.error("DB Connection Error:", err.message)
  } finally {
    await prisma.$disconnect()
  }
}
main()
