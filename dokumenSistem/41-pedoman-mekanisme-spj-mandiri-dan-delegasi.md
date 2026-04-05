# 38 — Pedoman Mekanisme SPJ: Mandiri dan Delegasi Pembuatan Dokumen
## Sistem SIGAP-MALUT — Dinas Pangan Provinsi Maluku Utara

**Versi:** 1.0
**Tanggal:** 5 April 2026
**Status:** FINAL — Telah dikonfirmasi dan disetujui
**Berlaku untuk:** Seluruh unit organisasi — Sekretariat, 3 Bidang, dan UPTD
**Dasar Hukum:**
- Permendagri Nomor 77 Tahun 2020 tentang Pedoman Teknis Pengelolaan Keuangan Daerah
- PP Nomor 12 Tahun 2019 tentang Pengelolaan Keuangan Daerah
- PP Nomor 60 Tahun 2008 tentang SPIP (Segregation of Duties, Audit Trail)
- PP Nomor 95 Tahun 2018 tentang SPBE (Audit Trail Digital, Akuntabilitas Sistem)

---

## BAGIAN I — LATAR BELAKANG DAN PERMASALAHAN

### 1.1 Prinsip Regulasi

Berdasarkan Permendagri Nomor 77 Tahun 2020, **setiap ASN yang menerima honor, melakukan perjalanan dinas, atau menerima pengeluaran lainnya atas namanya wajib membuat Surat Pertanggungjawaban (SPJ) sendiri.** Prinsip ini berlaku tanpa pengecualian untuk seluruh jabatan, mulai dari:

- Kepala Dinas
- Sekretaris
- Kepala Bidang
- Kepala UPTD
- Kepala Subbagian
- Kepala Seksi
- Jabatan Fungsional (JF)
- Bendahara
- Pelaksana

### 1.2 Kondisi Nyata di Lapangan

Dalam praktik riil yang berlangsung saat ini di Dinas Pangan Provinsi Maluku Utara — dan umumnya di seluruh instansi pemerintah daerah — terjadi kondisi sebagai berikut:

**Kepala Dinas, Sekretaris, Kepala Bidang, Kepala UPTD, Kasubag, Kepala Seksi, dan Jabatan Fungsional tidak membuat SPJ sendiri.** Yang menyiapkan dan membuat dokumen SPJ adalah Pelaksana, namun SPJ tersebut dibuat **atas nama pejabat yang bersangkutan**.

### 1.3 Penilaian atas Kondisi Ini

Kondisi ini **bukan merupakan pelanggaran regulasi**, selama memenuhi dua syarat:

1. **Bukti pengeluaran asli** diserahkan oleh pejabat kepada Pelaksana yang membantu pembuatan dokumen
2. **Pejabat yang namanya tercantum dalam SPJ memberikan konfirmasi dan persetujuan** atas kebenaran isi SPJ sebelum dokumen diajukan ke tahap verifikasi

Yang menjadi masalah selama ini adalah **tidak adanya mekanisme konfirmasi dan persetujuan formal** dari pejabat yang bersangkutan sebelum SPJ diproses lebih lanjut — sehingga akuntabilitas menjadi lemah dan rentan terhadap temuan audit.

### 1.4 Solusi dalam SIGAP-MALUT

SIGAP-MALUT mengakomodasi praktik nyata di lapangan sekaligus memastikan akuntabilitas tetap terjaga melalui **mekanisme dua kondisi SPJ**:

- **Kondisi A — SPJ Mandiri:** Pelaksana membuat SPJ atas namanya sendiri
- **Kondisi B — Delegasi Pembuatan Dokumen:** Pelaksana menyiapkan draft SPJ atas nama pejabat, namun pejabat wajib mengkonfirmasi dan menyetujui sebelum dokumen diproses

---

## BAGIAN II — DUA KONDISI SPJ

### 2.1 Kondisi A — SPJ Mandiri

Berlaku ketika seorang ASN menerima honor, melakukan perjalanan dinas, atau pengeluaran lainnya **atas namanya sendiri** dan ia sendiri yang menyiapkan dokumennya.

