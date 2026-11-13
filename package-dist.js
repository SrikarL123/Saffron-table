/**
 * The Saffron Table - Distributable Packaging Script
 * Generates a clean saffron-table-site-dist.zip excluding node_modules, .env, and logs.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const DIST_ZIP = path.join(ROOT_DIR, 'saffron-table-site-dist.zip');
const STAGING_DIR = path.join(ROOT_DIR, '.dist_staging');

console.log('Starting clean project packaging...');

// Remove existing artifacts
if (fs.existsSync(DIST_ZIP)) fs.unlinkSync(DIST_ZIP);
if (fs.existsSync(STAGING_DIR)) fs.rmSync(STAGING_DIR, { recursive: true, force: true });

fs.mkdirSync(STAGING_DIR, { recursive: true });

function copyRecursive(src, dest, excludeNames = []) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    const baseName = path.basename(src);
    if (excludeNames.includes(baseName)) return;

    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    for (const item of items) {
      if (excludeNames.includes(item)) continue;
      copyRecursive(path.join(src, item), path.join(dest, item), excludeNames);
    }
  } else {
    const baseName = path.basename(src);
    if (excludeNames.includes(baseName)) return;
    fs.copyFileSync(src, dest);
  }
}

// Items to include
const itemsToInclude = [
  'assets',
  'backend',
  'tests',
  'index.html',
  'restaurant-data.js',
  'IMAGE_SOURCES.md',
  'robots.txt',
  'sitemap.xml',
  '.gitignore',
  'package-dist.js'
];

// Items to exclude
const exclusions = [
  'node_modules',
  '.env',
  '.env.local',
  'saffron-table-site-dist.zip',
  '.dist_staging'
];

for (const item of itemsToInclude) {
  const srcPath = path.join(ROOT_DIR, item);
  const destPath = path.join(STAGING_DIR, item);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath, exclusions);
  }
}

// Sanity checks
assertItem(path.join(STAGING_DIR, 'backend', 'package.json'), 'package.json preserved');
assertItem(path.join(STAGING_DIR, 'backend', 'package-lock.json'), 'package-lock.json preserved');
assertItem(path.join(STAGING_DIR, 'backend', '.env.example'), 'backend/.env.example preserved');
assertExcluded(path.join(STAGING_DIR, 'backend', 'node_modules'), 'backend/node_modules excluded');
assertExcluded(path.join(STAGING_DIR, 'backend', '.env'), 'backend/.env excluded');

function assertItem(p, desc) {
  if (!fs.existsSync(p)) {
    console.error(`[ERROR] Staging verification failed: ${desc} not found at ${p}`);
    process.exit(1);
  }
}

function assertExcluded(p, desc) {
  if (fs.existsSync(p)) {
    console.error(`[ERROR] Staging verification failed: ${desc} should not exist at ${p}`);
    process.exit(1);
  }
}

// Compress using .NET ZipFile
try {
  const cleanStaging = STAGING_DIR.replace(/\\/g, '/');
  const cleanZip = DIST_ZIP.replace(/\\/g, '/');
  execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${cleanStaging}', '${cleanZip}')"`);
  console.log('Successfully created:', DIST_ZIP);
  console.log('Package contents verified:');
  console.log('  - node_modules excluded');
  console.log('  - backend/.env excluded (backend/.env.example preserved)');
  console.log('  - package.json & package-lock.json preserved');
} catch (err) {
  console.error('Compression failed:', err.message);
  process.exit(1);
} finally {
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}
