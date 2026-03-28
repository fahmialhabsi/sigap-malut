# 32 — Rekomendasi Arsitektur Dashboard Per-Role SIGAP Malut

**Versi:** 2.0 *(Diperbarui 22 Maret 2026 — mencakup semua unit: Sekretariat, 3 Bidang, UPTD)*  
**Tanggal Awal:** 22 Maret 2026  
**Penyusun:** Analisis Teknis SIGAP (berdasarkan dokumenSistem 01, 08, 09, 14, 28, 33)  
**Status:** FINAL — Terkunci. Lihat dokumen 33 untuk referensi lengkap semua keputusan arsitektur.

> **LOG REVISI v2.0:**
> - Matriks penilaian kinerja (Bagian E) diperbarui total: dipisahkan per unit, JF Sekretariat vs JF Bidang vs JF UPTD kini berbeda eksplisit
> - Dashboard D.3 Pejabat Fungsional diperbarui: dashboard adaptif berdasarkan `has_subordinate`
> - Ditambahkan dashboard untuk UPTD: Kasubag UPTD, Kepala Seksi UPTD
> - Peta dashboard diperbarui dari 9 menjadi 16 (14 route unik)

---

## A. KESIMPULAN UTAMA

> **REKOMENDASI: Setiap sub-role dalam Sekretariat HARUS memiliki dashboard terpisah.**
> Satu dashboard bersama untuk Sekretaris, Kasubag, Fungsional, Bendahara, dan Pelaksana adalah **anti-pattern** dalam sistem pemerintahan digital yang comply dengan SPBE dan prinsip RBAC.

---

## B. ALASAN TEKNIS DAN REGULASI

### 1. Prinsip Least Privilege (SPBE & SPIP)

Setiap pegawai hanya boleh melihat informasi yang relevan dengan fungsi jabatannya. Dashboard bersama melanggar:

- **PP 95/2018 tentang SPBE** — sistem informasi pemerintah wajib menerapkan kontrol akses berbasis peran
- **SPIP (Sistem Pengendalian Intern Pemerintah)** — segregation of duties, setiap fungsi harus terpisah dengan akses terbatas
- **Pergub Maluku Utara No. 56/2021** — struktur SOTK mendefinisikan fungsi berbeda per jabatan

### 2. Konfidensialitas Penilaian Kinerja ASN

Berdasarkan **PP 30/2019 tentang Penilaian Kinerja PNS** dan diperkuat dokumen `01-profil-dan-kondisi-dinas-pangan.md` (Bagian I):

| Penilai               | Dinilai                            | Boleh Akses?                   |
| --------------------- | ---------------------------------- | ------------------------------ |
| Sekretaris            | Kasubag Umum & Kepegawaian         | ✅                             |
| Sekretaris            | Pejabat Fungsional (semua)         | ✅                             |
| Sekretaris            | Bendahara                          | ✅                             |
| Sekretaris            | Pelaksana Sekretariat              | ✅                             |
| Kasubag Umum & Kepeg. | Pelaksana di bawahnya              | ✅                             |
| Pejabat Fungsional    | _(tidak ada bawahan)_              | ❌ Tidak perlu modul penilaian |
| Bendahara             | _(tidak ada bawahan)_              | ❌ Tidak perlu modul penilaian |
| Pelaksana             | Diri sendiri (lihat nilai sendiri) | ✅ Read-only                   |
| Pelaksana             | Rekan pelaksana lain               | ❌ **DILARANG**                |

**Jika 1 dashboard bersama:** Pelaksana A bisa melihat nilai kinerja Pelaksana B → pelanggaran privasi data ASN, potensi konflik SDM, dan pelanggaran hukum.

### 3. Relevansi Informasi per Fungsi Jabatan

Dashboard yang tepat sasaran meningkatkan efisiensi kerja. Seorang Pelaksana tidak memerlukan:

- Compliance Overview lintas bidang
- Audit trail seluruh unit
- Approval queue Kepala Dinas
- Data anggaran & realisasi keuangan global

Sebaliknya, seorang Bendahara tidak memerlukan:

- Daftar tugas lapangan Pelaksana
- Jadwal tracking KGB kepegawaian
- Queue verifikasi teknis Pejabat Fungsional

---

## C. MASALAH REAL DI LAPANGAN (dari dokumenSistem/01)

