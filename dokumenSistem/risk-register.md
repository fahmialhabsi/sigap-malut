# Risk Register — SIGAP-MALUT Go-Live

**Tanggal:** 2026-04-05  
**Branch:** `audit/go-live-remediation`

---

## Skema Penilaian

| Kemungkinan | Nilai |
|-------------|-------|
| Sangat Tinggi | 5 |
| Tinggi | 4 |
| Sedang | 3 |
| Rendah | 2 |
| Sangat Rendah | 1 |

| Dampak | Nilai |
|--------|-------|
| Kritis (sistem down / data corrupt) | 5 |
| Tinggi (fitur utama tidak berjalan) | 4 |
| Sedang (fitur tidak kritis terganggu) | 3 |
| Rendah (estetika/UX minor) | 2 |
| Sangat Rendah | 1 |

**Risk Score = Kemungkinan × Dampak**

---

## Tabel Risiko

| ID | Risiko | Kemungkinan | Dampak | Score | Status | Mitigasi |
|----|--------|-------------|--------|-------|--------|----------|
| R-01 | UserHierarchy kosong → form delegasi memakai fallback unit_kerja yang tidak akurat | 4 | 3 | **12** 🔴 | Aktif | Isi data hierarki di DB sebelum rollout; admin diwajibkan input data struktur organisasi |
| R-02 | CI/CD tidak ada → perubahan code lolos tanpa test | 4 | 4 | **16** 🔴 | Aktif | Lakukan code review manual tiap PR; setup GitHub Actions dalam 2 minggu (BL-010) |
| R-03 | openapi.yaml tidak sinkron → integrasi tools eksternal gagal | 3 | 3 | **9** 🟡 | Aktif | Update openapi.yaml sebelum rollout ke unit lain (BL-013/BL-016) |
| R-04 | Duplikasi validasi submit (2 controller) → jika salah satu diubah, celah muncul kembali | 2 | 4 | **8** 🟡 | Aktif | Extract ke shared utility (BL-015); sampai itu, pastikan kedua controller diubah bersamaan |
| R-05 | MFA belum terverifikasi flow → akun role tinggi rentan jika password bocor | 3 | 4 | **12** 🔴 | Aktif | Verifikasi MFA flow sebelum rollout Sekretaris/Kadis/Gubernur (BL-012) |
| R-06 | Backup & restore belum pernah diuji → jika terjadi data loss, recovery tidak tervalidasi | 2 | 5 | **10** 🟡 | Aktif | Jalankan drill restore dari backup DB dalam lingkungan staging sebelum produksi |
| R-07 | MapLayerPanel memakai data statis → peta pangan tidak akurat untuk keputusan kebijakan | 3 | 3 | **9** 🟡 | Aktif | Sembunyikan atau beri label jelas "Data Contoh" sampai integrasi master data selesai (BL-014) |
| R-08 | Substitusi tugas tidak ada di model DB → pegawai berhalangan tidak bisa dialihkan tugasnya | 2 | 3 | **6** 🟢 | Aktif | Gunakan workaround manual (admin re-assign) sampai BL-003 selesai |
| R-09 | Rate limiter diset terlalu ketat → pengguna valid terkena 429 saat aktivitas tinggi | 2 | 3 | **6** 🟢 | Aktif | Monitor rate limit hits di produksi; naikkan threshold jika diperlukan setelah observasi 1 minggu |
| R-10 | Dokumen duplikat → developer baru implementasi fitur berdasarkan spesifikasi lama | 3 | 3 | **9** 🟡 | Aktif | Tambahkan header DEPRECATED ke versi lama sebelum developer baru bergabung (BL-004) |

---

## Risiko CLOSED (dari audit/remediasi sebelumnya)

| ID | Risiko | Status |
|----|--------|--------|
| R-bypass-submit | Pelaksana bypass validasi submit → KPI data tidak valid | ✅ CLOSED (BL-002) |
| R-brute-force | Brute force attack pada endpoint auth | ✅ CLOSED (BL-011) |
| R-verified-stall | Tugas verified tidak pernah diproses Sekretaris → workflow macet | ✅ CLOSED (BL-001) |
| R-label-pelaksana | Label "Pelaksana Teknis UPTD" muncul untuk Pelaksana Sekretariat | ✅ CLOSED |

---

## Prioritas Penanganan

### Immediate (sebelum pilot)
1. **R-01** — Isi `UserHierarchy` data
2. **R-05** — Verifikasi MFA flow untuk role eksekutif

### Short-term (2 minggu)
3. **R-02** — Setup CI/CD pipeline
4. **R-04** — Refactor submit validation ke shared utility

### Medium-term (1 bulan)
5. **R-03**, **R-07**, **R-10** — OpenAPI sync, peta label data contoh, deprecated dokumen lama
