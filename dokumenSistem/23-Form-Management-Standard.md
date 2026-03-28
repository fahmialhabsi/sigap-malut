---
judul: "Standar Wajib Pengelolaan Form & CRUD — Sistem Aplikasi Pemerintahan"
kode_dokumen: "23-Form-Management-Standard"
versi: "1.0"
tanggal: "21 Maret 2026"
penyusun: "Tim Pengembang SIGAP-MALUT"
status: "Wajib Diterapkan — Production Standard"
referensi:
  - "03-dashboard-uiux.md"
  - "05-Dashboard-Template-Standar.md"
  - "14-Role-Service-Requirements-Matrix.md"
  - "17-Keamanan-Informasi-Lengkap.md"
  - "20-Testing-Strategy.md"
  - "Permenpan RB No. 15 Tahun 2022 (Manajemen Perkantoran Elektronik)"
  - "Peraturan BSSN No. 4 Tahun 2021 (Pedoman Keamanan Siber)"
  - "SNI ISO/IEC 27001:2022 (Sistem Manajemen Keamanan Informasi)"
  - "WCAG 2.1 Level AA (Aksesibilitas Web)"
  - "SPBE — PP No. 95 Tahun 2018"
---

# 23 — Standar Wajib Pengelolaan Form & CRUD
## Sistem Aplikasi Pemerintahan SIGAP-MALUT

---

## PENDAHULUAN

Dokumen ini menetapkan **standar wajib** pengelolaan form input, tampilan data, form edit, dan operasi CRUD (Create, Read, Update, Delete) pada sistem aplikasi pemerintahan SIGAP-MALUT.

Standar ini berlandaskan:
- Praktik terbaik pengembangan sistem pemerintahan nasional (SPBE, e-Government)
- Standar keamanan informasi (BSSN, ISO 27001)
- Aksesibilitas digital (WCAG 2.1)
- Kebutuhan audit dan akuntabilitas institusi pemerintah

Seluruh pengembang, reviewer kode, dan penguji sistem **wajib** mematuhi standar ini sebelum fitur apapun dinyatakan selesai (definition of done).

---

## BAB 1 — STANDAR FORM INPUT (CREATE)

### 1.1 Struktur Form Wajib

Setiap form input pada sistem pemerintahan **wajib** memiliki komponen berikut:

| Komponen | Wajib | Keterangan |
|----------|-------|-----------|
| Judul form + konteks | ✅ | Nama modul, nomor surat/agenda jika ada |
| Label field yang jelas | ✅ | Gunakan bahasa Indonesia baku, bukan kode teknis |
| Tanda field wajib (*)  | ✅ | Semua field required ditandai `*` merah |
| Placeholder/hint text  | ✅ | Contoh format input (misal: "YYYY-MM-DD" atau "Contoh: NIP 19800101...") |
| Pesan error per field (inline) | ✅ | Ditampilkan tepat di bawah field yang salah |
| Ringkasan error di atas form | ✅ | Summary semua field bermasalah untuk aksesibilitas |
| Tombol submit dengan label jelas | ✅ | "Simpan", "Kirim", "Ajukan" — bukan hanya "Submit" |
| Tombol batal / kembali | ✅ | Selalu ada opsi keluar tanpa simpan |
| Konfirmasi sebelum submit (modal) | ✅ | Khusus data penting/workflow berdampak |
| Notifikasi sukses/gagal (toast) | ✅ | Non-blocking, informatif, ada durasi tampil |
| Loading/spinner saat proses | ✅ | Tombol disabled + indikator proses |
| Breadcrumb navigasi | ✅ | Menunjukkan posisi: Dashboard > Modul > Tambah Data |

### 1.2 Validasi Input — Lapisan Pertama (Frontend)

**Semua validasi frontend bersifat UX enhancement, BUKAN pengganti validasi backend.**

#### 1.2.1 Validasi Wajib per Tipe Field