**Berlaku untuk:** Seluruh Pelaksana yang secara reguler membuat SPJ atas namanya sendiri.

**Alur:**

```
ASN yang bersangkutan
    │
    │  Membuat SPJ sendiri di SIGAP-MALUT
    │  Upload bukti pengeluaran sendiri
    │  Status: submitted
    ▼
JF / Kasubag / Kepala Bidang
(sesuai hierarki unit masing-masing)
    │
    │  Verifikasi teknis dokumen
    │  Setujui / kembalikan untuk perbaikan
    ▼
Sekretariat
    │
    ├── JF Penata Usahaan Keuangan → analisis dan verifikasi
    ├── PPK-SKPD → mengesahkan SPJ → menerbitkan SPM
    ▼
Selesai
```

**Status workflow:**
```
draft → submitted → verified_atasan → verified_jf_keuangan → approved_ppk_skpd → closed
```

---

### 2.2 Kondisi B — Delegasi Pembuatan Dokumen

Berlaku ketika seorang **pejabat** (Kepala Dinas, Sekretaris, Kepala Bidang, Kepala UPTD, Kasubag, JF) menerima honor atau melakukan perjalanan dinas, namun **pembuatan dokumen SPJ dibantu oleh Pelaksana**.

**Prinsip utama:**
- Pelaksana hanya **menyiapkan dokumen administratif** — bukan mengambil alih tanggung jawab
- Tanggung jawab atas kebenaran isi SPJ **tetap melekat pada pejabat yang namanya tercantum**
- Pejabat **wajib memeriksa dan menyetujui secara digital** sebelum SPJ diproses lebih lanjut
- Persetujuan digital pejabat dicatat permanen dalam audit trail dan **tidak dapat dihapus atau diubah**

**Alur:**

```
Pejabat (Kadis/Sekretaris/Kabid/Kasubag/JF/dll)
    │
    │  Serahkan bukti pengeluaran asli kepada Pelaksana
    │  (nota, tiket perjalanan, kwitansi, dan dokumen pendukung)
    ▼
Pelaksana
    │
    │  Membuat draft SPJ atas nama Pejabat di SIGAP-MALUT
    │  Upload scan/foto bukti pengeluaran yang diserahkan
    │  Status: draft_oleh_pelaksana
    │  BELUM BISA diajukan ke tahap berikutnya
    ▼
Sistem SIGAP-MALUT
    │
    │  Kirim notifikasi otomatis ke Pejabat:
    │  "Ada draft SPJ atas nama Anda untuk diperiksa.
    │   Silakan buka dan konfirmasi kebenaran isinya."
    ▼
Pejabat — WAJIB KONFIRMASI DAN SETUJUI
    │
    │  Membuka draft SPJ di dashboard-nya
    │  Memeriksa kesesuaian dengan pengeluaran sebenarnya
    │  Menekan tombol "Saya Setujui SPJ ini"
    │  → Tanggung jawab berpindah ke Pejabat
    │  → Audit trail mencatat: nama, waktu, perangkat
    │  Status berubah: dikonfirmasi_pejabat
    ▼
JF / Kasubag / Kepala Bidang
(sesuai hierarki unit masing-masing)
    │
    │  Verifikasi teknis dokumen
    │  Setujui / kembalikan untuk perbaikan
    ▼
Sekretariat
    │
    ├── JF Penata Usahaan Keuangan → analisis dan verifikasi
    ├── PPK-SKPD → mengesahkan SPJ → menerbitkan SPM
    ▼
Selesai
```

**Status workflow:**
```
draft_oleh_pelaksana
    → menunggu_konfirmasi_pejabat
    → dikonfirmasi_pejabat
    → verified_atasan
    → verified_jf_keuangan
    → approved_ppk_skpd
    → closed
```

**Jika pejabat menolak:**
```
draft_oleh_pelaksana → menunggu_konfirmasi_pejabat → ditolak_pejabat
    → kembali ke draft_oleh_pelaksana (Pelaksana wajib perbaiki)
```

---

## BAGIAN III — ATURAN SISTEM YANG TIDAK BISA DILANGKAHI

