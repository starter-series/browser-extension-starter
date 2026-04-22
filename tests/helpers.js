const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// Permissions the extension is allowed to declare. Keep this list minimal —
// every addition widens the attack surface and triggers extra store review.
const ALLOWED_PERMISSIONS = Object.freeze([
  'storage',
  'activeTab',
  'alarms',
  'notifications',
]);

function readSrc(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

module.exports = { root, manifest, pkg, ALLOWED_PERMISSIONS, readSrc, exists };
