# 19 - Operations Runbook SIGAP-MALUT

Versi: 2026-03-20
Status: SOP operasional harian dan insiden

## 1. Tujuan

Memberikan prosedur operasional standar agar layanan SIGAP-MALUT stabil, terpantau, dan dapat dipulihkan saat gangguan.

## 2. Peran Operasional

- On-call engineer
- Backend lead
- Frontend lead
- DBA
- QA
- Incident commander

## 3. Monitoring Harian

Periksa minimal:

1. Kesehatan service backend/frontend.
2. Koneksi database.
3. Error rate endpoint prioritas.
4. Latensi endpoint penting.
5. Queue/job backlog.
6. Kapasitas CPU/memory/disk.

## 4. Alert dan Eskalasi

Severity:

- Sev-1: layanan inti down.
- Sev-2: fungsi utama degradasi.
- Sev-3: gangguan terbatas.

SLA respons:

- Sev-1: <= 15 menit
- Sev-2: <= 30 menit
- Sev-3: <= 4 jam

## 5. Backup dan Recovery

Kebijakan minimum:

- Backup harian database.
- Backup mingguan full snapshot.
- Uji restore berkala.

Target:

- RTO: <= 4 jam
- RPO: <= 24 jam

## 6. SOP Gangguan Umum

### API timeout

1. Cek health service.
2. Cek koneksi DB dan load.
3. Cek dependency eksternal.
4. Aktifkan fallback jika tersedia.

### Data mismatch lintas modul

1. Hentikan job sinkronisasi bermasalah.
2. Jalankan validasi integritas.
3. Koreksi data dengan prosedur terkontrol.
4. Catat incident report.

### Integrasi e-Pelara gagal

1. Cek konektivitas endpoint integrasi.
2. Cek auth token dan secret.
3. Cek contract mismatch payload.
4. Aktifkan mode degradable read jika tersedia.

## 7. Operasional Mingguan

- Review error trend.
- Review kapasitas.
- Review temuan audit log.
- Review backlog bug prioritas.
- Review SLA compliance.

## 8. Operasional Bulanan

- Drill disaster recovery.
- Uji restore backup penuh.
- Patch dependency kritis.
- Review hak akses admin.

## 9. Artifact Wajib Operasional

- Incident log
- Postmortem/RCA
- Backup report
- Availability report
- SLA report
- Security event report

## 10. Checklist Runbook

- [ ] On-call roster aktif.
- [ ] Dashboard monitoring aktif.
- [ ] Alert route tervalidasi.
- [ ] Backup tervalidasi.
- [ ] DR drill dijadwalkan.
