# 20 - Testing Strategy SIGAP-MALUT

Versi: 2026-03-21
Status: Quality gate resmi sebelum staging dan produksi

## 1. Tujuan

Menetapkan strategi pengujian terpadu untuk SIGAP-MALUT dan integrasi e-Pelara agar:

1. kualitas fitur terjaga,
2. regresi dapat dicegah,
3. kontrak integrasi stabil,
4. risiko gangguan produksi menurun,
5. evidence audit pengujian tersedia.

## 2. Ruang Lingkup

Strategi ini mencakup:

- backend API SIGAP-MALUT,
- frontend SIGAP-MALUT,
- integrasi layanan e-Pelara,
- database migration,
- workflow approval lintas role,
- modul perencanaan (domain prioritas),
- keamanan, performa, dan reliability.

## 3. Prinsip Pengujian

1. Risk-based testing: area berisiko tinggi diuji lebih dalam.
2. Shift-left testing: test dimulai sejak tahap pengembangan.
3. Automation-first: test berulang wajib diotomasi.
4. Contract-aware integration: payload dan endpoint lintas layanan wajib tervalidasi.
5. Evidence-driven: setiap gate harus punya bukti lulus/gagal.

## 4. Test Pyramid dan Target Coverage

Komposisi minimum:

- Unit test: 60%
- Integration test: 25%
- End-to-end test: 15%

Target coverage minimum:

- Backend overall: >= 80%
- Frontend critical module: >= 70%
- Modul perencanaan: >= 85%
- Workflow approval kritis: >= 90% scenario pass

Catatan:

- Coverage tinggi tidak menggantikan kualitas skenario.
- Domain kritis harus lulus skenario bisnis utama meski coverage angka tercapai.

## 5. Jenis Pengujian Wajib

### 5.1 Unit Test

Fokus:

- service function,
- utility function,
- validation,
- mapper/transformer,
- reducer/store logic.

Kriteria lulus:

- semua test pass,
- tidak ada flaky test,
- coverage sesuai target.

### 5.2 Integration Test

Fokus:

- controller dan middleware,
- auth dan RBAC,
- workflow submit/verify/approve/reject/finalize,
- integrasi DB (query, constraint, transaction),
- integrasi e-Pelara via API client.

Kriteria lulus:

- endpoint prioritas memberikan status code dan payload sesuai kontrak,
- permission check berjalan sesuai role,
- rollback/handling error sesuai desain.

### 5.3 End-to-End (E2E) Test

Fokus lintas UI -> API -> DB:

- login dan otorisasi role utama,
- proses perencanaan dari draft sampai approve,
- proses penatausahaan keuangan minimal happy path dan negative path,
- pencarian dan sinkronisasi data antar bidang,
- alur fallback saat integrasi e-Pelara gagal.

Kriteria lulus:

- seluruh user journey kritis pass,
- tidak ada blocker defect severity tinggi.

### 5.4 Contract Test (SIGAP <-> e-Pelara)

Fokus:

- endpoint integration contract,
- field wajib payload,
- enum/status workflow,
- backward compatibility untuk endpoint terversi.

Kriteria lulus:

- tidak ada mismatch schema,
- perubahan breaking wajib versi baru,
- contract baseline terdokumentasi.

### 5.5 Security Test

Fokus minimum:

- auth bypass test,
- IDOR test,
- input validation,
- rate-limit behavior,
- role escalation attempt,
- token expiry/revocation.

Kriteria lulus:

- tidak ada temuan kritikal terbuka,
- temuan tinggi punya mitigasi dan target fix.

### 5.6 Performance dan Reliability Test

Fokus:

- endpoint prioritas beban normal dan puncak,
- latensi p95,
- error rate,
- kestabilan job background,
- graceful degradation saat dependency lambat.

Target minimum:

- p95 endpoint prioritas <= 1000 ms pada baseline beban,
- error rate <= 1% pada beban normal.

### 5.7 Migration dan Data Integrity Test

Fokus:

- migration up/down,
- kompatibilitas schema,
- foreign key integrity,
- data mapping dari sumber lama,
- consistency check setelah migrasi.

Kriteria lulus:

- migration reversible,
- tidak ada data corruption,
- validasi checksum/sampling sesuai prosedur.

## 6. Test Environment

Environment minimum:

- local dev,
- CI ephemeral,
- staging integrated.

Ketentuan:

1. data uji harus tersanitasi,
2. konfigurasi environment harus konsisten,
3. secret tidak boleh hardcoded,
4. test integrasi lintas layanan dijalankan pada stack containerized.

## 7. Test Data Management

1. Gunakan seed data terkontrol per domain.
2. Pisahkan data untuk unit/integration/e2e.
3. Terapkan reset state otomatis setelah test suite.
4. Sediakan dataset khusus perencanaan untuk kasus edge.
5. Larang penggunaan data produksi mentah pada environment test.

## 8. Tooling Rekomendasi

- Unit/Integration backend: Jest atau Mocha + Supertest
- Frontend test: Jest + React Testing Library
- E2E: Playwright atau Cypress
- Contract: schema validation atau pact-based test
- Performance: k6 atau Locust
- Static analysis: ESLint, type-check, dependency audit

## 9. CI Quality Gate

Gate wajib pada pull request:

1. lint pass,
2. unit test pass,
3. integration test pass,
4. coverage minimum terpenuhi,
5. security scan minimum pass,
6. migration check pass (jika ada perubahan schema).

Gate wajib sebelum release ke production:

1. e2e smoke pass di staging,
2. contract test SIGAP-e-Pelara pass,
3. regression test prioritas pass,
4. no open bug severity kritikal.

## 10. Defect Management

Klasifikasi severity:

- Sev-1: fungsi inti gagal total / data corruption / auth critical
- Sev-2: fungsi penting terganggu signifikan
- Sev-3: gangguan parsial dengan workaround
- Sev-4: isu minor/non-blocking

Aturan release:

- Sev-1 dan Sev-2 wajib ditutup sebelum release,
- Sev-3 dapat ditunda hanya dengan approval resmi dan rencana mitigasi,
- Sev-4 diprioritaskan sesuai sprint backlog.

## 11. Traceability ke Requirement dan Audit

Setiap test suite wajib dapat ditelusuri ke:

- requirement role-service matrix,
- workflow specification,
- kontrol keamanan,
- domain masalah inti 01-kondisi-dinas-pangan.

Artifact audit minimum:

- test report,
- coverage report,
- contract validation report,
- performance baseline report,
- defect closure evidence.

## 12. Prioritas Khusus Domain Perencanaan

Karena perencanaan ditetapkan sebagai domain lemah, pengujian tambahan wajib:

1. skenario linkage dokumen perencanaan,
2. validasi konsistensi data antar modul perencanaan,
3. approval chain lintas peran yang benar,
4. integrasi data perencanaan dengan e-Pelara,
5. negative test untuk data tidak lengkap/inkonsisten.

## 13. Checklist Resmi

- [ ] Unit test backend/frontend lulus sesuai target.
- [ ] Integration test API, DB, RBAC, workflow lulus.
- [ ] E2E skenario kritis lulus.
- [ ] Contract test SIGAP-e-Pelara lulus.
- [ ] Security test minimum lulus tanpa temuan kritikal.
- [ ] Performance baseline tercapai.
- [ ] Migration up/down tervalidasi.
- [ ] Artifact audit pengujian tersedia dan tersimpan.
