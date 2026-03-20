MODE: ULTRA GOVERNMENT FORENSIC COMPLIANCE
LANGUAGE: INDONESIA ONLY
ZERO ASSUMPTION POLICY
EVIDENCE-BASED ANALYSIS
EXTERNAL AUDIT READY OUTPUT

TUJUAN:
Melakukan audit forensik sistem secara menyeluruh dengan standar:

1. SPBE (Sistem Pemerintahan Berbasis Elektronik)
2. ISO 27001 (Information Security Awareness)
3. Tata Kelola TI Pemerintah
4. Audit BPK / Inspektorat
5. Zero Trust Security Model
6. CI/CD Governance Compliance
7. Production Readiness Pemerintah

====================================================
FASE 1 — FORENSIC DISCOVERY TOTAL
====================================================

- Scan seluruh struktur folder
- Identifikasi:
  - File yatim (orphan file)
  - Duplikasi master data
  - Hardcoded config
  - Dev artifact di production
  - File sensitif terbuka (.env, key, credential)
  - Library tidak digunakan

Output:
Laporan Integritas Struktur Sistem

====================================================
FASE 2 — VALIDASI KEPATUHAN SPBE
====================================================

Audit terhadap prinsip SPBE:

1. Integrasi Layanan
   - Apakah sistem modular?
   - Apakah interoperable?
   - Apakah ada API standardisasi?

2. Tata Kelola Data
   - Single Source of Truth?
   - Tidak ada redundansi?
   - Master data terkendali?

3. Keamanan Informasi
   - Autentikasi
   - Otorisasi
   - Logging
   - Audit trail

4. Layanan Publik Digital
   - SLA readiness
   - Reliability
   - Scalability

Output:
Matriks Kepatuhan SPBE:
| Domain SPBE | Status | Bukti File | Risiko | Rekomendasi |

====================================================
FASE 3 — ISO 27001 AWARENESS CHECK
====================================================

Validasi kontrol berikut:

A. Access Control

- Role-based access control valid?
- Least privilege?
- Deny by default?

B. Cryptography

- Password hashing method?
- Token expiry?
- HTTPS enforcement?

C. Logging & Monitoring

- Apakah audit log lengkap?
- Log tidak bisa dimodifikasi?

D. Secure Development

- Input validation?
- Sanitization?
- Injection prevention?

Output:
Matriks Risiko ISO 27001 (LOW/MEDIUM/HIGH/CRITICAL)

====================================================
FASE 4 — ALIGNMENT BPK / INSPEKTORAT
====================================================

Validasi:

1. Akuntabilitas Transaksi
   - Semua create/update/delete tercatat?
   - Ada jejak sebelum & sesudah perubahan?

2. Integritas Data Keuangan
   - Foreign key valid?
   - Tidak ada text bebas untuk referensi entitas?

3. Pemisahan Tugas (Segregation of Duties)
   - Apakah role saling mengawasi?
   - Tidak ada role super tanpa batas?

4. Evidence Readiness
   - Sistem bisa menghasilkan laporan audit?
   - Data bisa ditelusuri per user?

Output:
Matriks Kesiapan Audit Eksternal

====================================================
FASE 5 — CI/CD GOVERNANCE VALIDATION
====================================================

Periksa:

- Apakah ada environment separation (dev/staging/prod)?
- Hardcoded credential?
- Versioning strategy?
- Migration management?
- Build optimization?
- Dependency vulnerability awareness?

Output:
Skor Kesiapan DevOps Pemerintah (0–100%)

====================================================
FASE 6 — ZERO TRUST ARCHITECTURE AUDIT
====================================================

Validasi prinsip:

1. Never Trust, Always Verify
   - Semua endpoint protected?
   - Tidak ada implicit trust?

2. Micro-Segmentation
   - Middleware universal?
   - Tidak ada bypass logic?

3. Continuous Verification
   - Token expiry?
   - Session validation?

4. Least Privilege Enforcement
   - Role granular?
   - Tidak ada hardcoded admin bypass?

Output:
Zero Trust Compliance Score

====================================================
FASE 7 — FORENSIC SECURITY CHECK (OWASP)
====================================================

- SQL/NoSQL Injection
- XSS
- CSRF
- CORS misconfiguration
- Rate limiting
- File upload validation
- Error leakage
- Stack trace exposure

Output:
Security Severity Matrix

====================================================
FASE 8 — PRODUCTION READINESS PEMERINTAH
====================================================

- Pagination?
- Indexing?
- Logging strategy?
- Backup strategy?
- Disaster recovery awareness?
- Monitoring readiness?

Output:
Production Readiness Score

====================================================
FORMAT LAPORAN WAJIB
====================================================

1. Ringkasan Eksekutif
2. Skor Kepatuhan Keseluruhan (0–100%)
3. Temuan KRITIS (Blocking Issue)
4. Temuan Risiko Tinggi
5. Temuan Risiko Sedang
6. Temuan Risiko Rendah
7. Matriks Kepatuhan SPBE
8. Matriks Risiko ISO 27001
9. Kesiapan Audit BPK/Inspektorat
10. Skor Zero Trust
11. Skor CI/CD Governance
12. Skor Production Readiness
13. Dampak Bisnis & Tata Kelola
14. Roadmap Perbaikan 3 Fase:
    - Fase Darurat (0–30 hari)
    - Fase Stabilisasi (1–3 bulan)
    - Fase Transformasi (3–12 bulan)
15. Patch Teknis Detail:
    - Path file
    - Cuplikan kode bermasalah
    - Kode pengganti
    - Perubahan arsitektur bila perlu

====================================================
ATURAN KETAT
====================================================

- Tidak boleh asumsi
- Semua temuan wajib berbasis file nyata
- Jika tidak dapat diakses → tandai BLOCKER
- Tidak boleh ada jawaban generik
- Bahasa Indonesia formal audit

TUJUAN AKHIR:
Menghasilkan laporan setara audit TI eksternal pemerintah.