| Tipe Field | Validasi Frontend Wajib |
|-----------|------------------------|
| Text | required, minLength, maxLength, karakter tidak diizinkan (regex) |
| Number / Integer | required, min, max, type numeric, tidak negatif jika relevan |
| Decimal / Currency | format angka Indonesia (titik sebagai pemisah ribuan, koma sebagai desimal) |
| Date | format YYYY-MM-DD, tidak boleh tanggal masa depan jika tidak relevan, validasi tanggal valid |
| Email | format RFC 5322 (`type="email"` + regex tambahan) |
| Telepon/HP | format nomor Indonesia (08xx atau +62xx), 10–15 digit |
| NIP (Pegawai) | 18 digit, hanya angka |
| NPWP | 15–16 digit, format XX.XXX.XXX.X-XXX.XXX |
| Kode Pos | 5 digit angka |
| File Upload | tipe file diizinkan (whitelist), ukuran maksimal (misal: 5MB untuk dokumen) |
| Password | minimal 8 karakter, kombinasi huruf besar+kecil+angka+simbol, **tidak ditampilkan plain** |
| Textarea | maxLength sesuai spesifikasi field, strip HTML tags |
| Dropdown / Select | nilai wajib dari daftar yang valid (tidak terima nilai arbitrary) |
| Checkbox / Radio | wajib dipilih jika required |
| Tanggal Rentang | tanggal mulai ≤ tanggal selesai |

#### 1.2.2 Implementasi Validasi

```
WAJIB menggunakan:
- React Hook Form (v7+) ATAU Formik (v2+) — BUKAN manual useState per field
- Yup ATAU Zod sebagai schema validasi — BUKAN if-else manual
- Validasi dipicu: onBlur (per field) + onSubmit (keseluruhan)
```

**Contoh Pola Standar (React Hook Form + Zod):**
```jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  nip: z.string().length(18, "NIP harus 18 digit").regex(/^\d+$/, "NIP hanya angka"),
  nama: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
});

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(schema),
  mode: "onBlur",
});
```

### 1.3 Sanitasi Input (Keamanan)

```
WAJIB menerapkan:
1. Trim whitespace pada semua input string sebelum dikirim ke API
2. Strip karakter HTML/script dari input bebas (textarea, notes):
   - Gunakan DOMPurify: DOMPurify.sanitize(input)
3. Encode special characters untuk input yang akan ditampilkan kembali
4. TIDAK PERNAH render input user via dangerouslySetInnerHTML
5. Semua field dropdown/select: validasi nilai ada di enum yang diizinkan
```

**Referensi:** OWASP Top 10 — A03:2021 Injection

### 1.4 Aturan Master Data dan Foreign Key

Sesuai `04-Dokumen Integrasi Sistem`:

```
WAJIB:
- Referensi pegawai: SELALU dari lookup/dropdown ke master_pegawai (NIP + nama)
  → BUKAN input teks bebas nama pegawai
- Referensi komoditas: SELALU dari dropdown ke master_komoditas
- Referensi wilayah: SELALU dari master_wilayah (kode BPS resmi)
- Referensi anggaran: SELALU dari dropdown ke master_rekening/akun
- DILARANG: input duplikasi data yang sudah ada di master data
```

### 1.5 Interaksi Form — UX Wajib

```
WAJIB:
1. Auto-save draft setiap 30 detik untuk form panjang (> 10 field)
2. Peringatan "Ada perubahan belum disimpan" saat user navigasi pergi (useBeforeUnload)
3. Field dependensi: tampilkan/sembunyikan field berdasarkan nilai field lain (conditional fields)
4. Auto-kalkulasi field turunan (contoh: lama_cuti = tanggal_selesai - tanggal_mulai)
5. Lookup otomatis: saat input NIP, nama, jabatan, unit otomatis terisi dari master
6. Timestamp otomatis: created_by, created_at diisi sistem — TIDAK dari input user
```

---

## BAB 2 — STANDAR FORM TAMPILAN DATA (READ/LIST)

### 2.1 Tabel Data Wajib

