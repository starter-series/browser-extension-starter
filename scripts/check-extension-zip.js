const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

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

const listed = spawnSync('unzip', ['-Z1', zipPath], {
  cwd: root,
  encoding: 'utf8',
});

if (listed.status !== 0) {
  process.stderr.write(listed.stderr || listed.stdout);
  fail('could not inspect dist/extension.zip; install unzip or verify the archive manually.');
}

const entries = new Set(listed.stdout.split(/\r?\n/).filter(Boolean));
for (const entry of requiredEntries) {
  if (!entries.has(entry)) {
    fail(`dist/extension.zip is missing required entry: ${entry}`);
  }
}

console.log(`extension zip looks good (${stat.size} bytes, ${entries.size} entries).`);
