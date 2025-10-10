// Copies root-level icons/ into public/icons/ so Vite serves them in dev and includes them in build.
// Safe to run multiple times.
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'icons');
const DEST_DIR = path.resolve(__dirname, '..', 'public', 'icons');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (!fs.existsSync(SRC)) {
    console.log('[copy-icons] Skipping: no icons/ folder found');
    process.exit(0);
  }
  fs.mkdirSync(DEST_DIR, { recursive: true });
  copyRecursiveSync(SRC, DEST_DIR);
  console.log('[copy-icons] Copied icons/ -> public/icons/');
} catch (err) {
  console.warn('[copy-icons] Warning:', err && err.message ? err.message : err);
  // Do not fail the build/dev; just warn.
}
