const { google } = require('googleapis')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const KEY_FILE = '/root/vidpipe/google-indexing-key.json'
const APP_URL = 'https://ilovedesi.fun'

async function indexAllVideos() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  })
  const client = await auth.getClient()

  const videos = await prisma.video.findMany({ select: { slug: true } })
  console.log(`Submitting ${videos.length} URLs to Google...`)

  for (const video of videos) {
    const url = `${APP_URL}/video/${video.slug}`
    try {
      const res = await client.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: { url, type: 'URL_UPDATED' },
      })
      console.log(`✅ ${url} → ${res.status}`)
    } catch (e) {
      console.log(`❌ ${url} → ${e.message}`)
    }
    await new Promise(r => setTimeout(r, 200))
  }
  await prisma.$disconnect()
}

indexAllVideos()