Dokumen profil Dinas Pangan mencatat masalah nyata yang harus dijawab sistem:

### Masalah 1 — "Staf langsung ke Kepala Dinas tanpa melalui Sekretaris"

```
Status Saat Ini (SALAH):
  Kasubag Kepegawaian ──────────────────→ Kepala Dinas
  Fungsional Perencana ─────────────────→ Kepala Dinas
  Fungsional Pnta Ushn Keuangan ────────→ Kepala Dinas
  Bendahara ────────────────────────────→ Kepala Dinas

Yang Seharusnya (BENAR):
  Kasubag Kepegawaian ──→ Sekretaris ──→ Kepala Dinas
  Fungsional ──────────→ Sekretaris ──→ Kepala Dinas
  Bendahara ───────────→ Sekretaris ──→ Kepala Dinas
```

**Solusi via Dashboard:** Dashboard Kasubag/Fungsional/Bendahara HARUS memiliki tombol "Kirim ke Sekretaris" bukan langsung ke Kepala Dinas. Routing approval via Sekretaris ditegakkan oleh sistem.

### Masalah 2 — "Bendahara membuat bukti pertanggungjawaban" (SALAH)

```
Yang Salah:   Bendahara + buat SPJ → submit
Yang Benar:   Pelaksana/PJ kegiatan buat SPJ → submit ke Bendahara untuk verifikasi
```

**Solusi via Dashboard:** Dashboard Pelaksana harus ada modul "Buat SPJ & Upload Bukti". Dashboard Bendahara hanya punya "Verifikasi SPJ yang masuk" (tidak ada tombol Create SPJ).

### Masalah 3 — "Tidak ada monitoring kepangkatan, KGB terlambat"

**Solusi via Dashboard:** Dashboard Kasubag Umum & Kepegawaian harus tampilkan:

- Alert KGB jatuh tempo (< 30 hari)
- Alert Kenaikan Pangkat jatuh tempo
- Status tracking per pegawai secara real-time

---

## D. ARSITEKTUR DASHBOARD YANG DIREKOMENDASIKAN

### Struktur Dashboard Sekretariat (5 Dashboard Terpisah)

```
/dashboard/sekretariat     → Sekretaris Dinas
/dashboard/kasubag         → Kasubag Umum & Kepegawaian (+ Plt. Kasubag)
/dashboard/fungsional      → Pejabat Fungsional (semua jenis: Perencana, Keuangan, Arsiparis, dll)
/dashboard/bendahara       → Bendahara Pengeluaran/Penerimaan
/dashboard/pelaksana       → Pelaksana / Staf Biasa
```

---

### D.1 Dashboard Sekretaris (`/dashboard/sekretariat`)

**Role:** `SEKRETARIS`  
**Sudah ada:** Ya (perlu penambahan modul penilaian kinerja)

| Komponen                      | Deskripsi                                                   |
| ----------------------------- | ----------------------------------------------------------- |
| **Today Inbox**               | Surat masuk ke Sekretaris hari ini                          |
| **Approval Queue**            | Dokumen menunggu tanda tangan/persetujuan Sekretaris        |
| **Overdue Tasks**             | Tugas yang melewati SLA dari semua bawahan                  |
| **KPI Tiles (50 indikator)**  | Compliance koordinasi, Zero bypass, Avg approval time       |
| **Penilaian Kinerja Bawahan** | Form penilaian SKP untuk: Kasubag, JF, Bendahara, Pelaksana |
| **Team Performance Overview** | Ringkasan nilai kinerja semua bawahan (grafik, tren)        |
| **Koordinasi Lintas Bidang**  | Status laporan dari 3 Bidang + UPTD                         |
| **Audit Trail Activity**      | Log aktivitas terkait Sekretariat                           |
| **Generate Laporan**          | Export laporan bulanan/triwulan                             |

**Hak Penilaian Kinerja:** Dapat menilai SEMUA bawahan (Kasubag, JF, Bendahara, Pelaksana)  
**Visibilitas Nilai:** Dapat melihat semua nilai bawahan, tidak bisa melihat nilai milik Bidang lain

---

### D.2 Dashboard Kasubag Umum & Kepegawaian (`/dashboard/kasubag`)

**Role:** `KASUBAG_UMUM_KEPEGAWAIAN`  
**Sudah ada:** BELUM — perlu dibangun