Sistem SIGAP-MALUT secara teknis **memblokir** kondisi berikut tanpa pengecualian:

| No | Kondisi yang Diblokir | Alasan |
|----|----------------------|--------|
| 1 | SPJ Kondisi B yang belum dikonfirmasi pejabat **tidak bisa** naik ke tahap verifikasi JF | Akuntabilitas pejabat wajib terpenuhi terlebih dahulu |
| 2 | Pelaksana **tidak bisa** mengubah isi draft SPJ setelah pejabat menyetujui | Mencegah manipulasi pasca-persetujuan |
| 3 | Pejabat **tidak bisa** menyetujui SPJ tanpa membuka dan membaca isinya | Sistem mencatat durasi baca minimum sebelum tombol setujui aktif |
| 4 | Status "menunggu_konfirmasi_pejabat" **tidak bisa** melewati batas waktu tanpa tindakan | Sistem kirim reminder otomatis H-2, H-1, dan hari-H deadline |
| 5 | Persetujuan digital pejabat **tidak bisa** dihapus atau diubah setelah diberikan | Audit trail bersifat immutable |
| 6 | SPJ **tidak bisa** diproses jika bukti pengeluaran tidak diupload | Kelengkapan dokumen adalah syarat minimum |

---

## BAGIAN IV — KETENTUAN NOTIFIKASI OTOMATIS

Sistem SIGAP-MALUT wajib mengirimkan notifikasi otomatis pada kondisi berikut:

| Kondisi | Penerima Notifikasi | Isi Notifikasi |
|---------|---------------------|----------------|
| Draft SPJ Kondisi B selesai dibuat Pelaksana | Pejabat yang namanya tercantum | "Ada draft SPJ atas nama Anda menunggu konfirmasi" |
| Belum dikonfirmasi dalam 2 hari kerja | Pejabat + Atasan langsungnya | Reminder pertama |
| Belum dikonfirmasi dalam 3 hari kerja | Pejabat + Atasan + Sekretaris | Reminder terakhir — eskalasi |
| Pejabat menolak SPJ | Pelaksana pembuat draft | "SPJ ditolak — silakan perbaiki dan ajukan ulang" |
| SPJ disetujui pejabat | Pelaksana + JF/Kasubag | "SPJ telah dikonfirmasi pejabat — masuk antrian verifikasi" |
| SPJ disahkan PPK-SKPD | Pelaksana + Pejabat | "SPJ telah disahkan dan SPM telah diterbitkan" |

---

## BAGIAN V — AUDIT TRAIL YANG WAJIB DICATAT

Setiap aksi dalam proses SPJ — baik Kondisi A maupun Kondisi B — wajib dicatat dalam tabel `audit_log` dengan atribut minimum berikut:

| Atribut | Keterangan |
|---------|------------|
| `waktu` | Timestamp aksi dilakukan |
| `user_id` | NIP/ID pengguna yang melakukan aksi |
| `role` | Jabatan pengguna saat aksi |
| `aksi` | create_draft / submit / confirm / reject / verify / approve / reject |
| `entity_id` | ID dokumen SPJ yang bersangkutan |
| `nama_pejabat_spj` | Nama pejabat yang namanya tercantum dalam SPJ |
| `status_sebelum` | Status dokumen sebelum aksi |
| `status_sesudah` | Status dokumen setelah aksi |
| `ip_address` | Alamat IP perangkat yang digunakan |
| `user_agent` | Informasi perangkat/browser |
| `catatan` | Keterangan tambahan jika ada penolakan |

> **Prinsip immutability:** Audit trail tidak boleh dapat diedit, dihapus, atau dimanipulasi oleh siapapun termasuk Super Admin. Jika ada kebutuhan koreksi, lakukan melalui entri baru dengan keterangan koreksi — bukan dengan mengubah entri lama.

---

## BAGIAN VI — PEMBAGIAN TANGGUNG JAWAB

### 6.1 Tanggung Jawab Pelaksana (Kondisi B)