| Fitur | Wajib | Keterangan |
|-------|-------|-----------|
| Kolom dinamis dari definisi modul | ✅ | Kolom ditentukan dari FIELDS_*.csv, bukan hardcoded |
| Pagination server-side | ✅ | Default 20 baris per halaman, ada pilihan 10/25/50/100 |
| Sorting per kolom | ✅ | Klik header kolom untuk sort A-Z / Z-A |
| Pencarian global (search) | ✅ | Cari di semua kolom yang relevan, bukan hanya username/email |
| Filter per field | ✅ | Filter berdasarkan status, tanggal, kategori, bidang |
| Total record count | ✅ | "Menampilkan X-Y dari Z total data" |
| Aksi per baris (View/Edit/Delete) | ✅ | Tombol aksi sesuai izin role user yang login |
| Aksi massal (bulk) | ✅ | Pilih multiple → Hapus / Export / Ubah status |
| Export ke Excel/CSV/PDF | ✅ | Wajib ada tombol export, berlaku untuk data yang sedang difilter |
| Empty state | ✅ | Tampilkan pesan informatif saat tidak ada data |
| Loading skeleton | ✅ | Gunakan skeleton loading, bukan spinner kosong |
| Kolom timestamp | ✅ | Tampilkan dibuat_oleh, dibuat_pada, diedit_oleh, diedit_pada |

### 2.2 Kolom Wajib pada Setiap Tabel Data

```
Setiap tabel data WAJIB memiliki kolom:
- No. urut (auto, bukan primary key)
- [Kolom bisnis utama modul — dinamis dari definisi]
- Status (Draft / Diajukan / Diverifikasi / Disetujui / Selesai / Ditolak)
- Dibuat Oleh (username + unit kerja)
- Dibuat Pada (tanggal dan waktu — format: DD/MM/YYYY HH:mm WIB)
- Aksi (tombol View | Edit | Hapus)
```

### 2.3 Pembatasan Data per Role

```
WAJIB:
- Query backend SELALU memfilter data berdasarkan unit_kerja user yang login
  (kecuali super_admin dan kepala_dinas yang punya akses semua)
- Frontend TIDAK BOLEH menampilkan tombol aksi (Edit/Hapus) 
  jika role user tidak punya izin sesuai Role-Module Matrix (doc 09)
- Data "Terbatas" dan "Rahasia" (sesuai doc 17) wajib dimasking di tabel
  (contoh: password hash tidak ditampilkan, salary hanya terlihat oleh Bendahara)
```

---

## BAB 3 — STANDAR FORM DETAIL (VIEW/READ ONLY)

### 3.1 Halaman Detail Wajib

| Komponen | Wajib |
|----------|-------|
| Heading dengan nama/nomor dokumen | ✅ |
| Semua field data ditampilkan dengan label | ✅ |
| Status dokumen (badge warna) | ✅ |
| Timeline/riwayat perubahan | ✅ |
| Informasi audit: dibuat/diedit oleh siapa, kapan | ✅ |
| Tombol Cetak / Export PDF | ✅ |
| Tombol Edit (jika role diizinkan) | ✅ |
| Tombol Ajukan/Approval (jika giliran role ini) | ✅ |
| Tombol Kembali ke daftar | ✅ |

### 3.2 Tampilan Field Sensitif

```
WAJIB:
- Nomor rekening: tampilkan hanya 4 digit terakhir (mask: ****1234)
- Password: TIDAK PERNAH ditampilkan, bahkan hash sekalipun
- Data kesehatan/survey (PII): hanya tampilkan agregat/anonim untuk non-admin
- Gaji/tunjangan: hanya tampil untuk role Bendahara dan Kepala Dinas
```

---

## BAB 4 — STANDAR FORM EDIT (UPDATE)

### 4.1 Aturan Form Edit

```
WAJIB:
1. Form edit hanya bisa dibuka jika status dokumen = Draft atau Dikembalikan
   (bukan status Diajukan/Disetujui/Selesai)
2. Tampilkan nilai saat ini sebagai nilai awal (pre-populated)
3. Tampilkan perbedaan perubahan (diff) jika memungkinkan
4. Field yang tidak boleh diedit (immutable): created_at, created_by, nomor_urut auto
5. Validasi sama dengan form create
6. Setelah simpan: tampilkan notifikasi + redirect ke halaman detail, bukan kembali ke form
7. Akses edit dibatasi: HANYA pemilik data (created_by) atau atasan langsung
   kecuali Super Admin
```

### 4.2 Versioning dan Audit Edit