| Komponen                        | Deskripsi                                                  |
| ------------------------------- | ---------------------------------------------------------- |
| **My Tasks**                    | Tugas yang diassign oleh Sekretaris ke Kasubag             |
| **Team Tasks (Pelaksana)**      | Daftar tugas yang diassign Kasubag ke Pelaksana bawahannya |
| **Alert KGB Jatuh Tempo**       | Daftar pegawai yang KGB-nya dalam 30/60/90 hari            |
| **Alert Kenaikan Pangkat**      | Pegawai mendekat batas waktu kenaikan pangkat              |
| **Monitoring Absensi Staf**     | Ringkasan kehadiran staf sekretariat                       |
| **Penilaian Kinerja Pelaksana** | Form SKP untuk Pelaksana di bawah Kasubag SAJA             |
| **Surat Masuk/Keluar**          | Pengelolaan surat terkait kepegawaian dan umum             |
| **Data Pegawai**                | CRUD data kepegawaian (NIP, pangkat, jabatan, status)      |
| **Perjalanan Dinas**            | Request dan tracking SPPD keluar                           |
| **Diklat & Pelatihan**          | Jadwal diklat, tracking peserta                            |

**Hak Penilaian Kinerja:** Menilai Pelaksana di bawahnya SAJA  
**TIDAK dapat melihat:** Nilai kinerja Pejabat Fungsional, Bendahara, atau Pelaksana dari unit lain

---

### D.3 Dashboard Pejabat Fungsional (`/dashboard/fungsional`)

**Role:** `PEJABAT_FUNGSIONAL`  
**Sudah ada:** BELUM — perlu dibangun  
**Tipe dashboard:** **ADAPTIF** — konten berbeda tergantung apakah JF memiliki bawahan di `user_hierarchy`

> **CATATAN REVISI (22 Maret 2026):** Ada dua jenis JF yang berbeda fundamental. Dashboard yang sama digunakan, tetapi panel tertentu hanya tampil jika `has_subordinate = true`.

#### D.3.1 — Panel yang Selalu Ada (Semua JF)

| Komponen | Deskripsi |
|---|---|
| **Verify Queue** | Dokumen/data yang masuk untuk diverifikasi teknis |
| **Evidence Viewer** | Viewer untuk lampiran & bukti kerja |
| **Approve/Reject Panel** | Form approve atau tolak dengan catatan teknis wajib |
| **Timeline Aktivitas** | History verifikasi yang sudah dilakukan |
| **Target Kinerja Saya (SKP)** | Indikator kinerja jabatan fungsional saya |
| **Notifikasi** | Alert dokumen baru masuk |

#### D.3.2 — Panel Tambahan untuk JF Bidang (`has_subordinate = true`)

| Komponen | Deskripsi |
|---|---|
| **Tim Saya** | Daftar Pelaksana yang berada di bawah JF ini |
| **Assign Tugas** | Form distribusi tugas ke Pelaksana bawahannya |
| **Task Monitoring Board** | Status tugas yang sudah di-assign ke Pelaksana |
| **Penilaian Kinerja Pelaksana** | Form SKP untuk Pelaksana bawahannya SAJA |
| **Substitusi Tugas** | Form pengajuan substitusi jika Pelaksana berhalangan |

**Panel yang TIDAK BOLEH ADA di JF Sekretariat & JF UPTD:**
- Form penilaian kinerja (tidak ada bawahan)
- Task assignment ke siapapun
- Monitoring tim

**Kondisi adaptif di frontend:**
```jsx
const { user } = useAuthStore();
const { data: hierarchy } = useQuery(['user-hierarchy', user.id]);
const hasSubordinate = hierarchy?.some(h => h.atasan_id === user.id && h.status === 'aktif');

// Panel Tim Saya dan Assign Tugas hanya muncul jika hasSubordinate = true
{hasSubordinate && <PanelTimSaya />}
{hasSubordinate && <PanelAssignTugas />}
{hasSubordinate && <PanelPenilaianPelaksana />}
```

**Hak Penilaian Kinerja:**
- JF Sekretariat: TIDAK ADA — tidak punya bawahan
- JF Bidang: PUNYA — menilai Pelaksana bawahannya (CONFIDENTIAL dari Kepala Bidang)
- JF UPTD: TIDAK ADA — tidak punya bawahan

