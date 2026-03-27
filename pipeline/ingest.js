#!/usr/bin/env node
/**
 * MODULE 1 — URL INGEST + QUEUE
 * Usage:
 *   node pipeline/ingest.js --file urls.txt
 *   node pipeline/ingest.js --url "https://cdn.example.com/video.mp4"
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function ingestUrl(url) {
  const trimmed = url.trim();
  if (!trimmed || !trimmed.startsWith('http')) return null;

  try {
    const record = await prisma.videoQueue.upsert({
      where: { cdnUrl: trimmed },
      update: {},
      create: { cdnUrl: trimmed, status: 'pending', retryCount: 0 },
    });
    return record;
  } catch (err) {
    console.error(`  ❌ Error inserting ${trimmed}:`, err.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let urls = [];

  const fileFlag = args.indexOf('--file');
  const urlFlag = args.indexOf('--url');

  if (fileFlag !== -1 && args[fileFlag + 1]) {
    const filePath = path.resolve(args[fileFlag + 1]);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    urls = lines.filter(l => l.trim().startsWith('http'));
    console.log(`📄 Loaded ${urls.length} URLs from ${filePath}`);
  } else if (urlFlag !== -1 && args[urlFlag + 1]) {
    urls = [args[urlFlag + 1]];
  } else {
    console.log('Usage:');
    console.log('  node pipeline/ingest.js --file urls.txt');
    console.log('  node pipeline/ingest.js --url "https://..."');
    process.exit(0);
  }

  console.log(`\n🔄 Inserting ${urls.length} URL(s) into queue...\n`);

  let inserted = 0, skipped = 0;

  for (const url of urls) {
    const result = await ingestUrl(url);
    if (result) {
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        console.log(`  ✅ Queued: ${url.substring(0, 80)}`);
        inserted++;
      } else {
        console.log(`  ⏭️  Already exists: ${url.substring(0, 80)}`);
        skipped++;
      }
    }
  }

  console.log(`\n📊 Done — Inserted: ${inserted} | Skipped (duplicates): ${skipped}`);

  // Show queue summary
  const counts = await prisma.videoQueue.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  console.log('\n📋 Queue Status:');
  counts.forEach(c => console.log(`  ${c.status}: ${c._count.id}`));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