```
WAJIB:
- Setiap perubahan (edit) WAJIB dicatat pada audit_log dengan:
  - field yang diubah
  - nilai sebelum
  - nilai sesudah
  - diubah oleh (user_id, nama, role)
  - timestamp perubahan
- Tidak boleh overwrite data tanpa audit trail
```

---

## BAB 5 — STANDAR OPERASI HAPUS (DELETE)

### 5.1 Prinsip Soft Delete

```
WAJIB:
- Sistem pemerintahan TIDAK BOLEH melakukan hard delete (DELETE FROM tabel)
  pada data operasional yang berpotensi dibutuhkan untuk audit
- Semua penghapusan wajib menggunakan soft delete (is_deleted = true / deleted_at = now())
- Data yang di-soft-delete masih tersimpan di database tetapi tersembunyi dari tampilan normal
- Super Admin dapat melihat dan memulihkan data yang dihapus (restore)
- Hard delete hanya diizinkan untuk: data test/dummy, data duplikat yang sudah terverifikasi,
  dengan approval minimal 2 orang (4-eyes principle)
```

### 5.2 Alur Konfirmasi Hapus

```
WAJIB:
1. Tombol Hapus HANYA muncul jika:
   - Status = Draft (belum diajukan)
   - Role user = pemilik data ATAU Super Admin
2. Klik tombol Hapus → Open Modal Konfirmasi (BUKAN window.confirm() browser)
3. Modal konfirmasi WAJIB menampilkan:
   - Nama/identitas data yang akan dihapus
   - Peringatan akibat penghapusan
   - Tombol "Ya, Hapus" (merah) + "Batal" (abu-abu)
4. Setelah konfirmasi: loading state → API call → toast notifikasi → refresh tabel
5. Hapus massal: wajib tampilkan jumlah item yang akan dihapus
```

---

## BAB 6 — STANDAR WORKFLOW DAN APPROVAL

### 6.1 Status Dokumen dan Transisi Status

Berdasarkan `08-Workflow-Specification.md`:

```
Siklus Status Wajib:
Draft → Diajukan → Diverifikasi → Disetujui → Selesai → Diarsipkan
                 ↘ Dikembalikan ↗ (pada semua tahap bisa dikembalikan ke Draft)
```

| Status | Warna Badge | Siapa yang Bisa Aksi | Aksi yang Tersedia |
|--------|------------|---------------------|-------------------|
| Draft | Abu-abu | Staf/Operator pemilik | Edit, Hapus, Ajukan |
| Diajukan | Biru | Atasan/Reviewer | Verifikasi, Kembalikan |
| Diverifikasi | Kuning | Kepala Bidang/Sekretaris | Setujui, Kembalikan |
| Disetujui | Hijau | Kepala Dinas | Finalisasi, Kembalikan |
| Selesai | Hijau Tua | — | Cetak, Export |
| Dikembalikan | Merah | Pemilik data | Edit ulang, Ajukan kembali |
| Diarsipkan | Hitam | Super Admin saja | Tidak bisa diedit |

### 6.2 Form Kirim Alasan Penolakan

```
WAJIB:
- Saat "Kembalikan" atau "Tolak": form modal WAJIB meminta alasan
  (textarea, minimal 20 karakter, tidak boleh kosong)
- Alasan tersimpan di approval_log dan ditampilkan pada riwayat dokumen
- Pemohon mendapat notifikasi (minimal: in-app notification)
```

---

## BAB 7 — STANDAR KEAMANAN FORM

### 7.1 Proteksi Sisi Frontend

```
WAJIB:
1. CSRF Protection: 
   - Untuk semua request POST/PUT/PATCH/DELETE
   - Gunakan CSRF token yang dirotasi per sesi
   
2. Rate limiting submit:
   - Disable tombol submit setelah diklik sampai respons diterima
   - Implementasi debounce minimal 500ms pada search/auto-complete
   
3. Input sanitasi:
   - Semua input string: DOMPurify.sanitize() sebelum render
   - TIDAK PERNAH: innerHTML = userInput atau dangerouslySetInnerHTML
   - Strip tag HTML dari textarea jika output adalah text (bukan rich text)
   
4. File Upload:
   - Whitelist tipe file: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png']
   - Validasi ukuran maksimal di frontend (konfirmasi di backend)
   - TIDAK accept .exe, .php, .sh, .bat, .js, atau file executable apapun
   - Scan file upload dengan antivirus/ClamAV di backend
   
5. Sensitive data:
   - Password: gunakan type="password", tidak pernah log ke console
   - Token: simpan di memory (bukan localStorage) untuk aksi sensitif
   - HAPUS semua console.log() yang mengekspos credentials sebelum production
```