---

### D.4 Dashboard Bendahara (`/dashboard/bendahara`)

**Role:** `BENDAHARA`  
**Sudah ada:** BELUM — perlu dibangun

| Komponen                | Deskripsi                                                         |
| ----------------------- | ----------------------------------------------------------------- |
| **SPJ Masuk**           | Daftar SPJ yang disubmit Pelaksana/PJ kegiatan untuk diverifikasi |
| **Verifikasi Keuangan** | Form verifikasi SPJ (approve/tolak/minta revisi)                  |
| **Realisasi Anggaran**  | Progress realisasi DPA per kegiatan                               |
| **Kas & Bank**          | Saldo kas dan rekening dinas (read-only dari SIPD/BPKAD)          |
| **Pengajuan GU/TU**     | Form pengajuan Ganti Uang/Tambahan Uang muka                      |
| **Jadwal Pembayaran**   | Kalender pembayaran honorarium, rekanan, dsb                      |
| **Laporan Keuangan**    | Ringkasan bulanan: realisasi, SILPA, LRA sederhana                |
| **My Tasks**            | Tugas dari Sekretaris                                             |
| **Notifikasi**          | Alert SPJ pending verifikasi, deadline laporan keuangan           |

**Hak Penilaian Kinerja:** TIDAK ADA — Bendahara tidak memiliki bawahan  
**TIDAK dapat:** Membuat SPJ atas nama orang lain (hanya verifikasi SPJ yang masuk)

---

### D.5 Dashboard Pelaksana (`/dashboard/pelaksana`)

**Role:** `PELAKSANA`  
**Sudah ada:** BELUM — perlu dibangun

| Komponen                  | Deskripsi                                                           |
| ------------------------- | ------------------------------------------------------------------- |
| **My Tasks**              | Daftar tugas saya hari ini / minggu ini                             |
| **Task Checklist**        | Checklist penyelesaian sub-tugas                                    |
| **Upload Bukti Kerja**    | Upload evidence/laporan pelaksanaan tugas                           |
| **Buat SPJ**              | Form pembuatan SPJ perjalanan dinas atau kegiatan                   |
| **Surat Masuk ke Saya**   | Surat disposisi yang ditujukan ke saya                              |
| **Status KGB Saya**       | Informasi status KGB dan kenaikan pangkat saya sendiri              |
| **Nilai Kinerja Saya**    | Lihat hasil penilaian SKP saya (read-only, dari Kasubag/Sekretaris) |
| **Notifikasi**            | Alert tugas baru, deadline, hasil verifikasi                        |
| **Perjalanan Dinas Saya** | Status pengajuan SPPD saya                                          |

**Hak Penilaian Kinerja:** HANYA melihat nilai diri sendiri (read-only)  
**TIDAK dapat melihat:** Nilai kinerja orang lain, approval queue Sekretaris, data anggaran global

---

## E. MATRIKS AKSES PENILAIAN KINERJA (KONFIDENSIAL)

> **CATATAN REVISI (22 Maret 2026):** Matriks ini diperbarui secara menyeluruh berdasarkan keputusan arsitektur final (dokumen 33). Versi sebelumnya hanya mencakup konteks Sekretariat dan tidak memisahkan JF Sekretariat vs JF Bidang — ini adalah inkonsistensi yang disengaja diperbaiki sebelum coding dimulai.

### E.1 — Sekretariat

| Penilai \ Yang Dinilai | Sekretaris | Kasubag | JF Sekretariat | Bendahara | Pelaksana Sekretariat |
|---|:---:|:---:|:---:|:---:|:---:|
| **Kepala Dinas** | ✅ Isi+Lihat | ❌ | ❌ | ❌ | ❌ |
| **Sekretaris** | _(dinilai Kadin)_ | ✅ Isi+Lihat | ✅ Isi+Lihat | ✅ Isi+Lihat | ✅ Isi+Lihat |
| **Kasubag** | ❌ | ❌ | ❌ | ❌ | ✅ Isi+Lihat\* |
| **JF Sekretariat** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Bendahara** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pelaksana** | ❌ | ❌ | ❌ | ❌ | Lihat diri sendiri |

\*Kasubag hanya menilai Pelaksana yang secara struktural merupakan bawahannya berdasarkan relasi di `user_hierarchy`

