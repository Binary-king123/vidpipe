/**
 * MODULE 3 — VIDEO PROCESSOR (FFmpeg)
 * Compresses video to 240p and extracts thumbnail at a given timestamp.
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Check if FFmpeg is available
 */
function checkFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    console.error('❌ FFmpeg not found. Install with: apt install ffmpeg');
    return false;
  }
}

/**
 * Compress video to 240p MP4
 * @param {string} inputPath - Raw downloaded video path
 * @param {string} outputPath - Destination compressed video path
 * @returns {boolean} success
 */
function compressTo240p(inputPath, outputPath) {
  if (!checkFfmpeg()) return false;

  console.log(`  🎬 Compressing to 240p: ${path.basename(inputPath)}`);
  console.log(`     → ${outputPath}`);

  const result = spawnSync('ffmpeg', [
    '-i', inputPath,
    '-vf', 'scale=426:240',
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '64k',
    '-movflags', '+faststart', // Enables web streaming / seeking
    '-y',                       // Overwrite output
    outputPath,
  ], { stdio: 'inherit' });

  if (result.status !== 0) {
    console.error('  ❌ FFmpeg compression failed');
    return false;
  }

  const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`  ✅ Compressed: ${sizeMB} MB`);
  return true;
}

/**
 * Extract thumbnail frame at a specific timestamp
 * @param {string} videoPath - Source video path
 * @param {string} thumbPath - Output thumbnail path
 * @param {number} timeSeconds - Timestamp in seconds
 * @returns {boolean} success
 */
function extractThumbnail(videoPath, thumbPath, timeSeconds = 5) {
  if (!checkFfmpeg()) return false;

  console.log(`  🖼️  Extracting thumbnail at ${timeSeconds}s`);

  const result = spawnSync('ffmpeg', [
    '-i', videoPath,
    '-ss', String(timeSeconds),
    '-vframes', '1',
    '-q:v', '2',
    '-y',
    thumbPath,
  ], { stdio: 'inherit' });

  if (result.status !== 0) {
    console.error('  ❌ Thumbnail extraction failed');
    return false;
  }

  console.log(`  ✅ Thumbnail saved: ${thumbPath}`);
  return true;
}

module.exports = { compressTo240p, extractThumbnail, checkFfmpeg };
