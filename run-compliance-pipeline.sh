#!/bin/bash

# 1. Compile TypeScript
npx tsc

# 2. Jalankan audit compliance
node dist/scripts/compare-with-dokumenSistem.js --docs ./sigap-malut/dokumenSistem --out ./reports/report.json --format json --verbose

# 3. Generate fix suggestions
node dist/scripts/generate-fix-suggestions.js --report ./reports/report.json --out ./reports/fix-suggestions.json --format json --verbose

# 4. Jalankan auto-fix (simulasi)
echo "Simulasi auto-fix (tanpa perubahan file):"
node dist/scripts/auto-fix.js --suggestions ./reports/fix-suggestions.json --dry-run --verbose

# 5. Jalankan auto-fix (update file CSV)
echo "Auto-fix nyata (update file CSV):"
node dist/scripts/auto-fix.js --suggestions ./reports/fix-suggestions.json --verbose

# 6. Selesai
echo "Pipeline compliance selesai. Cek reports/report.json dan reports/fix-suggestions.json."