### E.2 — 3 Bidang (Ketersediaan / Distribusi / Konsumsi)

| Penilai \ Yang Dinilai | Kepala Bidang | JF Bidang 1 | JF Bidang 2 | Pelaksana JF1 | Pelaksana JF2 |
|---|:---:|:---:|:---:|:---:|:---:|
| **Kepala Dinas** | ✅ Isi+Lihat | ❌ | ❌ | ❌ | ❌ |
| **Sekretaris** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Kepala Bidang** | _(dinilai Kadin)_ | ✅ Isi+Lihat | ✅ Isi+Lihat | **❌ DIBLOKIR** | **❌ DIBLOKIR** |
| **JF Bidang 1** | ❌ | ❌ | ❌ | ✅ Isi+Lihat\*\* | ❌ |
| **JF Bidang 2** | ❌ | ❌ | ❌ | ❌ | ✅ Isi+Lihat\*\* |
| **Pelaksana** | ❌ | ❌ | ❌ | Lihat diri sendiri | Lihat diri sendiri |

\*\* **KRITIS — CONFIDENTIAL:** Nilai Pelaksana di 3 Bidang bersifat SANGAT RAHASIA:
- Hanya JF penilai langsung yang bisa akses data ini di sistem
- Kepala Bidang **TIDAK BISA MELIHAT** nilai individual Pelaksana di bidangnya — bahkan dalam mode View
- Kepala Dinas hanya melihat **statistik agregat** (rata-rata per unit, tanpa nama individu)
- Backend: endpoint `/api/kinerja/bawahan` WAJIB memvalidasi relasi langsung di `user_hierarchy`, bukan hanya cek role

### E.3 — UPTD

| Penilai \ Yang Dinilai | Kepala UPTD | Kasubag UPTD | Kasi 1 | Kasi 2 | JF UPTD | Pelaksana Kasubag | Pelaksana Kasi 1 | Pelaksana Kasi 2 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Kepala Dinas** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Kepala UPTD** | _(dinilai Kadin)_ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Kasubag UPTD** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Kasi 1** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Kasi 2** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **JF UPTD** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pelaksana** | ❌ | ❌ | ❌ | ❌ | ❌ | Diri saja | Diri saja | Diri saja |

---

### E.4 — Implementasi Privasi di Backend

```js
// Middleware untuk endpoint penilaian kinerja
// GET /api/kinerja/bawahan — hanya atasan langsung berdasarkan user_hierarchy
router.get(
  "/kinerja/bawahan",
  authenticate,
  async (req, res) => {
    const requesterId = req.user.id;

    // Validasi berlapis: cek USER_HIERARCHY, bukan hanya role
    const bawahanIds = await UserHierarchy.findAll({
      where: {
        atasan_id: requesterId,
        status: 'aktif',
        jenis_hierarki: { [Op.in]: ['permanen', 'sementara'] }
      },
      attributes: ['bawahan_id']
    });

    if (bawahanIds.length === 0) {
      return res.status(403).json({
        message: 'Anda tidak memiliki bawahan yang terdaftar di sistem.'
      });
    }

    const bawahan = await User.findAll({
      where: { id: { [Op.in]: bawahanIds.map(b => b.bawahan_id) } },
      attributes: ['id', 'nama', 'jabatan', 'unit_kerja'] // TIDAK termasuk nilai kinerja
    });

    res.json({ data: bawahan });
  }
);

// GET /api/kinerja/nilai/:dinilai_id — hanya penilai langsung yang bisa akses
router.get(
  "/kinerja/nilai/:dinilai_id",
  authenticate,
  async (req, res) => {
    const requesterId = req.user.id;
    const dinilaiId = req.params.dinilai_id;

    // Cek apakah requester adalah atasan langsung dari dinilai_id
    const isAtasanLangsung = await UserHierarchy.findOne({
      where: {
        atasan_id: requesterId,
        bawahan_id: dinilaiId,
        status: 'aktif'
      }
    });

    if (!isAtasanLangsung) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda bukan atasan langsung dari pegawai ini.'
      });
    }

    const nilaiKinerja = await SkpPenilaian.findAll({
      where: { penilai_id: requesterId, dinilai_id: dinilaiId }
    });

    res.json({ data: nilaiKinerja });
  }
);
```

