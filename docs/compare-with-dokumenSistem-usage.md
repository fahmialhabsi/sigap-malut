# Panduan Penggunaan Compliance Checker: compare-with-dokumenSistem

## 1. Instalasi Dependensi

Pastikan Node.js dan npm sudah terpasang. Jalankan perintah berikut di root project:

```
npm install
```

## 2. Menjalankan Checker & Membaca Hasil

Jalankan checker dengan perintah:

```
npx ts-node scripts/compare-with-dokumenSistem.ts --docs ./sigap-malut/dokumenSistem --out ./reports/report.json --format json --verbose
```

Atau, jika sudah dikompilasi:

```
node dist/compare-with-dokumenSistem.js --docs ./sigap-malut/dokumenSistem --out ./reports/report.json --format json --verbose
```

Hasil audit akan tersimpan di `reports/report.json`.

## 3. Contoh Output JSON

```json
{
  "summary": {
    "total": 1,
    "ok": 1,
    "warning": 0,
    "fail": 0,
    "heuristic": 0,
    "compliance": 1
  },
  "results": [
    {
      "requirement": {
        "id": "perm-workflow-read",
        "docFile": "...",
        "section": "RBAC",
        "type": "permission",
        "name": "workflow:read"
      },
      "status": "OK",
      "evidence": [
        {
          "file": "backend/middleware/workflowRbac.mjs",
          "line": 13,
          "snippet": "read: \"workflow:read\"",
          "confidence": 1
        }
      ],
      "recommendation": "Sudah ada implementasi permission workflow:read",
      "severity": "info"
    }
  ]
}
```

## 4. Checklist Compliance Manual

- [ ] Semua requirement blueprint sudah terdeteksi di hasil audit?
- [ ] Evidence di codebase sesuai dengan requirement?
- [ ] Tidak ada status FAIL/HEURISTIC pada requirement penting?
- [ ] Saran perbaikan (fix-suggestions) sudah ditindaklanjuti?

## 5. Troubleshooting & Tips Mapping

- Jika checker tidak menemukan requirement, pastikan format dokumenSistem konsisten (gunakan YAML front-matter, bullet, atau tabel).
- Jika error ESM/CJS, jalankan dengan ts-node atau pastikan tsconfig.json "module": "ESNext".
- Untuk mapping manual, gunakan fitur verbose untuk melihat log detail.
- Jika ingin menambah matcher, modifikasi fungsi extractRequirementsFromMarkdown atau scanCodebaseForRequirement.

---

Untuk pertanyaan lebih lanjut, cek README atau hubungi maintainer.