- Menyiapkan dokumen SPJ dengan benar dan lengkap berdasarkan bukti yang diserahkan pejabat
- Mengupload seluruh bukti pengeluaran yang diterima dari pejabat
- Menginformasikan kepada pejabat jika ada kekurangan bukti atau ketidaksesuaian data
- **Tidak bertanggung jawab** atas kebenaran isi SPJ jika pejabat telah menyetujui

### 6.2 Tanggung Jawab Pejabat (Kondisi B)

- Menyerahkan **seluruh bukti pengeluaran asli** kepada Pelaksana
- **Wajib memeriksa** draft SPJ yang disiapkan Pelaksana sebelum menyetujui
- **Bertanggung jawab penuh** atas kebenaran isi SPJ setelah memberikan persetujuan digital
- Tidak dapat menyangkal atau mengalihkan tanggung jawab kepada Pelaksana setelah menyetujui
- Jika menemukan kesalahan, **wajib menolak** dan meminta Pelaksana memperbaiki — bukan menyetujui lalu komplain kemudian

### 6.3 Tanggung Jawab JF / Kasubag / Kepala Bidang

- Memverifikasi kesesuaian dokumen SPJ dengan sub-modul, kegiatan, dan anggaran yang berlaku
- Memastikan SPJ Kondisi B sudah memiliki status `dikonfirmasi_pejabat` sebelum diverifikasi
- **Menolak** jika SPJ belum dikonfirmasi pejabat — meskipun secara teknis lolos

### 6.4 Tanggung Jawab JF Penata Usahaan Keuangan dan PPK-SKPD

- Memverifikasi dan mengesahkan SPJ dari seluruh unit berdasarkan kebenaran dokumen dan kesesuaian DPA
- Memastikan seluruh SPJ yang masuk sudah melewati tahap konfirmasi pejabat dan verifikasi atasan
- Menerbitkan SPM hanya untuk SPJ yang sudah lengkap dan sah

---

## BAGIAN VII — IMPLEMENTASI TEKNIS DI SIGAP-MALUT

### 7.1 Field Tambahan pada Tabel `spj` di Database

```sql
spj (
  id                    SERIAL PRIMARY KEY,
  nomor_spj             VARCHAR(50) NOT NULL,
  jenis_kondisi         ENUM('mandiri', 'delegasi') NOT NULL,
  dibuat_oleh           INTEGER REFERENCES users(id),     -- Pelaksana pembuat
  atas_nama_pejabat     INTEGER REFERENCES users(id),     -- Pejabat yang namanya tercantum
  status                ENUM(
                          'draft_oleh_pelaksana',
                          'menunggu_konfirmasi_pejabat',
                          'dikonfirmasi_pejabat',
                          'ditolak_pejabat',
                          'verified_atasan',
                          'verified_jf_keuangan',
                          'approved_ppk_skpd',
                          'closed',
                          'rejected'
                        ) DEFAULT 'draft_oleh_pelaksana',
  konfirmasi_pejabat_at TIMESTAMPTZ,                      -- Waktu pejabat menyetujui
  konfirmasi_pejabat_ip VARCHAR(45),                       -- IP perangkat pejabat
  catatan_penolakan     TEXT,                              -- Jika ditolak pejabat
  deadline_konfirmasi   DATE,                              -- Batas waktu konfirmasi (3 hari kerja)
  total_nilai           DECIMAL(15,2),
  dpa_kegiatan          VARCHAR(100),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
)
```

### 7.2 Logika Bisnis (Business Rules)

```javascript
// Rule 1: SPJ Kondisi B tidak bisa submit sebelum dikonfirmasi pejabat
if (spj.jenis_kondisi === 'delegasi' && spj.status !== 'dikonfirmasi_pejabat') {
  throw new Error('SPJ ini memerlukan konfirmasi pejabat sebelum dapat diproses.');
}

// Rule 2: Setelah pejabat konfirmasi, Pelaksana tidak bisa ubah isi
if (spj.status === 'dikonfirmasi_pejabat' && actor.id === spj.dibuat_oleh) {
  throw new Error('SPJ yang sudah dikonfirmasi pejabat tidak dapat diubah.');
}

// Rule 3: Reminder otomatis jika belum dikonfirmasi dalam 2 hari kerja
if (hariKerja(now, spj.created_at) >= 2 && spj.status === 'menunggu_konfirmasi_pejabat') {
  kirimNotifikasi(spj.atas_nama_pejabat, 'reminder_konfirmasi_spj');
  kirimNotifikasi(atasanPejabat(spj.atas_nama_pejabat), 'eskalasi_spj_pending');
}

// Rule 4: Audit trail immutable — tidak ada UPDATE pada tabel audit_log
// Hanya INSERT yang diperbolehkan
```

