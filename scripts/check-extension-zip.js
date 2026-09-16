const fs = require('node:fs');
const path = require('node:path');
const AdmZip = require('adm-zip');

const root = path.resolve(__dirname, '..');
const zipPath = path.join(root, 'dist', 'extension.zip');
const maxZipBytes = 10 * 1024 * 1024;
const requiredEntries = [
  'manifest.json',
  'src/background/background.js',
  'src/content/content.css',
  'src/content/content.js',
  'src/options/options.css',
  'src/options/options.html',
  'src/options/options.js',
  'src/popup/popup.html',
  'src/popup/popup.js',
  'src/settings.js',
];

function fail(message) {
  console.error(`browser-extension-starter: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(zipPath)) {
  fail('dist/extension.zip is missing. Run npm run build:chrome first.');
}

const stat = fs.statSync(zipPath);
if (stat.size <= 0) {
  fail('dist/extension.zip is empty.');
}
if (stat.size > maxZipBytes) {
  fail(`dist/extension.zip is ${(stat.size / 1024 / 1024).toFixed(2)} MB; expected <= 10 MB.`);
}

let entries;
try {
  const zip = new AdmZip(zipPath);
  if (!zip.test()) fail('dist/extension.zip failed its integrity check.');
  entries = new Set(zip.getEntries().map((entry) => entry.entryName));
} catch (error) {
  fail(`could not inspect dist/extension.zip: ${error.message}`);
}

for (const entry of requiredEntries) {
  if (!entries.has(entry)) {
    fail(`dist/extension.zip is missing required entry: ${entry}`);
  }
}

console.log(`extension zip looks good (${stat.size} bytes, ${entries.size} entries).`);