### 7.2 Proteksi Sisi Backend (Konfirmasi dari Frontend)

```
WAJIB (backend harus enforce, tidak bergantung frontend saja):
1. Validasi seluruh input di backend (tidak percaya data dari frontend)
2. Parameterized query (ORM/prepared statement) — BUKAN string concatenation SQL
3. Verifikasi kepemilikan data sebelum edit/delete:
   WHERE id = :id AND (created_by = :userId OR role = 'super_admin')
4. Rate limiting per IP + per user di semua endpoint write
5. Ukuran payload maksimal (misal: 10MB per request)
```

---

## BAB 8 — STANDAR AKSESIBILITAS FORM

Berdasarkan **WCAG 2.1 Level AA** (wajib untuk layanan publik pemerintah):

```
WAJIB:
1. Setiap input field WAJIB memiliki <label> yang terhubung via htmlFor/id
2. Error message WAJIB menggunakan aria-describedby untuk screen reader
3. Mandatory field: aria-required="true"
4. Invalid field: aria-invalid="true" saat ada error
5. Urutan fokus keyboard (Tab key) wajib logis dari atas ke bawah
6. Tombol submit harus bisa diaktifkan via Enter key
7. Modal konfirmasi: fokus otomatis ke tombol "Batal" saat dibuka (safer default)
8. Warna tidak boleh satu-satunya pembeda status error (harus ada ikon + teks)
9. Contrast ratio minimum 4.5:1 untuk teks normal, 3:1 untuk teks besar
10. Placeholder jangan dijadikan satu-satunya label (accessibility failure)
```

---

## BAB 9 — STANDAR NOTIFIKASI DAN FEEDBACK

```
WAJIB menggunakan komponen Toast/Snackbar (react-hot-toast atau react-toastify):

DILARANG: window.alert(), window.confirm(), window.prompt()
   → Memblokir UI thread, tidak bisa dikustomisasi, tidak accessible

WAJIB:
- Notifikasi sukses: hijau, auto-dismiss 3 detik, posisi kanan atas
- Notifikasi error: merah, auto-dismiss 5 detik, ada tombol tutup manual
- Notifikasi warning: kuning, auto-dismiss 4 detik
- Loading: skeleton/spinner di area yang diload, bukan overlay seluruh halaman
- Konfirmasi hapus: WAJIB modal React (bukan browser confirm())
- Progress upload file: progress bar persentase

Pesan error WAJIB dalam Bahasa Indonesia yang informatif:
- ❌ Buruk: "Error 500" atau "Something went wrong"
- ✅ Baik: "Gagal menyimpan data. Pastikan semua field wajib sudah diisi."
- ✅ Baik: "Sesi Anda sudah berakhir. Silakan login kembali."
```

---

## BAB 10 — STANDAR KOMPONEN FORM PEMERINTAHAN

### 10.1 Komponen Wajib Tersedia

Sistem SIGAP-MALUT **wajib** memiliki komponen reusable berikut:

| Komponen | Deskripsi | Status Implementasi |
|----------|-----------|---------------------|
| `<FormField>` | Wrapper: label + input + error message | ❌ Belum ada |
| `<FormSection>` | Grouping field terkait dengan judul seksi | ❌ Belum ada |
| `<ConfirmModal>` | Modal konfirmasi aksi berbahaya | ❌ Belum ada |
| `<ToastNotification>` | Sistem notifikasi non-blocking | ❌ Belum ada |
| `<DataTable>` | Tabel dengan sort, filter, pagination, export | ⚠️ Partial (BaseTable — kolom hardcoded) |
| `<StatusBadge>` | Badge status dengan warna sesuai alur workflow | ⚠️ Partial |
| `<FileUploadField>` | Upload file dengan validasi tipe+ukuran | ❌ Belum ada |
| `<LookupField>` | Autocomplete dari data master | ❌ Belum ada |
| `<DateRangeField>` | Input rentang tanggal dengan validasi | ❌ Belum ada |
| `<NumberField>` | Input angka dengan format Indonesia | ❌ Belum ada |
| `<ApprovalBar>` | Toolbar aksi approve/reject/kembalikan | ❌ Belum ada |
| `<AuditTimeline>` | Riwayat perubahan dokumen | ⚠️ Ada tapi tidak terpasang di form detail |
| `<BreadcrumbNav>` | Navigasi posisi halaman | ❌ Belum ada |
| `<ExportButton>` | Tombol export PDF/Excel generik | ⚠️ Ada tapi fungsi kosong |
| `<DirtyFormGuard>` | Peringatan saat ada perubahan belum disimpan | ❌ Belum ada |

### 10.2 Pola Form Dinamis Berbasis Definisi CSV

Sesuai arsitektur SIGAP-MALUT yang schema-driven:

```
WAJIB:
- Setiap modul memiliki FIELDS_*.csv yang mendefinisikan:
  field_name, field_label, field_type, is_required, validation, dropdown_options, help_text
  
- Form CRUD wajib di-generate secara dinamis dari definisi CSV ini
  (bukan hardcoded per modul)
  
- Perubahan field cukup di CSV — tidak perlu ubah kode frontend
  
- Komponen GenericForm wajib mendukung semua tipe field:
  text, number, decimal, date, datetime, email, phone, textarea, 
  select, multiselect, radio, checkbox, file, hidden, autocomplete
```

---

## BAB 11 — STANDAR EXPORT DAN CETAK

```
WAJIB:
1. Export Excel: menggunakan SheetJS (xlsx library)
   - Nama file: [nama_modul]_[tanggal_export].xlsx
   - Sheet pertama: data lengkap dengan header kolom
   - Sheet kedua: metadata (tanggal export, di-export oleh, filter yang aktif)
   
2. Export PDF: menggunakan jsPDF + jsPDF-AutoTable ATAU Puppeteer
   - Header dokumen: logo instansi, nama dinas, alamat, nomor dokumen
   - Footer: halaman X dari Y, tanggal cetak, tanda tangan digital (opsional)
   - Watermark untuk dokumen internal/terbatas
   
3. Export CSV: data mentah untuk integrasi
   - Encoding UTF-8 BOM (untuk kompatibilitas Excel Windows)
   
4. Cetak langsung: print stylesheet Tailwind/CSS khusus print
   - Sembunyikan navigasi, sidebar, tombol saat cetak
   - Tampilkan QR code atau barcode nomor dokumen untuk verifikasi
   
5. Kontrol akses export:
   - Export data wajib tercatat di audit_log (siapa, kapan, filter apa, berapa baris)
   - Role tertentu bisa dibatasi hanya export data miliknya (unit kerja sendiri)
```

---

## BAB 12 — STANDAR PERFORMA FORM

```
TARGET:
- Form load time (termasuk fetch master data): < 2 detik
- Submit response time: < 3 detik
- Tabel load 1000 baris: < 3 detik (dengan pagination server-side)

WAJIB:
1. Lazy load komponen form yang besar (React.lazy + Suspense)
2. Debounce search/filter minimum 300ms
3. Virtualisasi tabel jika > 500 baris (react-window atau react-virtual)
4. Cache master data lookup (komoditas, pegawai, wilayah) — jangan fetch ulang setiap render
5. Optimistic UI: tampilkan perubahan di UI sebelum konfirmasi server (dengan rollback jika gagal)
```

---

## BAB 13 — CHECKLIST DEFINITION OF DONE (FORM)

Sebuah halaman Form CREATE dinyatakan **selesai** jika semua item di bawah ini ✅:

### 13.1 Checklist Form Create
```
□ Library validasi (React Hook Form + Zod) digunakan
□ Semua field required ditandai dengan *
□ Pesan error inline muncul per field saat validasi gagal
□ Tipe input sesuai data (email, number, date — bukan semuanya text)
□ Input sanitasi: DOMPurify untuk textarea, trim semua string
□ Loading state: tombol submit disabled + spinner saat proses
□ Notifikasi sukses: toast hijau setelah berhasil simpan
□ Notifikasi gagal: toast merah dengan pesan informatif
□ Redirect ke halaman detail/list setelah berhasil
□ Breadcrumb navigasi ada
□ Tombol Batal tersedia
□ Peringatan perubahan belum disimpan (useBeforeUnload) ada
□ Master data diisi dari dropdown/lookup (bukan input teks bebas)
□ console.log() credentials TIDAK ADA
□ Test: unit test validasi schema, integration test submit sukses + gagal
```

### 13.2 Checklist Tabel Data List
```
□ Kolom dinamis dari definisi modul (bukan hardcoded)
□ Pagination server-side ada
□ Sorting per kolom ada
□ Pencarian/filter berfungsi
□ Total record count ditampilkan
□ Tombol aksi (View/Edit/Hapus) sesuai role yang login
□ Data difilter berdasarkan unit_kerja user
□ Field sensitif dimasking
□ Tombol Export (Excel/PDF) ada dan berfungsi
□ Empty state ditampilkan jika tidak ada data
□ Loading skeleton ada
□ Test: unit test filter/sort, integration test RBAC per role
```

### 13.3 Checklist Form Edit
```
□ Data saat ini pre-populated di form
□ Field immutable (nomor, created_by, created_at) tidak bisa diedit
□ Hanya bisa dibuka jika status = Draft atau Dikembalikan
□ Validasi sama dengan form create
□ Perubahan tercatat dalam audit_log (field, nilai sebelum, nilai sesudah)
□ Konfirmasi modal sebelum simpan perubahan
□ Test: audit log tercatat, RBAC edit hanya pemilik/admin
```

### 13.4 Checklist Hapus
```
□ Soft delete (bukan hard delete)
□ Tombol Hapus hanya muncul jika status = Draft + role diizinkan
□ Modal konfirmasi React (bukan window.confirm())
□ Modal menampilkan nama/identitas data yang dihapus
□ Penghapusan tercatat dalam audit_log
□ Test: data masih ada di DB dengan is_deleted=true, tidak tampil di list
```

---

## BAB 14 — TEMUAN GAP DAN RENCANA PERBAIKAN

### 14.1 Gap Kritis yang Teridentifikasi (per 21 Maret 2026)

| No | Gap | Severity | Lokasi | Prioritas |
|----|-----|----------|--------|-----------|
| G-01 | Kolom Password ditampilkan di tabel UserManagementPage | 🔴 KRITIS | `UserManagementPage.jsx` baris 95 | P0 — Fix sekarang |
| G-02 | `console.log` mengekspos token JWT + user data | 🔴 KRITIS | `BKTPGDCreatePage.jsx` | P0 — Fix sekarang |
| G-03 | Tidak ada library validasi (gunakan if-else manual) | 🔴 TINGGI | Semua form | P1 |
| G-04 | Semua notifikasi pakai `window.alert()` — memblokir UI | 🔴 TINGGI | Semua form | P1 |
| G-05 | `BaseTable` kolom hardcoded username/email untuk semua 80+ modul | 🔴 TINGGI | `BaseTable.jsx` | P1 |
| G-06 | Tidak ada sanitasi input (DOMPurify) | 🟠 TINGGI | Semua form create/edit | P1 |
| G-07 | Pagination tidak ada di tabel manapun | 🟠 TINGGI | `BaseTable.jsx`, `BksModulePage.jsx` | P1 |
| G-08 | Master data hardcoded di form (komoditas, pasar, kabupaten) | 🟠 TINGGI | `BDSHRGCreatePage`, `BKTPGDCreatePage` | P1 |
| G-09 | Tidak ada konfirmasi modal React untuk delete | 🟠 SEDANG | `BaseTable.jsx` | P2 |
| G-10 | Email field menggunakan `type="text"` bukan `type="email"` | 🟠 SEDANG | `UserManagementPage.jsx` | P1 |
| G-11 | Tidak ada pesan error inline per field | 🟠 SEDANG | Semua form | P1 |
| G-12 | Tidak ada loading state saat proses hapus | 🟡 SEDANG | `BaseTable.jsx` | P2 |
| G-13 | Form edit hanya ada untuk 3 modul (`EditPage.jsx`) | 🟠 TINGGI | `EditPage.jsx` | P1 |
| G-14 | Hard delete via API (bukan soft delete) | 🟠 TINGGI | `BaseTable.jsx` | P1 |
| G-15 | Tidak ada peringatan perubahan belum disimpan (unsaved changes) | 🟡 SEDANG | Semua form panjang | P2 |
| G-16 | JWT token di localStorage (rentan XSS) | 🟠 TINGGI | `api.js` | P2 |
| G-17 | Audit log edit tidak mencatat nilai sebelum/sesudah | 🟠 TINGGI | Backend controller | P1 |
| G-18 | Export PDF/Excel fungsi kosong (utils/export.js) | 🟠 TINGGI | `utils/export.js` | P1 |
| G-19 | Tidak ada soft delete di tabel DB (tidak ada kolom is_deleted) | 🟠 TINGGI | Database schema | P1 |
| G-20 | Tidak ada `<BreadcrumbNav>` di halaman form manapun | 🟡 RENDAH | Semua halaman | P2 |