---

> **CATATAN v2.0:** Bagian F sekarang mencakup dashboard UPTD dan semua 15 role. Lihat bagian F.0 di bawah untuk detail dashboard baru UPTD.

### F.0 Dashboard UPTD yang Perlu Dibangun

#### F.0.1 Dashboard Kasubag UPTD (`/dashboard/kasubag-uptd`)
**Role:** `KASUBAG_UPTD`

| Komponen | Deskripsi |
|---|---|
| **Absensi UPTD** | Input + verifikasi absensi SEMUA staf UPTD |
| **KGB Alert UPTD** | Monitoring KGB jatuh tempo semua staf UPTD |
| **Surat Masuk UPTD** | Pengelolaan surat administrasi UPTD |
| **Data Pegawai UPTD** | View data dasar semua staf UPTD (NIP, pangkat, golongan) |
| **My Tasks** | Tugas dari Kepala UPTD |
| **Team Tasks** | Distribusi tugas ke Pelaksana bawahannya |
| **Penilaian Kinerja Pelaksana** | Hanya Pelaksana di bawah Kasubag UPTD saja |
| **Usulan KGB ke Sekretariat** | Form usulan KGB untuk staf UPTD → dikirim ke Kasubag Sekretariat |

**TIDAK BOLEH ada:** data teknis, penilaian kinerja Pelaksana Kasi, kewenangan teknis apapun

#### F.0.2 Dashboard Kepala Seksi UPTD (`/dashboard/kasi-uptd`)
**Role:** `KEPALA_SEKSI_UPTD`

| Komponen | Deskripsi |
|---|---|
| **My Tasks** | Tugas dari Kepala UPTD (jalur teknis langsung) |
| **Team Tasks** | Distribusi tugas ke Pelaksana bawahannya |
| **Penilaian Kinerja Pelaksana** | Hanya Pelaksana di bawah Kasi ini |
| **Laporan Teknis** | Hasil kerja teknis untuk dilaporkan ke Kepala UPTD |
| **Verifikasi Hasil Kerja** | Review hasil Pelaksana sebelum diteruskan ke Kepala UPTD |

**Catatan:** Kepala Seksi laporan **langsung ke Kepala UPTD** — bukan melalui Kasubag UPTD.

---

### F.1 Penambahan Role di Database

```sql
-- Role baru yang perlu ditambahkan (saat ini belum ada di roleToDashboard)
INSERT INTO master_roles (role_name, display_name, unit_kerja, dashboard_url) VALUES
('KASUBAG_UMUM_KEPEGAWAIAN', 'Kasubag Umum & Kepegawaian', 'Sekretariat', '/dashboard/kasubag'),
('PEJABAT_FUNGSIONAL', 'Pejabat Fungsional', 'Lintas Unit', '/dashboard/fungsional'),
('BENDAHARA', 'Bendahara', 'Sekretariat', '/dashboard/bendahara'),
('KASUBAG_UPTD', 'Kasubag UPTD', 'UPTD', '/dashboard/kasubag-uptd'),
('KEPALA_SEKSI_UPTD', 'Kepala Seksi UPTD', 'UPTD', '/dashboard/kasi-uptd');
-- PELAKSANA sudah ada, update dashboardUrl
UPDATE users SET dashboard_url = '/dashboard/pelaksana' WHERE role = 'PELAKSANA';
```

### F.2 Update roleToDashboard (authController.js)

```js
const roleToDashboard = {
  // Admin
  SUPER_ADMIN: "/dashboard/superadmin",
  // Pimpinan
  KEPALA_DINAS: "/dashboard",
  GUBERNUR: "/dashboard",
  // Sekretariat
  SEKRETARIS: "/dashboard/sekretariat",
  KASUBAG_UMUM_KEPEGAWAIAN: "/dashboard/kasubag",
  PEJABAT_FUNGSIONAL: "/dashboard/fungsional",   // adaptif berdasarkan has_subordinate
  BENDAHARA: "/dashboard/bendahara",
  PELAKSANA: "/dashboard/pelaksana",              // konten adaptif berdasarkan unit_kerja
  // 3 Bidang
  KEPALA_BIDANG_KETERSEDIAAN: "/dashboard/ketersediaan",
  KEPALA_BIDANG_DISTRIBUSI: "/dashboard/distribusi",
  KEPALA_BIDANG_KONSUMSI: "/dashboard/konsumsi",
  // UPTD
  KEPALA_UPTD: "/dashboard/uptd",
  KASUBAG_UPTD: "/dashboard/kasubag-uptd",
  KEPALA_SEKSI_UPTD: "/dashboard/kasi-uptd",
  // Publik
  VIEWER: "/dashboard-publik",
};
```

