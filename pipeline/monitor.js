#!/usr/bin/env node
/**
 * MODULE 10 — MONITOR + RETRY
 * Finds failed queue items (retry_count < 3) and re-runs the downloader.
 * Usage: node pipeline/monitor.js
 */

const { PrismaClient } = require('@prisma/client');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();
const LOG_FILE = path.join(__dirname, '../pipeline.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

async function runRetries() {
  log('🔍 Checking for failed queue items...');

  const failed = await prisma.videoQueue.findMany({
    where: {
      status: 'failed',
      retryCount: { lt: 3 },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (failed.length === 0) {
    log('✅ No failed items to retry.');
    return;
  }

  log(`⚠️  Found ${failed.length} item(s) to retry.`);

  for (const item of failed) {
    log(`\n🔄 Retrying [${item.id}]: ${item.cdnUrl}`);

    // Increment retry count + set to pending (downloader will pick it up)
    await prisma.videoQueue.update({
      where: { id: item.id },
      data: {
        status: 'pending',
        retryCount: { increment: 1 },
      },
    });

    // Re-run the downloader for this single URL in non-interactive mode
    const result = spawnSync('node', [
      path.join(__dirname, 'downloader.js'),
      '--url', item.cdnUrl,
      '--auto',
    ], {
      stdio: 'inherit',
      env: process.env,
    });

    if (result.status === 0) {
      log(`  ✅ Retry succeeded for: ${item.cdnUrl}`);
    } else {
      log(`  ❌ Retry failed again for: ${item.cdnUrl}`);
      await prisma.videoQueue.update({
        where: { id: item.id },
        data: { status: 'failed' },
      });
    }
  }

  // Show final queue state
  const counts = await prisma.videoQueue.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  log('\n📋 Queue Summary after retries:');
  counts.forEach(c => log(`  ${c.status}: ${c._count.id}`));
}

async function showStatus() {
  const counts = await prisma.videoQueue.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const total = await prisma.video.count();

  console.log('\n📊 VIDPIPE STATUS');
  console.log('─────────────────────────');
  console.log(`  Published videos: ${total}`);
  console.log('\n  Queue:');
  counts.forEach(c => console.log(`    ${c.status}: ${c._count.id}`));
  console.log('─────────────────────────\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status')) {
    await showStatus();
  } else {
    await showStatus();
    await runRetries();
  }

  await prisma.$disconnect();
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  prisma.$disconnect();
  process.exit(1);
});
