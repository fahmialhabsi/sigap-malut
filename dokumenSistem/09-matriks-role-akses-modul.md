# 07-Role-Module-Matrix

> **CATATAN REVISI (22 Maret 2026):** Matriks ini diperbarui untuk mencakup seluruh 15 role yang telah dikunci pada dokumen 33. Sebelumnya hanya mendefinisikan 5 role — banyak role kritikal yang belum terdefinisi.

| Role                       | Key DB                                 | Modul Utama                                           | Create                 | Read              | Update            | Delete | Approve         | Finalize |
| -------------------------- | -------------------------------------- | ----------------------------------------------------- | ---------------------- | ----------------- | ----------------- | ------ | --------------- | -------- |
| Super Admin                | `SUPER_ADMIN`                          | Semua modul                                           | Y                      | Y                 | Y                 | Y      | Y               | Y        |
| Kepala Dinas               | `KEPALA_DINAS`                         | Dashboard, Laporan, SKP Final                         | N                      | Y                 | N                 | N      | Y               | Y        |
| Gubernur                   | `GUBERNUR`                             | Dashboard, Laporan                                    | N                      | Y                 | N                 | N      | N               | N        |
| Sekretaris                 | `SEKRETARIS`                           | KGB Global, Kepegawaian, Tugas, SKP, Approval         | Y                      | Y                 | Y                 | Y      | Y               | Y        |
| Kasubag Umum & Kepeg.      | `KASUBAG_UMUM_KEPEGAWAIAN`             | Kepegawaian, Tugas, SKP Pelaksana, Absensi            | Y                      | Y                 | Y                 | N      | Y               | N        |
| Pejabat Fungsional         | `PEJABAT_FUNGSIONAL`                   | Verifikasi Teknis, SKP Saya, Tugas dari Atasan        | N                      | Y                 | Y (milik sendiri) | N      | Y (verify saja) | N        |
| JF Bidang (adaptif)        | `PEJABAT_FUNGSIONAL` + has_subordinate | + Task Assignment, SKP Pelaksana bawahan              | Y (tugas ke Pelaksana) | Y                 | Y                 | N      | Y               | N        |
| Bendahara                  | `BENDAHARA`                            | SPJ Verifikasi, Realisasi Anggaran, KAS               | N                      | Y                 | Y (kas & GU/TU)   | N      | Y (verif SPJ)   | N        |
| Pelaksana                  | `PELAKSANA`                            | Tugas Saya, Input Data, Buat SPJ, Nilai Diri          | Y (input & SPJ)        | Y (milik sendiri) | Y (milik sendiri) | N      | N               | N        |
| Kepala Bidang Ketersediaan | `KEPALA_BIDANG_KETERSEDIAAN`           | Ketersediaan, Tugas Bidang, SKP JF                    | Y                      | Y                 | Y                 | N      | Y               | Y        |
| Kepala Bidang Distribusi   | `KEPALA_BIDANG_DISTRIBUSI`             | Distribusi, Tugas Bidang, SKP JF                      | Y                      | Y                 | Y                 | N      | Y               | Y        |
| Kepala Bidang Konsumsi     | `KEPALA_BIDANG_KONSUMSI`               | Konsumsi, Tugas Bidang, SKP JF                        | Y                      | Y                 | Y                 | N      | Y               | Y        |
| Kepala UPTD                | `KEPALA_UPTD`                          | UPTD, Tugas UPTD, SKP Kasi/Kasubag/JF                 | Y                      | Y                 | Y                 | N      | Y               | Y        |
| Kasubag UPTD               | `KASUBAG_UPTD`                         | Absensi UPTD, KGB UPTD, Surat UPTD, Data Pegawai UPTD | Y (admin)              | Y                 | Y (admin)         | N      | N               | N        |
| Kepala Seksi UPTD          | `KEPALA_SEKSI_UPTD`                    | Tugas Seksi, SKP Pelaksana Seksi, Laporan Teknis      | Y                      | Y                 | Y                 | N      | Y               | N        |
| Viewer/Publik              | `VIEWER`                               | Dashboard publik, Data pangan publik                  | N                      | Y (publik)        | N                 | N      | N               | N        |

**Catatan penting:**

- `PEJABAT_FUNGSIONAL` menggunakan satu role di DB; tampilan dashboard adaptif berdasarkan keberadaan bawahan di tabel `user_hierarchy`
- `PELAKSANA` menggunakan satu role di DB; konten dashboard adaptif berdasarkan `unit_kerja` dan `jabatan`
- Akses penilaian kinerja di-enforce melalui relasi di `user_hierarchy`, bukan hanya cek role
- Nilai Pelaksana di 3 Bidang bersifat CONFIDENTIAL: hanya JF penilai langsung yang bisa akses data DB-nya