### F.3 Routes Baru di App.jsx

```jsx
<Route path="/dashboard/kasubag"     element={<PrivateRoute><DashboardKasubag /></PrivateRoute>} />
<Route path="/dashboard/fungsional"  element={<PrivateRoute><DashboardFungsional /></PrivateRoute>} />
<Route path="/dashboard/bendahara"   element={<PrivateRoute><DashboardBendahara /></PrivateRoute>} />
<Route path="/dashboard/pelaksana"   element={<PrivateRoute><DashboardPelaksana /></PrivateRoute>} />
```

### F.4 Kontrol Akses Penilaian Kinerja (Backend)

```js
// Middleware untuk endpoint penilaian kinerja
// GET /api/kinerja/bawahan — hanya atasan langsung
router.get(
  "/kinerja/bawahan",
  authenticate,
  authorize([
    "SEKRETARIS",
    "KASUBAG_UMUM_KEPEGAWAIAN",
    "KEPALA_BIDANG",
    "KEPALA_UPTD",
  ]),
  async (req, res) => {
    const { roleName, unit_kerja } = req.user;

    let bawahanFilter = {};
    if (roleName === "SEKRETARIS") {
      // Sekretaris bisa lihat semua bawahan Sekretariat
      bawahanFilter = {
        unit_kerja: "Sekretariat",
        role: {
          $in: [
            "KASUBAG_UMUM_KEPEGAWAIAN",
            "PEJABAT_FUNGSIONAL",
            "BENDAHARA",
            "PELAKSANA",
          ],
        },
      };
    } else if (roleName === "KASUBAG_UMUM_KEPEGAWAIAN") {
      // Kasubag hanya bisa lihat Pelaksana saja
      bawahanFilter = { unit_kerja: "Sekretariat", role: "PELAKSANA" };
    }
    // Kepala Bidang hanya bisa lihat staf bidangnya

    const bawahan = await User.findAll({ where: bawahanFilter });
    res.json({ data: bawahan });
  },
);
```

---

## G. PERBANDINGAN DENGAN SISTEM PEMERINTAHAN DAERAH LAIN

Berikut adalah pola yang umum ditemukan pada sistem aplikasi pemerintahan daerah serupa:

### 1. Sistem e-Kinerja BKN (Nasional)

- Dashboard terpisah per level jabatan: Pejabat Penilai memiliki view berbeda dari yang dinilai
- SKP hanya bisa diisi oleh atasan langsung (pejabat penilai yang ditetapkan)
- Yang dinilai hanya bisa _lihat_ hasil penilaian, tidak bisa edit

### 2. SIMPEG (Sistem Informasi Manajemen Pegawai)

- Pisahan akses: Unit Kepegawaian vs. ASN biasa
- ASN hanya lihat data diri sendiri
- Pejabat kepegawaian bisa lihat semua data dalam unit kerjanya

### 3. Sistem Pemerintahan Daerah (Pemprov/Pemkab Lain)

Dari pengalaman implementasi di berbagai daerah, pola yang efektif:

- **1 dashboard per jabatan struktural** minimum
- **Pengecualian:** Jabatan fungsional yang homogen bisa share dashboard (misal semua fungsional analis kebijakan) — tapi data yang ditampilkan tetap filtered by NIP masing-masing
- **Penilaian kinerja** SELALU menjadi modul terpisah dengan akses berlapis

### 4. Anti-Pattern yang Umum Terjadi (dan harus dihindari)

| Anti-Pattern                                            | Dampak                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| 1 dashboard untuk semua staf                            | Pelanggaran privasi, kebocoran data kinerja/gaji/penilaian |
| Pelaksana bisa approve tugas sendiri                    | Bypass SOP, risiko fraud                                   |
| Bendahara bisa buat SPJ sendiri                         | Kontrol keuangan lemah, temuan audit                       |
| Notifikasi approval masuk ke semua staf                 | Information overload, kebingungan tupoksi                  |
| Role "PELAKSANA" hanya redirect ke dashboard Sekretaris | Salah konteks, kebingungan pengguna                        |

