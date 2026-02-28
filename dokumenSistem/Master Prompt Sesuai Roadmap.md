Berikut saya susun PROMPT SIAP PAKAI BERDASARKAN ROADMAP 3 TAHAP PERSIAPAN AUDIT FORMAL PEMERINTAH.

Struktur ini bertahap, supaya:

Tidak langsung overwhelm tim

Bisa dinaikkan levelnya progresif

Bisa dipakai berulang (iteratif)

Semua output diminta dalam Bahasa Indonesia formal audit.

🏛 TAHAP 1 — PROMPT HARDENING FUNDAMENTAL (0–30 HARI)

🎯 Tujuan: Tutup temuan KRITIS sebelum audit formal.

Gunakan ini terlebih dahulu.

🔴 PROMPT TAHAP 1 – HARDENING DASAR
MODE: GOVERNMENT PRE-AUDIT HARDENING – PHASE 1
BAHASA: INDONESIA FORMAL AUDIT
ZERO ASSUMPTION
EVIDENCE-BASED ONLY

TUJUAN:
Menutup risiko KRITIS sebelum audit formal pemerintah.
Fokus pada:

1. RBAC Universal
2. Master Data Integrity
3. Audit Trail Completeness
4. Foreign Key Enforcement

====================================================
LANGKAH WAJIB
====================================================

1. Parse seluruh backend/routes
   - Pastikan semua route menggunakan middleware protect
   - Identifikasi route tanpa authorizeByRole
   - Tandai sebagai KRITIS jika tidak ada proteksi

2. Scan seluruh controller
   - Deteksi if (user.role === ...)
   - Deteksi hardcoded role string
   - Deteksi logic bypass permission
   - Tandai sebagai KRITIS

3. Scan seluruh model/schema
   - Identifikasi field STRING yang mereferensikan entitas relasional
   - Validasi foreign key
   - Tandai STRING relasional sebagai KRITIS

4. Scan seluruh frontend
   - Hardcoded role check
   - Input manual untuk entitas relasional
   - Dropdown tidak ambil dari master-data

5. Audit Trail Validation
   - Pastikan log mencatat:
     user_id
     entity_id
     entity_type
     action
     timestamp
     before_value
     after_value
   - Jika salah satu tidak ada → KRITIS

====================================================
FORMAT OUTPUT
====================================================

1. Ringkasan Eksekutif
2. Daftar Temuan KRITIS
3. Daftar Temuan TINGGI
4. Matriks RBAC
5. Matriks Foreign Key
6. Matriks Audit Trail
7. Skor Hardening Phase 1 (0–100%)
8. Patch Proposal Detail per File
   🏛 TAHAP 2 — PROMPT GOVERNANCE & CONTROL MATURITY (1–3 BULAN)

🎯 Tujuan: Siap Inspektorat / BPK level menengah.

🟠 PROMPT TAHAP 2 – GOVERNANCE MATURITY
MODE: GOVERNMENT PRE-AUDIT GOVERNANCE – PHASE 2
BAHASA: INDONESIA FORMAL AUDIT
EVIDENCE-BASED ANALYSIS

TUJUAN:
Meningkatkan kesiapan tata kelola sistem untuk:

- Inspektorat
- Audit internal
- SPBE dasar

====================================================
VALIDASI WAJIB
====================================================

1. Segregation of Duties
   - Identifikasi role pembuat transaksi
   - Identifikasi role approver
   - Pastikan tidak overlap
   - Jika overlap → TEMUAN KRITIS

2. Role-to-Module Mapping
   - Pastikan mapping via config terpusat
   - Tidak ada hardcoded di frontend/backend

3. Zero Trust Enforcement
   - Semua endpoint deny-by-default?
   - Token expiry?
   - Middleware global enforcement?

4. Evidence Readiness
   - Sistem bisa generate laporan audit?
   - Log bisa difilter per user/per modul?

5. Master Data Governance
   - Single source of truth?
   - Tidak ada duplikasi di mock/seed/frontend?

====================================================
FORMAT OUTPUT
====================================================

1. Ringkasan Tata Kelola
2. Matriks Segregation of Duties
3. Matriks Role-Module Compliance
4. Zero Trust Score
5. Evidence Readiness Score
6. Governance Compliance Score (0–100%)
7. Rekomendasi Perbaikan Terstruktur
   🏛 TAHAP 3 — PROMPT ENTERPRISE GOVERNMENT READINESS (3–12 BULAN)

🎯 Tujuan: Siap SPBE Tinggi & Audit BPK.

🟢 PROMPT TAHAP 3 – ULTRA GOVERNMENT READINESS
MODE: GOVERNMENT ENTERPRISE READINESS – PHASE 3
BAHASA: INDONESIA FORMAL AUDIT
STANDAR: SPBE + ISO 27001 AWARENESS + ZERO TRUST

TUJUAN:
Menilai kesiapan sistem untuk audit formal pemerintah dan peningkatan indeks SPBE.

====================================================
AREA AUDIT
====================================================

1. Kepatuhan SPBE
   - Interoperabilitas
   - Standarisasi API
   - Tata kelola data
   - Integrasi lintas OPD

2. ISO 27001 Awareness
   - Access Control
   - Logging & Monitoring
   - Secure Development
   - Risk Mitigation

3. Zero Trust Architecture
   - Never Trust, Always Verify
   - Micro-segmentation
   - Continuous validation

4. CI/CD Governance
   - Environment separation
   - Secret management
   - Dependency awareness
   - Migration versioning

5. Production Readiness
   - Pagination
   - Indexing
   - Error handling
   - Backup awareness
   - Monitoring readiness

====================================================
FORMAT OUTPUT WAJIB
====================================================

1. Ringkasan Eksekutif Enterprise
2. Skor Kepatuhan SPBE
3. Matriks Risiko ISO 27001
4. Skor Zero Trust
5. Skor CI/CD Governance
6. Skor Production Readiness
7. Temuan KRITIS
8. Roadmap Transformasi 12 Bulan
9. Skor Final Kesiapan Audit Pemerintah
   🎯 Cara Menggunakan Roadmap Ini

Urutannya:

1️⃣ Jalankan PROMPT TAHAP 1
→ Tutup semua temuan KRITIS

2️⃣ Jalankan PROMPT TAHAP 2
→ Pastikan Governance ≥ 80%

3️⃣ Jalankan PROMPT TAHAP 3
→ Target skor final ≥ 85%

📊 Target Ideal Sebelum Audit Formal
Area Target Minimum
RBAC 100% enforced
Master Data 100% FK
Audit Trail 100% lengkap
Governance ≥ 85%
Zero Trust ≥ 80%
SPBE readiness ≥ 80%