### 7.3 Tampilan Dashboard per Jabatan

| Jabatan | Yang Terlihat Terkait SPJ |
|---------|--------------------------|
| Pelaksana | SPJ yang ia buat (mandiri + delegasi), status masing-masing |
| Pejabat (Kadis/Sekretaris/Kabid/dll) | Notifikasi SPJ atas namanya yang menunggu konfirmasi + tombol Setujui/Tolak |
| JF / Kasubag | Antrian SPJ yang sudah dikonfirmasi pejabat → menunggu verifikasi teknis |
| JF Keuangan | Antrian SPJ yang sudah diverifikasi atasan → menunggu verifikasi keuangan |
| PPK-SKPD | Antrian SPJ yang sudah diverifikasi JF Keuangan → menunggu pengesahan + SPM |
| Sekretaris | Ringkasan status semua SPJ di seluruh Sekretariat |
| Kepala Bidang | Ringkasan status semua SPJ di bidangnya |
| Kepala Dinas | Ringkasan agregat realisasi SPJ seluruh unit (tanpa detail individu) |

---

## BAGIAN VIII — KETENTUAN KHUSUS PER UNIT

### 8.1 Sekretariat

- Pejabat yang SPJ-nya dibuat Pelaksana: Sekretaris, Kasubag, JF Perencana, JF Penata Usahaan Keuangan, PPK-SKPD, PPK, Bendahara (jika mendapat honor/perdin selain tugasnya)
- SPJ dari seluruh jabatan di Sekretariat diverifikasi melalui: JF Penata Usahaan Keuangan → PPK-SKPD

### 8.2 Bidang Ketersediaan, Distribusi, dan Konsumsi

- Pejabat yang SPJ-nya dibuat Pelaksana: Kepala Bidang, JF di masing-masing Bidang
- SPJ dari Bidang diteruskan ke Sekretariat untuk diverifikasi: JF Penata Usahaan Keuangan → PPK-SKPD
- Bidang **tidak memiliki** PPK-SKPD atau Bendahara sendiri

### 8.3 UPTD Balai Pengawasan Mutu dan Keamanan Pangan

- Pejabat yang SPJ-nya dibuat Pelaksana: Kepala UPTD, Kepala Subbagian Tata Usaha, Kepala Seksi Manajemen Mutu, Kepala Seksi Manajemen Teknis, JF UPTD
- SPJ dari UPTD diteruskan ke Sekretariat untuk diverifikasi: JF Penata Usahaan Keuangan → PPK-SKPD
- UPTD **tidak memiliki** PPK-SKPD atau Bendahara sendiri

---

## CATATAN AKHIR

Dokumen ini merupakan pedoman teknis dan regulasi untuk pembangunan dan pengembangan fitur SPJ dalam sistem SIGAP-MALUT. Seluruh ketentuan dalam dokumen ini wajib diimplementasikan sebelum fitur SPJ dapat digunakan dalam lingkungan produksi.

Mekanisme ini memastikan bahwa:
1. Praktik nyata di lapangan tetap dapat berjalan (Pelaksana membantu pembuatan dokumen)
2. Akuntabilitas pejabat tetap terjaga penuh (konfirmasi dan persetujuan digital wajib)
3. Audit trail lengkap dan tidak dapat dimanipulasi (dasar pertanggungjawaban hukum)
4. Tidak ada SPJ yang dapat diproses tanpa sepengetahuan pejabat yang bersangkutan

---

*Dokumen 38 — SIGAP-MALUT — Dinas Pangan Provinsi Maluku Utara — 5 April 2026*