---

## H. PRIORITAS IMPLEMENTASI

### Phase 1 (Segera — Sprint berikutnya)

1. ✅ Fix routing `PELAKSANA` ke `/dashboard/pelaksana` (sudah dilakukan via unit_kerja)
2. 🔲 Buat `DashboardPelaksana.jsx` — minimal: My Tasks, Upload Bukti, Nilai Saya
3. 🔲 Buat `DashboardBendahara.jsx` — minimal: SPJ Masuk untuk Verifikasi, Realisasi Anggaran
4. 🔲 Update `roleToDashboard` untuk `KASUBAG`, `PEJABAT_FUNGSIONAL`, `BENDAHARA`

### Phase 2 (Sprint 2)

5. 🔲 Buat `DashboardKasubag.jsx` — Alert KGB, Team Tasks, Penilaian Pelaksana
6. 🔲 Buat `DashboardFungsional.jsx` — Verify Queue, Evidence Viewer
7. 🔲 Implementasi modul Penilaian Kinerja dengan akses berlapis

### Phase 3 (Sprint 3+)

8. 🔲 Integrasi penilaian kinerja ke KGB tracking dan kenaikan pangkat
9. 🔲 Laporan kinerja per periode untuk Sekretaris
10. 🔲 Notifikasi untuk seluruh rantai approval penilaian

---

## I. CATATAN KHUSUS UNTUK SIGAP MALUT

### Konteks Unik Dinas Pangan Maluku Utara

1. **Geografi kepulauan** — Dashboard Pelaksana UPTD (di pulau berbeda) perlu mode _offline-first_ atau sinkronisasi berkala jika koneksi internet terbatas

2. **Masalah alur koordinasi yang salah** (dari dokumen `01-profil`) — Sistem harus secara **teknis memaksa** alur yang benar:
   - Tombol "Kirim ke Atasan" di dashboard bawahan **hanya bisa dikirim ke Sekretaris** (bukan Kepala Dinas langsung)
   - Kepala Dinas hanya menerima dokumen yang sudah melewati Sekretaris (kecuali kategori strategis tertentu yang dikecualikan)

3. **Masalah Bendahara yang membuat SPJ sendiri** — Dashboard Bendahara **tidak boleh memiliki tombol "Buat SPJ"** sama sekali. Form SPJ hanya ada di Dashboard Pelaksana

4. **KGB terlambat** — Alert otomatis di Dashboard Kasubag adalah solusi langsung untuk masalah ini: "5 pegawai KGB jatuh tempo dalam 30 hari"

5. **Program Makan Bergizi Gratis (prioritas Presiden)** — Dashboard Sekretaris dan Kepala Dinas harus memiliki widget khusus monitoring SPPG (Satuan Pelayanan Pemenuhan Gizi) yang real-time, mengingat ini adalah program prioritas nasional

---

## J. VERDICT

| Pertanyaan                                | Jawaban                                                              |
| ----------------------------------------- | -------------------------------------------------------------------- |
| 1 dashboard untuk semua Sekretariat?      | **TIDAK** — melanggar SPBE, SPIP, dan privasi ASN                    |
| Dashboard berbeda per role?               | **YA** — 5 dashboard berbeda untuk 5 sub-role Sekretariat            |
| Penilaian kinerja terpisah?               | **YA** — hanya atasan langsung yang bisa isi dan lihat               |
| Kasubag bisa nilai Pelaksana?             | **YA** — hanya Pelaksana yang secara struktural merupakan bawahannya |
| Pejabat Fungsional perlu modul penilaian? | **TIDAK** — tidak punya bawahan, cukup lihat nilai diri sendiri      |
| Bendahara perlu modul penilaian?          | **TIDAK** — tidak punya bawahan                                      |
| Pelaksana bisa lihat nilai orang lain?    | **TIDAK** — hanya nilai diri sendiri (read-only)                     |

---

_Dokumen ini dibuat berdasarkan analisis mendalam dokumenSistem 01 (Profil Dinas), 08 (Workflow), 09 (Role Matrix), 14 (Service Requirements), dan best practice implementasi sistem pemerintahan daerah._
