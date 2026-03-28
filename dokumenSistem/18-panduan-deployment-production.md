# 18 - Deployment Production Guide SIGAP-MALUT

Versi: 2026-03-20
Status: Standar rilis produksi

## 1. Tujuan

Menyediakan panduan deployment produksi yang konsisten, aman, dan dapat rollback untuk SIGAP-MALUT serta layanan terintegrasi (termasuk e-Pelara).

## 2. Arsitektur Environment

Environment minimum:

- development
- staging
- production

Prinsip:

1. Konfigurasi dipisah per environment.
2. Secret dikelola aman.
3. Database produksi tidak boleh sqlite.
4. Semua rilis harus melalui staging terlebih dahulu.

## 3. Prasyarat Rilis

- Branch policy aktif.
- CI lulus (lint, unit test, build).
- Migration script tersedia dengan opsi rollback.
- OpenAPI dan changelog diperbarui.
- Approval release terdokumentasi.

## 4. Alur Deployment

1. Build artifact.
2. Deploy ke staging.
3. Jalankan smoke test dan regression test prioritas.
4. Approve release.
5. Deploy ke production (blue/green atau rolling).
6. Verifikasi post-deploy.

## 5. Database Migration

1. Jalankan backup sebelum migrasi.
2. Jalankan migrasi terurut.
3. Validasi integritas data dan foreign key.
4. Jika gagal, jalankan rollback sesuai migration down.

## 6. Integrasi e-Pelara

1. Gunakan API contract terversi.
2. Jangan tulis langsung ke DB e-Pelara dari SIGAP.
3. Uji health endpoint kedua layanan sebelum switch traffic.
4. Verifikasi sinkronisasi role dan workflow status.

## 7. Rollback Plan

Trigger rollback:

- Error rate kritis meningkat.
- Endpoint prioritas gagal.
- Integritas data terganggu.

Langkah rollback:

1. Kembalikan traffic ke versi stabil sebelumnya.
2. Jalankan rollback schema bila diperlukan.
3. Pulihkan data dari backup jika terjadi korupsi.
4. Catat insiden dan RCA.

## 8. Checklist Pre-Deploy

- [ ] Semua test gate lulus.
- [ ] Migration diuji di staging.
- [ ] Konfigurasi environment tervalidasi.
- [ ] Secrets tidak berubah tidak sah.
- [ ] Monitoring dashboard siap.

## 9. Checklist Post-Deploy

- [ ] Health check semua layanan lulus.
- [ ] Endpoint kritis lolos smoke test.
- [ ] Error rate dalam batas SLO.
- [ ] Audit log normal.
- [ ] Dashboard operasional normal.
