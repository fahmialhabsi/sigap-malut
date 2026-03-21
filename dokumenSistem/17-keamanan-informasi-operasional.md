# 17 - Keamanan Informasi Lengkap SIGAP-MALUT

Versi: 2026-03-20
Status: Wajib diterapkan sebelum produksi

## 1. Tujuan

Menetapkan standar keamanan operasional untuk SIGAP-MALUT dan integrasi e-Pelara agar kerahasiaan, integritas, dan ketersediaan data terjaga serta siap audit.

## 2. Klasifikasi Data

| Kelas    | Contoh Data                                | Kontrol Minimal                                    |
| -------- | ------------------------------------------ | -------------------------------------------------- |
| Publik   | Ringkasan statistik non-sensitif           | Validasi konten publik dan approval publikasi      |
| Internal | Data operasional non-pribadi               | Akses berbasis role dan audit log                  |
| Terbatas | Data pegawai, dokumen perencanaan internal | Enkripsi at-rest, masking di UI, kontrol ekspor    |
| Rahasia  | Kredensial, token, data sensitif           | Enkripsi kuat, akses sangat terbatas, key rotation |

## 3. Kontrol Identitas dan Akses

1. Semua akses wajib autentikasi.
2. RBAC wajib sesuai role-module matrix.
3. Session timeout wajib diterapkan.
4. Token wajib memiliki expiry dan mekanisme revocation.
5. Aksi kritis (approve/finalize/export/delete) wajib dicatat pada audit trail.
6. MFA direkomendasikan untuk role berisiko tinggi (super admin, approver strategis).

## 4. Kontrol API

1. Semua endpoint dilindungi auth middleware kecuali endpoint publik yang disetujui.
2. Rate limiting wajib per endpoint kritis.
3. CORS wajib whitelist origin resmi.
4. Validasi input wajib di boundary API.
5. Error response tidak boleh membocorkan detail internal.
6. API versioning wajib untuk perubahan kontrak mayor.

## 5. Kontrol Data

1. Data sensitif wajib dienkripsi at-rest.
2. Transport wajib TLS.
3. Field sensitif wajib masking di UI dan log.
4. Export data wajib berbasis izin role dan alasan penggunaan.
5. Retensi data mengikuti kebijakan arsip dan regulasi yang berlaku.

## 6. Audit Trail dan Forensik

Event minimal yang wajib dicatat:

- Login berhasil/gagal
- Submit/approve/reject/finalize workflow
- Perubahan data master
- Ekspor data
- Perubahan hak akses

Atribut log minimal:

- waktu
- user id
- role
- endpoint/modul
- aksi
- entity id
- status hasil
- ip
- user agent

## 7. Manajemen Rahasia

1. Secret tidak boleh disimpan di repository.
2. Gunakan secret manager atau environment secret terkontrol.
3. Lakukan rotasi secret berkala.
4. Terapkan pemisahan secret per environment.

## 8. Vulnerability dan Patch

1. Dependency scan berkala.
2. Patch prioritas kritis maksimal 7 hari.
3. Hasil scan wajib terdokumentasi.
4. Lakukan hardening baseline pada server/container.

## 9. Incident Response

Tahapan minimum:

1. Deteksi dan triase.
2. Isolasi dampak.
3. Eradikasi akar masalah.
4. Recovery terukur.
5. Post-incident review.

SLA insiden keamanan:

- Kritikal: respons <= 30 menit
- Tinggi: respons <= 2 jam
- Sedang: respons <= 1 hari kerja

## 10. Checklist Kepatuhan Keamanan

- [ ] RBAC enforcement aktif di backend dan frontend.
- [ ] Session timeout dan token revocation aktif.
- [ ] Rate limit aktif pada endpoint prioritas.
- [ ] Audit log lengkap dan dapat ditelusuri.
- [ ] Secret tidak ada di source code.
- [ ] Backup keamanan dan rencana pemulihan diuji.
