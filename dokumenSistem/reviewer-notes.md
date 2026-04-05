# Reviewer Notes — audit/pilot-hardening-release

**Untuk:** Code Reviewer / PR Approver  
**Tanggal:** 2026-04-05  
**Branch:** `audit/pilot-hardening-release`  
**Base branch:** `main` (atau `feat/next-change` jika belum di-merge ke main)

---

## Urutan Review yang Disarankan

Review commit dari yang paling lama ke yang paling baru:

### 1. `d0562d1` — audit(dokumenSistem)
**Fokus:** Penambahan dokumen audit + kpi + management summary + dev-backlog  
**Yang perlu dicek:** Apakah dokumen audit mencerminkan kondisi sistem secara akurat  
**File utama:** `dokumenSistem/audit-report.md`, `dev-backlog.md`, `kpi-score.md`  
**Risiko review:** Rendah — hanya dokumen markdown

### 2. `a0fefe5` — fix(security+workflow): BL-001/002/011
**Fokus:** 3 fix kritikal — INI COMMIT PALING PENTING  
**Yang perlu dicek:**
- `backend/controllers/taskController.js`: Pastikan `OUTPUT_TOO_SHORT` dan `URL_REQUIRED` guards tidak bisa di-bypass
- `backend/server.js`: Pastikan `authLimiter`, `submitLimiter` dikonfigurasi dengan nilai prod yang masuk akal
- `backend/controllers/sekretaris/tugasVerifiedController.js`: Pastikan hanya role sekretaris/super_admin yang bisa akses
- `backend/routes/sekretaris/sekretarisIndex.js`: Pastikan route terdaftar dengan middleware yang benar
- `frontend/src/components/sekretaris/ReviewTugasVerifiedPanel.jsx`: Review UX + decision modal
- `frontend/src/ui/dashboards/DashboardSekretariat.jsx`: Review integrasi panel + badge count

**Quick verification:**
```bash
grep "OUTPUT_TOO_SHORT" backend/controllers/taskController.js
grep "authLimiter" backend/server.js
grep "tugas-terverifikasi" backend/routes/sekretaris/sekretarisIndex.js
```

### 3. `3054e3c` — hardening(pilot): CI + OpenAPI + verification
**Fokus:** Release engineering artifacts  
**Yang perlu dicek:**
- `.github/workflows/p0p1-regression-guard.yml`: Apakah static-check dan inline node tests valid?
- `backend/scripts/verify-pilot-readiness.mjs`: Apakah test coverage cukup untuk pilot?
- `dokumenSistem/openapi.yaml` (akhir file): 6 endpoint baru — apakah schema akurat?
- `backend/server.js`: Perubahan `trust proxy` — apakah kondisinya benar?

**Catatan khusus:** `trust proxy` dikonfigurasi kondisional:
```javascript
if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
```
Reviewer perlu verifikasi bahwa deployment menggunakan variabel yang benar.

### 4. `1296fbf` — rename(docs): dokumenSistem renumbering
**Fokus:** Dokumen rename/renumber oleh user  
**Yang perlu dicek:**
- Ini adalah renumbering sah yang dilakukan oleh user — **BUKAN** perubahan code
- Git sudah mendeteksi rename otomatis (similarity 73–100%)
- Reviewer tidak perlu mereview isi setiap dokumen — cukup scan bahwa rename masuk akal
- **Perhatian:** `68-README.md` = rename + content update (similarity 73%). Cek jika ada yang hilang

**Quick scan:**
```bash
git show --stat 1296fbf | grep "rename\|delete\|create"
```

### 5. `4d63265` — chore(release): pre-merge hygiene docs
**Fokus:** Dokumentasi release hygiene — hanya markdown  
**Yang perlu dicek:** Konsistensi laporan dengan kondisi aktual repo  
**Risiko review:** Sangat rendah — tidak ada perubahan code

---

## Titik Fokus Reviewer

### 🔴 KRITIKAL — Harus diverifikasi
1. **Rate limit values prod**: `authLimiter` max 20/15min, `submitLimiter` max 10/min — apakah cukup?
2. **sekretarisGuard middleware**: Apakah terpasang di route `tugas-terverifikasi`?
3. **State machine guard**: `POST /tasks/:id/submit` — apakah status `in_progress` wajib dicek sebelum validasi konten?

### 🟡 PENTING — Perlu diperhatikan
4. **CORS origin**: Konfigurasi di `server.js` — apakah origin list sudah sesuai untuk staging pilot?
5. **OpenAPI 6 endpoint baru**: Apakah response schema akurat (terutama pagination untuk `tugas-terverifikasi`)?
6. **verify-pilot-readiness.mjs**: Test SKIP jika tidak ada token — apakah coverage cukup tanpa live server?

### 🟢 INFORMASI — Untuk pemahaman konteks
7. **Stash@{0}**: Branch ini punya stash isolasi feat/next-change. Stash bukan bagian PR. Lihat `stash-restoration-plan.md`.
8. **SVG files di 1296fbf**: 9 file SVG diagram organisasi — bukan binary code, ini diagram arsitektur sah
9. **Pilot conditions**: Merge branch ≠ pilot siap. Lihat `pilot-readiness-checklist.md` untuk syarat operasional pilot.

---

## Catatan Operasional Sebelum Pilot (bukan blocker merge)

| # | Item | Deadline | Owner |
|---|------|----------|-------|
| 1 | Isi `UserHierarchy` unit Sekretariat di DB | 2026-04-08 | Admin/DBA |
| 2 | Akun pilot aktif di staging | 2026-04-08 | Admin |
| 3 | `npm run verify:pilot` PASS di staging | 2026-04-09 | DevOps |
| 4 | `TRUST_PROXY=1` dan `NODE_ENV=production` dikonfigurasi | 2026-04-10 | DevOps |
| 5 | MFA flow diverifikasi | 2026-04-10 | Backend |

Ini bukan blocker merge. Hanya syarat operasional sebelum pilot aktif.

---

## Pertanyaan yang Tidak Perlu Diajukan oleh Reviewer

- "Kenapa ada file 39–68?" → Lihat `rename-reconciliation-report.md`
- "Kenapa ada `stash@{0}`?" → Lihat `stash-restoration-plan.md`  
- "Apakah sistem siap pilot?" → Lihat `pilot-readiness-checklist.md`
- "Apakah sistem siap produksi?" → Belum. Lihat `updated-dev-backlog-v2.2.md`