### 14.2 Perbaikan P0 (Wajib Segera — Risiko Keamanan)

**G-01: Hapus kolom Password dari UserManagementPage:**
```jsx
// Hapus baris ini:
{ Header: "Password", accessor: "password" },
// Dan pada data mapping:
password: u.password || ""  // → Hapus field ini
```

**G-02: Hapus console.log credentials di BKTPGDCreatePage:**
```js
// Hapus baris-baris ini:
console.log("localStorage token:", localStorage.getItem("token"));
console.log("localStorage user:", localStorage.getItem("user"));
```

### 14.3 Roadmap Perbaikan

| Fase | Timeline | Perbaikan |
|------|----------|-----------|
| **Fase 0 — Keamanan Kritis** | Minggu ini | G-01, G-02 |
| **Fase 1 — Fondasi Form** | Minggu 1-2 | Install RHF+Zod+DOMPurify+react-hot-toast, perbaiki G-03, G-04, G-06, G-10, G-11 |
| **Fase 2 — Tabel & CRUD** | Minggu 2-3 | Perbaiki BaseTable (G-05, G-07, G-09), soft delete (G-14, G-19), EditPage universal (G-13) |
| **Fase 3 — Data & Master** | Minggu 3-4 | Lookup dari API (G-08), audit trail edit (G-17), export PDF/Excel (G-18) |
| **Fase 4 — UX & Akses** | Minggu 4-5 | Breadcrumb (G-20), unsaved changes guard (G-15), token security (G-16) |

---

## LAMPIRAN A — DAFTARINSTALASI LIBRARY WAJIB

```bash
# Validasi form
npm install react-hook-form @hookform/resolvers zod

# Sanitasi input
npm install dompurify
npm install --save-dev @types/dompurify

# Notifikasi toast
npm install react-hot-toast

# Export Excel
npm install xlsx

# Export PDF
npm install jspdf jspdf-autotable

# Konfirmasi modal (gunakan komponen internal, tidak perlu library)
# Sudah cukup dengan modal React + Tailwind yang ada
```

---

## LAMPIRAN B — TEMPLATE KOMPONEN STANDAR

### B.1 FormField (Komponen Wajib)

```jsx
// src/components/form/FormField.jsx
export function FormField({ label, required, error, children, helpText }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="wajib diisi">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
```

### B.2 ConfirmModal (Komponen Wajib)

```jsx
// src/components/form/ConfirmModal.jsx
export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200" autoFocus>
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
            {loading ? "Memproses..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

*Dokumen ini wajib ditinjau ulang setiap triwulan atau saat ada perubahan regulasi keamanan informasi pemerintah yang relevan.*

*Seluruh tim pengembang wajib menandatangani pernyataan telah membaca dan memahami standar ini sebelum mulai coding modul apapun.*
