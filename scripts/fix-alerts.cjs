/**
 * fix-alerts.cjs — Script otomatis fix semua alert() di pages
 * Jalankan: node scripts/fix-alerts.cjs
 */
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../frontend/src/pages');
const notifyImport = `import { notifySuccess, notifyError, notifyWarning } from "../utils/notify";`;

const files = [
  'SEKADMCreatePage.jsx', 'SEKASTCreatePage.jsx', 'SEKHUMCreatePage.jsx',
  'SEKKBJCreatePage.jsx', 'SEKKEUCreatePage.jsx', 'SEKLDSCreatePage.jsx',
  'SEKLKSCreatePage.jsx', 'SEKLKTCreatePage.jsx', 'SEKRENCreatePage.jsx',
  'SEKRMHCreatePage.jsx', 'SekretariatTasksPage.jsx',
  'BDSCPDCreatePage.jsx', 'BDSHRGCreatePage.jsx', 'BDSMONCreatePage.jsx',
  'BKTKBJCreatePage.jsx', 'BKTKRWCreatePage.jsx', 'BKTMEVCreatePage.jsx',
  'BKTPGDCreatePage.jsx', 'ModulePage.jsx',
];

let totalFixed = 0;

for (const fname of files) {
  const fpath = path.join(pagesDir, fname);
  if (!fs.existsSync(fpath)) {
    console.log(`SKIP (not found): ${fname}`);
    continue;
  }

  let content = fs.readFileSync(fpath, 'utf8');

  // Tambahkan import jika belum ada
  if (!content.includes('from "../utils/notify"') && !content.includes("from '../utils/notify'")) {
    if (content.includes('from "../utils/api"')) {
      content = content.replace(
        'import api from "../utils/api";',
        `import api from "../utils/api";\n${notifyImport}`
      );
    } else if (content.includes("from '../utils/api'")) {
      content = content.replace(
        "import api from '../utils/api';",
        `import api from '../utils/api';\n${notifyImport}`
      );
    } else {
      // Tambahkan setelah import pertama
      content = content.replace(/^(import .+;\n)/, `$1${notifyImport}\n`);
    }
  }

  // Hapus duplikat import jika ada lebih dari 1
  const importPattern = /import \{ notifySuccess[^;]+;\n?/g;
  const matches = content.match(importPattern) || [];
  if (matches.length > 1) {
    let first = true;
    content = content.replace(importPattern, (m) => {
      if (first) { first = false; return m; }
      return '';
    });
  }

  // Ganti alert sukses ("✅" atau "✅")
  content = content.replace(/alert\(["'`]✅\s*/g, 'notifySuccess("');
  content = content.replace(/alert\(`✅\s*/g, 'notifySuccess(`');

  // Ganti alert error ("❌" atau "❌")
  content = content.replace(/alert\(["'`]❌\s*/g, 'notifyError("');
  content = content.replace(/alert\(`❌\s*/g, 'notifyError(`');

  // window.alert
  content = content.replace(/window\.alert\(/g, 'notifyError(');

  // Sisa alert( biasa — jadikan notifyWarning
  content = content.replace(/\balert\(/g, 'notifyWarning(');

  fs.writeFileSync(fpath, content, 'utf8');
  console.log(`FIXED: ${fname}`);
  totalFixed++;
}

console.log(`\nSelesai. Total file diproses: ${totalFixed}`);
