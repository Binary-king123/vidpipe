#!/usr/bin/env node
/**
 * MODULE 2 — INTERACTIVE DOWNLOADER
 * Downloads a video from CDN URL using curl, then:
 *   1. Asks user for title, description, category, tags, thumbnail_time
 *   2. Calls processor (FFmpeg compress + thumbnail)
 *   3. Calls storage manager (file paths)
 *   4. Calls publisher (DB insert)
 *
 * Usage:
 *   node pipeline/downloader.js           → processes next pending URL from queue
 *   node pipeline/downloader.js --url X   → processes specific URL
 *   node pipeline/downloader.js --auto    → non-interactive (uses auto-generated content)
 */

const readline = require('readline');
const { execSync, spawnSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const os = require('os');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { compressTo240p, extractThumbnail } = require('./processor');
const { getVideoPath, ensureDir } = require('./storage');
const { publishVideo } = require('./publisher');

const prisma = new PrismaClient();
const TMP_DIR = os.tmpdir();

// ─── Readline prompt helper ──────────────────────────────────────────────────
function ask(rl, question, defaultVal = '') {
  return new Promise(resolve => {
    const prompt = defaultVal ? `${question} [${defaultVal}]: ` : `${question}: `;
    rl.question(prompt, answer => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

// ─── Download via curl ───────────────────────────────────────────────────────
function downloadUrl(url, destPath) {
  console.log(`\n  ⬇️  Downloading: ${url}`);
  console.log(`     → ${destPath}`);

  const result = spawnSync('curl', [
    '-L',           // Follow redirects
    '-o', destPath, // Output file
    '--retry', '3', // Retry on failure
    '--retry-delay', '2',
    '--max-time', '600', // 10 min timeout
    '-#',           // Progress bar
    url,
  ], { stdio: 'inherit' });

  if (result.status !== 0) {
    throw new Error(`curl failed with exit code ${result.status}`);
  }

  if (!fs.existsSync(destPath) || fs.statSync(destPath).size < 10240) {
    throw new Error('Download failed or file too small');
  }

  const sizeMB = (fs.statSync(destPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n  ✅ Downloaded: ${sizeMB} MB`);
  return true;
}

// ─── Get next pending URL from queue ─────────────────────────────────────────
async function getNextFromQueue() {
  const item = await prisma.videoQueue.findFirst({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
  });
  return item;
}

// ─── Main download + process + publish flow ───────────────────────────────────
async function processUrl(cdnUrl, isAuto = false) {
  // 1. Mark as processing in queue
  try {
    await prisma.videoQueue.update({
      where: { cdnUrl },
      data: { status: 'processing' },
    });
  } catch {
    // URL may not be in queue (direct --url mode)
  }

  // 2. Download raw video to tmp
  const tmpFile = path.join(TMP_DIR, `vidpipe_raw_${Date.now()}.mp4`);
  try {
    downloadUrl(cdnUrl, tmpFile);
  } catch (err) {
    console.error(`  ❌ Download failed: ${err.message}`);
    await prisma.videoQueue.update({
      where: { cdnUrl },
      data: { status: 'failed', retryCount: { increment: 1 } },
    }).catch(() => {});
    return false;
  }

  // 3. Ask user for metadata (or auto-generate)
  let title, description, category, tags, thumbTime;

  if (isAuto) {
    // Auto mode: derive title from URL filename
    const filename = path.basename(cdnUrl).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    title = filename.charAt(0).toUpperCase() + filename.slice(1) || 'Desi Video';
    description = ''; // publisher.js will auto-generate
    category = 'desi';
    tags = ['desi', 'indian'];
    thumbTime = 5;
    console.log(`\n  🤖 Auto mode: title="${title}", category=${category}`);
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log('\n' + '━'.repeat(60));
    console.log('  📝 VIDEO METADATA — Enter details for SEO');
    console.log('  (Press Enter to use defaults)');
    console.log('━'.repeat(60));

    const urlTitle = path.basename(cdnUrl).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    title = await ask(rl, '  Title', urlTitle || 'Desi Video');
    description = await ask(rl, '  Description (300-500 words, Enter to auto-generate)', '');
    category = await ask(rl, '  Category', 'desi');
    const tagsRaw = await ask(rl, '  Tags (comma-separated)', 'desi,indian');
    thumbTime = parseInt(await ask(rl, '  Thumbnail timestamp (seconds)', '5'), 10);

    rl.close();
    tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  }

  // 4. Determine storage paths
  // Get next available video ID
  const latestVideo = await prisma.video.findFirst({ orderBy: { id: 'desc' } });
  const nextId = (latestVideo?.id ?? 0) + 1;
  const paths = getVideoPath(nextId);
  ensureDir(nextId);

  // 5. Process with FFmpeg
  console.log('\n  🔧 Processing video...');
  const compressed = compressTo240p(tmpFile, paths.videoPath);
  if (!compressed) {
    // If FFmpeg not available (local dev), just copy raw file
    console.log('  ⚠️  FFmpeg not available. Copying raw file instead.');
    fs.copyFileSync(tmpFile, paths.videoPath);
  }

  const thumbed = extractThumbnail(
    compressed ? paths.videoPath : tmpFile,
    paths.thumbPath,
    thumbTime || 5
  );
  if (!thumbed) {
    // Create a blank placeholder if FFmpeg missing
    console.log('  ⚠️  No thumbnail generated (FFmpeg missing). Using placeholder.');
  }

  // 6. Publish to DB
  console.log('\n  💾 Saving to database...');
  await publishVideo({
    title,
    description,
    filePath: paths.videoUrl,
    thumbnail: thumbed ? paths.thumbUrl : '/placeholder.jpg',
    category,
    tags,
    cdnUrl,
  });

  // 7. Cleanup temp file
  try { fs.unlinkSync(tmpFile); } catch {}

  console.log('\n  🎉 Done! Video is now live.\n');
  return true;
}

// ─── Entry point ──────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const urlFlag = args.indexOf('--url');
  const isAuto = args.includes('--auto');

  let cdnUrl = null;

  if (urlFlag !== -1 && args[urlFlag + 1]) {
    cdnUrl = args[urlFlag + 1];
    // Ensure it's in the queue
    await prisma.videoQueue.upsert({
      where: { cdnUrl },
      update: {},
      create: { cdnUrl, status: 'pending' },
    });
  } else {
    const item = await getNextFromQueue();
    if (!item) {
      console.log('📭 No pending items in queue. Add URLs with:');
      console.log('   node pipeline/ingest.js --file urls.txt');
      await prisma.$disconnect();
      return;
    }
    cdnUrl = item.cdnUrl;
    console.log(`\n📌 Processing next in queue [ID ${item.id}]:`);
    console.log(`   ${cdnUrl}`);
  }

  await processUrl(cdnUrl, isAuto);
  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('Fatal error:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
