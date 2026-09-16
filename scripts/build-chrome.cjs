const fs = require('node:fs');
const path = require('node:path');
const AdmZip = require('adm-zip');

const root = path.resolve(__dirname, '..');
const zip = new AdmZip();

function add(relative) {
  const absolute = path.join(root, relative);
  if (path.basename(relative) === '.DS_Store') return;
  const stat = fs.lstatSync(absolute);
  if (stat.isSymbolicLink()) throw new Error(`Refusing to package symlink: ${relative}`);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(absolute).sort()) add(`${relative}/${name}`);
  } else {
    zip.addFile(relative, fs.readFileSync(absolute));
  }
}

for (const entry of ['manifest.json', 'src', 'assets/icons']) add(entry);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
zip.writeZip(path.join(root, 'dist', 'extension.zip'));
