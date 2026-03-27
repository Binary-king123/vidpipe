/**
 * MODULE 4 — STORAGE MANAGER
 * Generates deterministic file paths based on video ID.
 * Folder batching: /videos/001/ for IDs 1-999, /videos/002/ for 1000-1999, etc.
 * Videos live at: /root/vidpipe/data/videos/<batch>/<id>.mp4
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const DATA_DIR = process.env.DATA_DIR || '/root/vidpipe/data/videos';

function getBatch(id) {
  const batch = Math.floor((id - 1) / 1000) + 1;
  return String(batch).padStart(3, '0');
}

function getVideoPath(id) {
  const batch = getBatch(id);
  const paddedId = String(id).padStart(6, '0');
  const dir = path.join(DATA_DIR, batch);
  return {
    dir,
    videoPath: path.join(dir, `${paddedId}.mp4`),
    thumbPath: path.join(dir, `${paddedId}.jpg`),
    // Web-accessible paths (served via Nginx /videos/ alias)
    videoUrl: `/videos/${batch}/${paddedId}.mp4`,
    thumbUrl: `/videos/${batch}/${paddedId}.jpg`,
  };
}

function ensureDir(id) {
  const { dir } = getVideoPath(id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  📁 Created directory: ${dir}`);
  }
  return dir;
}

function getDiskUsage() {
  try {
    // Works on Linux/macOS (server-side)
    const output = execSync(`df -h "${DATA_DIR}" 2>/dev/null || echo "N/A"`).toString();
    return output;
  } catch {
    return 'N/A (run on Linux server)';
  }
}

module.exports = { getVideoPath, ensureDir, getDiskUsage, DATA_DIR };
